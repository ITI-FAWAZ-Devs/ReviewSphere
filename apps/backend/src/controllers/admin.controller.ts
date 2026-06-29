import { Request, Response, NextFunction } from 'express';
import { prisma } from '@reviewsphere/db';
import { z } from 'zod';

const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED']),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']),
});

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '10', keyword = '' } = req.query as Record<string, string | undefined>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (keyword) {
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { studentProfile: { name: { contains: keyword, mode: 'insensitive' } } },
        { mentorProfile: { name: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          studentProfile: { select: { name: true } },
          mentorProfile: { select: { name: true, title: true, isVerified: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      name: u.studentProfile?.name ?? u.mentorProfile?.name ?? '',
      title: u.mentorProfile?.title ?? null,
      isVerified: u.mentorProfile?.isVerified ?? null,
    }));

    res.status(200).json({
      data: formattedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const parsed = updateUserStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, email: true, status: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const parsed = updateUserRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { role } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Ensure profiles exist if changing to a specific role
    if (role === 'STUDENT' && !user.studentProfile) {
      // Create a default student profile
      const name = user.mentorProfile?.name || 'Student';
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          name,
        },
      });
    } else if (role === 'MENTOR' && !user.mentorProfile) {
      // Find a default stack
      const firstStack = await prisma.stack.findFirst();
      if (!firstStack) {
        res.status(400).json({ message: 'No tech stacks available to assign default mentor profile. Please create a stack first.' });
        return;
      }

      const name = user.studentProfile?.name || 'New Mentor';
      await prisma.mentorProfile.create({
        data: {
          userId: user.id,
          stackId: firstStack.id,
          name,
          title: 'New Mentor',
          bio: 'Please update your bio in your profile settings.',
        },
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}
