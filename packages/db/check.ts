import { prisma } from '@reviewsphere/db'; 
prisma.studentProfile.findMany().then(res => {
  console.log(res.map(r => ({ id: r.id, hasAvatar: !!r.avatarUrl, len: r.avatarUrl?.length })));
}).catch(console.error).finally(() => prisma.$disconnect());
