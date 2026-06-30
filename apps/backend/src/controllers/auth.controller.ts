import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, Prisma } from '@reviewsphere/db';
import { signToken } from '../lib/jwt.js';

const studentRegisterSchema = z.object({
  role: z.literal('STUDENT'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const mentorRegisterSchema = z.object({
  role: z.literal('MENTOR'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  title: z.string().min(1, 'Title is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  stackId: z.string().min(1, 'Stack is required'),
});

const registerSchema = z.discriminatedUnion('role', [studentRegisterSchema, mentorRegisterSchema]);

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  title: z.string().min(1, 'Title is required').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  hourly_rate: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  stack_id: z.string().min(1, 'Stack is required').optional(),
  stackId: z.string().min(1, 'Stack is required').optional(),
  avatar_url: z.string().optional(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password, role, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'STUDENT') {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          studentProfile: {
            create: { name },
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          studentProfile: { select: { name: true, avatarUrl: true } },
        },
      });

      const token = signToken({ sub: user.id, role: user.role });
      res.status(201).json({
        user: { id: user.id, email: user.email, role: user.role, name: user.studentProfile?.name, avatarUrl: user.studentProfile?.avatarUrl, createdAt: user.createdAt },
        token,
      });
      return;
    }

    // MENTOR
    const { title, bio, stackId } = parsed.data;

    const stack = await prisma.stack.findUnique({ where: { id: stackId } });
    if (!stack) {
      res.status(404).json({ message: 'Stack not found' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'MENTOR',
        mentorProfile: {
          create: { name, title, bio, stackId },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        mentorProfile: { select: { name: true, title: true, isVerified: true, avatarUrl: true } },
      },
    });

    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role, name: user.mentorProfile?.name, avatarUrl: user.mentorProfile?.avatarUrl, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: { select: { name: true, avatarUrl: true } },
        mentorProfile: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (user.status === 'BLOCKED') {
      res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const name = user.studentProfile?.name ?? user.mentorProfile?.name ?? '';
    const avatarUrl = user.studentProfile?.avatarUrl ?? user.mentorProfile?.avatarUrl ?? null;
    const token = signToken({ sub: user.id, role: user.role });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, name, avatarUrl, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: {
          select: { name: true, avatarUrl: true },
        },
        mentorProfile: {
          select: {
            id: true,
            name: true,
            title: true,
            bio: true,
            avatarUrl: true,
            isVerified: true,
            isAvailableNow: true,
            averageRating: true,
            hourlyRate: true,
            stackId: true,
            stack: {
              select: { id: true, name: true, description: true },
            },
            availabilities: {
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const name = user.studentProfile?.name ?? user.mentorProfile?.name ?? '';
    const avatarUrl = user.studentProfile?.avatarUrl ?? user.mentorProfile?.avatarUrl ?? null;
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name,
      avatarUrl,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      mentorProfile: user.mentorProfile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const userId = req.user.sub;
    const role = req.user.role;

    if (role === 'STUDENT') {
      const { name } = parsed.data;
      if (!name) {
        res.status(400).json({ message: 'Name is required for student profile update' });
        return;
      }

      const updated = await prisma.studentProfile.update({
        where: { userId },
        data: {
          name,
          ...(parsed.data.avatar_url !== undefined ? { avatarUrl: parsed.data.avatar_url } : {}),
        },
      });

      res.json(updated);
      return;
    }

    if (role === 'MENTOR') {
      const { title, bio } = parsed.data;
      const hourlyRate = parsed.data.hourlyRate ?? parsed.data.hourly_rate;
      const stackId = parsed.data.stackId ?? parsed.data.stack_id;

      const dataToUpdate: Prisma.MentorProfileUpdateInput = {};
      if (title !== undefined) dataToUpdate.title = title;
      if (bio !== undefined) dataToUpdate.bio = bio;
      if (hourlyRate !== undefined) dataToUpdate.hourlyRate = hourlyRate;
      if (parsed.data.avatar_url !== undefined) dataToUpdate.avatarUrl = parsed.data.avatar_url;
      if (stackId !== undefined) {
        // Verify stack exists first
        const stack = await prisma.stack.findUnique({ where: { id: stackId } });
        if (!stack) {
          res.status(404).json({ message: 'Stack not found' });
          return;
        }
        dataToUpdate.stack = { connect: { id: stackId } };
      }

      const updated = await prisma.mentorProfile.update({
        where: { userId },
        data: dataToUpdate,
        include: {
          stack: { select: { id: true, name: true, description: true } },
        },
      });

      res.json(updated);
      return;
    }

    res.status(400).json({ message: 'Unsupported user role' });
  } catch (err) {
    next(err);
  }
}
