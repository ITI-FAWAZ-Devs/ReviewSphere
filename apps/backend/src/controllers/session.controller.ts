import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { z } from 'zod';

const bookSessionSchema = z.object({
  mentor_id: z.string().min(1, 'mentor_id is required'),
  start_time: z.string().min(1, 'start_time is required'),
  end_time: z.string().min(1, 'end_time is required'),
  description: z.string().optional(),
});

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

    const session = await prisma.reviewSession.create({
      data: {
        mentorId: mentor_id,
        studentId: student.id,
        startsAt: new Date(start_time),
        endsAt: new Date(end_time),
      },
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}
