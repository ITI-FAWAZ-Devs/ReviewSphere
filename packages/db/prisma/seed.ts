import { prisma } from '../src/index.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Clearing old data...');
  // Delete in proper order to respect FK constraints
  await prisma.mentorProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stack.deleteMany();

  console.log('Creating tech stacks...');
  const reactStack = await prisma.stack.create({ data: { name: 'React', description: 'React Frontend Development' } });
  const pythonStack = await prisma.stack.create({ data: { name: 'Python', description: 'Python Backend & Data Science' } });
  const nodeStack = await prisma.stack.create({ data: { name: 'Node.js', description: 'Node.js Backend Development' } });
  const tsStack = await prisma.stack.create({ data: { name: 'TypeScript', description: 'TypeScript Development' } });
  const awsStack = await prisma.stack.create({ data: { name: 'AWS', description: 'Amazon Web Services Cloud' } });
  const designStack = await prisma.stack.create({ data: { name: 'Design', description: 'UI/UX Design' } });

  console.log('Creating users and mentors...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Mentor 1 - Sarah Chen
  await prisma.user.create({
    data: {
      email: 'sarah.chen@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'Sarah Chen',
          title: 'SENIOR FRONTEND ARCHITECT',
          bio: 'Over 12 years of experience at Meta and Stripe. Specialized in scaling React applications and building high-performance architectures. Passionate about helping others succeed.',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
          averageRating: 4.9,
          hourlyRate: 120,
          isVerified: true,
          isAvailableNow: false,
          stackId: reactStack.id,
        },
      },
    },
  });

  // Mentor 2 - Marcus Thorne
  await prisma.user.create({
    data: {
      email: 'marcus.t@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'Marcus Thorne',
          title: 'LEAD ML ENGINEER @ GOOGLE',
          bio: 'Passionate about helping junior devs transition into AI. Expert in Python, TensorFlow, and large-scale machine learning systems.',
          avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=256&h=256',
          averageRating: 5.0,
          hourlyRate: 180,
          isVerified: true,
          isAvailableNow: false,
          stackId: pythonStack.id,
        },
      },
    },
  });

  // Mentor 3 - Elena Rodriguez
  await prisma.user.create({
    data: {
      email: 'elena.r@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'Elena Rodriguez',
          title: 'SENIOR PRODUCT DESIGNER',
          bio: 'Helping designers master Figma and build career-defining portfolios. Focused on user-centric research and modern UI patterns.',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
          averageRating: 4.8,
          hourlyRate: 95,
          isVerified: true,
          isAvailableNow: true,
          stackId: designStack.id,
        },
      },
    },
  });

  // Mentor 4 - David Kim
  await prisma.user.create({
    data: {
      email: 'david.kim@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'David Kim',
          title: 'FULLSTACK DEVELOPER',
          bio: 'Specialist in Node.js and MongoDB. I\'ve mentored 50+ students through bootcamps and helped them land their first tech roles.',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
          averageRating: 4.7,
          hourlyRate: 75,
          isVerified: true,
          isAvailableNow: true,
          stackId: nodeStack.id,
        },
      },
    },
  });

  // Mentor 5 - Sarah Jenkins (No avatar, use fallback)
  await prisma.user.create({
    data: {
      email: 'sarah.j@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'Sarah Jenkins',
          title: 'ENGINEERING MANAGER',
          bio: 'Coaching for the next generation of tech leaders. Learn how to manage teams, navigate corporate structures, and define technical strategy.',
          avatarUrl: null, // Test avatar fallback
          averageRating: 4.9,
          hourlyRate: 250,
          isVerified: true,
          isAvailableNow: false,
          stackId: tsStack.id,
        },
      },
    },
  });

  // Mentor 6 - Julian Voss
  await prisma.user.create({
    data: {
      email: 'julian.voss@example.com',
      password: defaultPassword,
      role: 'MENTOR',
      mentorProfile: {
        create: {
          name: 'Julian Voss',
          title: 'CLOUD SOLUTIONS ARCHITECT',
          bio: 'AWS certified professional. Specializing in serverless architecture, Kubernetes, and Golang backend systems at scale.',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256',
          averageRating: 5.0,
          hourlyRate: 200,
          isVerified: true,
          isAvailableNow: true,
          stackId: awsStack.id,
        },
      },
    },
  });

  // Regular Student
  await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: defaultPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          name: 'Test Student',
        },
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
