import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@reviewsphere/db';
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
          studentProfile: { select: { name: true } },
        },
      });

      const token = signToken({ sub: user.id, role: user.role });
      res.status(201).json({
        user: { id: user.id, email: user.email, role: user.role, name: user.studentProfile?.name, createdAt: user.createdAt },
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
        mentorProfile: { select: { name: true, title: true, isVerified: true } },
      },
    });

    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role, name: user.mentorProfile?.name, createdAt: user.createdAt },
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
        studentProfile: { select: { name: true } },
        mentorProfile: { select: { name: true } },
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const name = user.studentProfile?.name ?? user.mentorProfile?.name ?? '';
    const token = signToken({ sub: user.id, role: user.role });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, name, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    next(err);
  }
}
