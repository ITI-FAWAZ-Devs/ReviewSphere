import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { Prisma } from '@reviewsphere/db';
import { z } from 'zod';

const DEFAULT_LIMIT = 10;

type SortField = 'rating' | 'price' | 'availability';

const sortMap: Record<SortField, Prisma.MentorProfileOrderByWithRelationInput> = {
  rating: { averageRating: 'desc' },
  price: { hourlyRate: 'asc' },
  availability: { isAvailableNow: 'desc' },
};

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getUTCDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCDay();
}

const availabilityBlockSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start_time format (HH:MM)'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end_time format (HH:MM)'),
});

const availabilityArraySchema = z.array(availabilityBlockSchema);

export async function listMentors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      stack,
      sort_by,
      keyword,
      page,
      min_price,
      max_price,
      available,
      top_rated,
      verified,
    } = req.query as Record<string, string | undefined>;

    // ── Pagination ────────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limit = DEFAULT_LIMIT;
    const offset = (pageNum - 1) * limit;

    // ── WHERE clause (built dynamically) ─────────────────────────────
    const where: Prisma.MentorProfileWhereInput = {};

    // Only return verified mentors by default; unverified get a badge if
    // the team lead decides to show them — flip the condition then.
    // For now: show all mentors but expose isVerified on the payload so
    // the frontend can render a "Unverified" badge if needed.

    if (stack) {
      where.stackId = stack;
    }

    if (keyword) {
      const term = `%${keyword}%`;
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { title: { contains: keyword, mode: 'insensitive' } },
        { bio: { contains: keyword, mode: 'insensitive' } },
      ];
      void term; // suppress unused-var warning; Prisma uses `contains` not raw LIKE
    }

    if (min_price || max_price) {
      where.hourlyRate = {
        ...(min_price ? { gte: parseFloat(min_price) } : {}),
        ...(max_price ? { lte: parseFloat(max_price) } : {}),
      };
    }

    if (available === 'true') {
      where.isAvailableNow = true;
    }

    if (top_rated === 'true') {
      where.averageRating = { gte: 4.5 };
    }

    if (verified === 'true') {
      where.isVerified = true;
    }

    // ── ORDER BY ──────────────────────────────────────────────────────
    const orderBy: Prisma.MentorProfileOrderByWithRelationInput =
      sort_by && sort_by in sortMap
        ? sortMap[sort_by as SortField]
        : { createdAt: 'desc' }; // default: newest first

    // ── QUERY ─────────────────────────────────────────────────────────
    const [mentors, totalCount] = await Promise.all([
      prisma.mentorProfile.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true },
          },
          stack: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: mentors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMentor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id']);

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true } },
        stack: { select: { id: true, name: true } },
      },
    });

    if (!mentor) {
      res.status(404).json({ message: 'Mentor not found' });
      return;
    }

    res.json(mentor);
  } catch (err) {
    next(err);
  }
}

export async function getMentorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const mentorId = String(req.params['id']);
    const dateStr = req.query['date'] as string; // Expect YYYY-MM-DD

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({ message: 'Invalid or missing date parameter. Format must be YYYY-MM-DD' });
      return;
    }

    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      res.status(404).json({ message: 'Mentor not found' });
      return;
    }

    // Derive day of week
    const dayOfWeek = getUTCDayOfWeek(dateStr);

    // Fetch availability blocks
    const availabilities = await prisma.mentorAvailability.findMany({
      where: {
        mentorId,
        dayOfWeek,
      },
    });

    // Fetch scheduled ReviewSessions for that day
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const bookedSessions = await prisma.reviewSession.findMany({
      where: {
        mentorId,
        status: 'Scheduled',
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const slots: { start_time: string; end_time: string }[] = [];

    // Generate 45-minute slots for each availability block
    for (const block of availabilities) {
      const startMin = parseTimeToMinutes(block.startTime);
      const endMin = parseTimeToMinutes(block.endTime);

      let current = startMin;
      while (current + 45 <= endMin) {
        const slotStartMin = current;
        const slotEndMin = current + 45;

        // Form full DateTime objects in UTC to check overlap with booked sessions
        const slotStartHours = Math.floor(slotStartMin / 60);
        const slotStartMinutes = slotStartMin % 60;
        const slotStartsAt = new Date(Date.UTC(year, month - 1, day, slotStartHours, slotStartMinutes));

        const slotEndHours = Math.floor(slotEndMin / 60);
        const slotEndMinutes = slotEndMin % 60;
        const slotEndsAt = new Date(Date.UTC(year, month - 1, day, slotEndHours, slotEndMinutes));

        // Check overlap
        const hasOverlap = bookedSessions.some((session) => {
          return slotStartsAt < session.endsAt && slotEndsAt > session.startsAt;
        });

        if (!hasOverlap) {
          slots.push({
            start_time: formatMinutesToTime(slotStartMin),
            end_time: formatMinutesToTime(slotEndMin),
          });
        }

        current += 45;
      }
    }

    res.json({
      mentor_id: mentorId,
      date: dateStr,
      slots,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMentorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const mentorId = req.params['id'];

    // Ownership check
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: req.user.sub },
    });

    if (!mentorProfile || mentorProfile.id !== mentorId) {
      res.status(403).json({ message: 'Forbidden: you can only update your own availability' });
      return;
    }

    const parsed = availabilityArraySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const blocks = parsed.data;

    // Execute in transaction: delete then re-insert
    await prisma.$transaction([
      prisma.mentorAvailability.deleteMany({
        where: { mentorId },
      }),
      prisma.mentorAvailability.createMany({
        data: blocks.map((b) => ({
          mentorId,
          dayOfWeek: b.day_of_week,
          startTime: b.start_time,
          endTime: b.end_time,
        })),
      }),
    ]);

    const updatedAvailabilities = await prisma.mentorAvailability.findMany({
      where: { mentorId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json(updatedAvailabilities);
  } catch (err) {
    next(err);
  }
}
