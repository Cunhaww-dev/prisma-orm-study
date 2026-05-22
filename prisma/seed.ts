import { prisma } from '@/prisma';

async function seed() {
  await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      },
      {
        name: 'Jane Doe',
        email: 'janedoe@gmail.com',
      },
      {
        name: 'Lucas da cunha fabri',
        email: 'lucasda@gmail.com',
      },
    ],
  });
}

seed().then(() => {
  console.log('Seed completed');
  prisma.$disconnect();
});
