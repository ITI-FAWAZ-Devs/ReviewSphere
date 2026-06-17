import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { Prisma } from '@reviewsphere/db';

const DEFAULT_LIMIT = 10;

type SortField = 'rating' | 'price' | 'availability';

const sortMap: Record<SortField, Prisma.MentorProfileOrderByWithRelationInput> = {
  rating: { averageRating: 'desc' },
  price: { hourlyRate: 'asc' },
  availability: { isAvailableNow: 'desc' },
};

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
