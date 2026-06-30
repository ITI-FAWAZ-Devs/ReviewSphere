import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { z } from 'zod';
import { GoogleMeetService } from '../services/google-meet.service.js';

const bookSessionSchema = z.object({
  mentor_id: z.string().min(1, 'mentor_id is required'),
  start_time: z.string().min(1, 'start_time is required'),
  end_time: z.string().min(1, 'end_time is required'),
  description: z.string().optional(),
});

export async function getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reqUser = req.user as any;
    const sessions = await prisma.reviewSession.findMany({
      where: {
        OR: [
          { mentor: { userId: reqUser.sub } },
          { student: { userId: reqUser.sub } },
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
  status: z.enum(['Scheduled', 'Completed', 'Canceled', 'Cancelled']),
  evaluationNotes: z.string().optional(),
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
      select: { mentorId: true, studentId: true, status: true },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    const [mentor, student] = await Promise.all([
      prisma.mentorProfile.findUnique({ where: { id: session.mentorId }, select: { userId: true } }),
      prisma.studentProfile.findUnique({ where: { id: session.studentId }, select: { userId: true } }),
    ]);

    const reqUser = req.user as any;
    const isAuthorized =
      mentor?.userId === reqUser.sub ||
      student?.userId === reqUser.sub ||
      reqUser.role === 'ADMIN';

    if (!isAuthorized) {
      res.status(403).json({ message: 'Forbidden: you are not authorized to update this session' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = { status: parsed.data.status };
      if (parsed.data.evaluationNotes !== undefined) {
        dataToUpdate.evaluationNotes = parsed.data.evaluationNotes;
      }

      const upd = await tx.reviewSession.update({
        where: { id },
        data: dataToUpdate,
      });

      await tx.sessionAuditLog.create({
        data: {
          sessionId: id,
          action: 'STATUS_UPDATED',
          payload: {
            oldStatus: session.status,
            newStatus: parsed.data.status,
            evaluationNotes: parsed.data.evaluationNotes,
          },
          performedBy: reqUser.sub,
        },
      });

      return upd;
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

    const reqUser = req.user as any;
    if (student?.userId !== reqUser.sub) {
      res.status(403).json({ message: 'Forbidden: only the student can submit feedback' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Save rating + feedback on the session
      const updatedSession = await tx.reviewSession.update({
        where: { id },
        data: {
          rating: parsed.data.rating,
          feedback: parsed.data.feedback,
        },
        select: { mentorId: true, rating: true, feedback: true, id: true, status: true, studentId: true, startsAt: true, endsAt: true, meetLink: true, evaluationNotes: true, createdAt: true, updatedAt: true },
      });

      // 2. Recalculate mentor's average rating across all rated completed sessions
      const ratedSessions = await tx.reviewSession.findMany({
        where: {
          mentorId: updatedSession.mentorId,
          status: 'Completed',
          rating: { not: null },
        },
        select: { rating: true },
      });

      const totalRating = ratedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0);
      const newAverage = ratedSessions.length > 0 ? totalRating / ratedSessions.length : 0;

      // 3. Persist new average on MentorProfile
      await tx.mentorProfile.update({
        where: { id: updatedSession.mentorId },
        data: { averageRating: newAverage },
      });

      return updatedSession;
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

    const reqUser = req.user as any;
    if (mentor.userId === reqUser.sub) {
      res.status(400).json({ message: 'Cannot book a session with yourself' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId: reqUser.sub } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found' });
      return;
    }

    const startsAt = new Date(start_time);
    const endsAt = new Date(end_time);

    const session = await prisma.$transaction(async (tx) => {
      // 1. Concurrency lock: row lock on MentorProfile to serialize booking for the same mentor
      await tx.$queryRaw`SELECT id FROM "MentorProfile" WHERE id = ${mentor_id} FOR UPDATE`;

      // 2. Overlap check
      const overlapping = await tx.reviewSession.findFirst({
        where: {
          mentorId: mentor_id,
          status: 'Scheduled',
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      });

      if (overlapping) {
        throw new Error('OVERLAP');
      }

      // 3. Create ReviewSession
      const sess = await tx.reviewSession.create({
        data: {
          mentorId: mentor_id,
          studentId: student.id,
          startsAt,
          endsAt,
        },
      });

      // 4. Create SessionAuditLog
      await tx.sessionAuditLog.create({
        data: {
          sessionId: sess.id,
          action: 'BOOKED',
          payload: {
            mentorId: mentor_id,
            studentId: student.id,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
          },
          performedBy: reqUser.sub,
        },
      });

      return sess;
    });

    let meetLink: string | null = null;
    try {
      const mentorWithUser = await prisma.mentorProfile.findUnique({
        where: { id: mentor_id },
        include: { user: { select: { email: true } } },
      });
      const studentWithUser = await prisma.studentProfile.findUnique({
        where: { id: student.id },
        include: { user: { select: { email: true } } },
      });

      const attendees: string[] = [];
      if (mentorWithUser?.user?.email) attendees.push(mentorWithUser.user.email);
      if (studentWithUser?.user?.email) attendees.push(studentWithUser.user.email);

      meetLink = await GoogleMeetService.createMeeting({
        sessionId: session.id,
        title: `Mentorship Session - ${mentorWithUser?.name ?? 'Mentor'} & ${studentWithUser?.name ?? 'Student'}`,
        description: `Review session booked on ReviewSphere.\nDescription: ${parsed.data.description ?? 'No description provided.'}`,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        attendees,
      });

      if (meetLink) {
        await prisma.reviewSession.update({
          where: { id: session.id },
          data: { meetLink },
        });
      }
    } catch (error) {
      console.warn('Google Meet link generation failed on bookSession. Fallback to null meetLink:', error);
    }

    const bookedSession = await prisma.reviewSession.findUnique({
      where: { id: session.id },
    });

    res.status(201).json(bookedSession ?? session);
  } catch (err: any) {
    if (err.message === 'OVERLAP') {
      res.status(409).json({ message: 'This slot is already booked. Please choose another time.' });
      return;
    }
    next(err);
  }
}

export async function getSessionAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;

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

    const reqUser = req.user as any;
    const isAuthorized =
      mentor?.userId === reqUser.sub ||
      student?.userId === reqUser.sub ||
      reqUser.role === 'ADMIN';

    if (!isAuthorized) {
      res.status(403).json({ message: 'Forbidden: you cannot view audit logs for this session' });
      return;
    }

    const logs = await prisma.sessionAuditLog.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
}

export async function getSessionMeetLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;

    const session = await prisma.reviewSession.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: { select: { email: true } },
          },
        },
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    const reqUser = req.user as any;
    const isAuthorized =
      session.mentor.userId === reqUser.sub ||
      session.student.userId === reqUser.sub ||
      reqUser.role === 'ADMIN';

    if (!isAuthorized) {
      res.status(403).json({ message: 'Forbidden: you are not authorized to view the link for this session' });
      return;
    }

    let meetLink = session.meetLink;
    if (!meetLink) {
      try {
        const attendees: string[] = [];
        if (session.mentor.user.email) attendees.push(session.mentor.user.email);
        if (session.student.user.email) attendees.push(session.student.user.email);

        meetLink = await GoogleMeetService.createMeeting({
          sessionId: session.id,
          title: `Mentorship Session - ${session.mentor.name ?? 'Mentor'} & ${session.student.name ?? 'Student'}`,
          description: `Review session booked on ReviewSphere.`,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
          attendees,
        });

        if (meetLink) {
          await prisma.reviewSession.update({
            where: { id: session.id },
            data: { meetLink },
          });
        }
      } catch (err) {
        console.warn('Google Meet link generation failed on getSessionMeetLink retry. Fallback to null meetLink:', err);
      }
    }

    res.status(200).json({ meetLink });
  } catch (err) {
    next(err);
  }
}

