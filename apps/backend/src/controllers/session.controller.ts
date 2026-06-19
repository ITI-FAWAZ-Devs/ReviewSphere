import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { z } from 'zod';

const bookSessionSchema = z.object({
  mentor_id: z.string().min(1, 'mentor_id is required'),
  start_time: z.string().min(1, 'start_time is required'),
  end_time: z.string().min(1, 'end_time is required'),
  description: z.string().optional(),
});

export async function getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await prisma.reviewSession.findMany({
      where: {
        OR: [
          { mentor: { userId: req.user!.sub } },
          { student: { userId: req.user!.sub } },
        ],
      },
      include: {
        mentor: {
          include: {
            user: { select: { email: true } },
            stack: { select: { name: true } },
          },
        },
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { startsAt: 'desc' },
    });

    res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['Scheduled', 'Completed', 'Canceled']),
});

export async function updateSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const session = await prisma.reviewSession.findUnique({
      where: { id },
      select: { mentorId: true, studentId: true },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    const [mentor, student] = await Promise.all([
      prisma.mentorProfile.findUnique({ where: { id: session.mentorId }, select: { userId: true } }),
      prisma.studentProfile.findUnique({ where: { id: session.studentId }, select: { userId: true } }),
    ]);

    if (mentor?.userId !== req.user!.sub && student?.userId !== req.user!.sub) {
      res.status(403).json({ message: 'Forbidden: you are not part of this session' });
      return;
    }

    const updated = await prisma.reviewSession.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

const submitFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().min(1, 'feedback is required'),
});

export async function submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const parsed = submitFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const session = await prisma.reviewSession.findUnique({
      where: { id },
      select: { status: true, studentId: true },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    if (session.status !== 'Completed') {
      res.status(400).json({ message: 'Feedback can only be submitted for completed sessions' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: session.studentId },
      select: { userId: true },
    });

    if (student?.userId !== req.user!.sub) {
      res.status(403).json({ message: 'Forbidden: only the student can submit feedback' });
      return;
    }

    const updated = await prisma.reviewSession.update({
      where: { id },
      data: {
        rating: parsed.data.rating,
        feedback: parsed.data.feedback,
      },
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function bookSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = bookSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { mentor_id, start_time, end_time } = parsed.data;

    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentor_id } });
    if (!mentor) {
      res.status(404).json({ message: 'Mentor not found' });
      return;
    }

    if (mentor.userId === req.user!.sub) {
      res.status(400).json({ message: 'Cannot book a session with yourself' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found' });
      return;
    }

    const startsAt = new Date(start_time);
    const endsAt = new Date(end_time);

    const overlapping = await prisma.reviewSession.findFirst({
      where: {
        mentorId: mentor_id,
        status: 'Scheduled',
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (overlapping) {
      res.status(400).json({ message: 'This slot is already booked. Please choose another time.' });
      return;
    }

    const session = await prisma.reviewSession.create({
      data: {
        mentorId: mentor_id,
        studentId: student.id,
        startsAt,
        endsAt,
      },
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}
