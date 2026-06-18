import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@reviewsphere/db';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function listStacks(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stacks = await prisma.stack.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(stacks);
  } catch (err) {
    next(err);
  }
}

export async function createStack(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const existing = await prisma.stack.findUnique({ where: { name: parsed.data.name } });
    if (existing) {
      res.status(409).json({ message: 'A stack with that name already exists' });
      return;
    }

    const stack = await prisma.stack.create({ data: parsed.data });
    res.status(201).json(stack);
  } catch (err) {
    next(err);
  }
}

export async function updateStack(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id']);

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const existing = await prisma.stack.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Stack not found' });
      return;
    }

    const stack = await prisma.stack.update({ where: { id }, data: parsed.data });
    res.json(stack);
  } catch (err) {
    next(err);
  }
}

export async function deleteStack(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id']);

    const existing = await prisma.stack.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Stack not found' });
      return;
    }

    await prisma.stack.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
