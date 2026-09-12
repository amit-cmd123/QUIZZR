import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Quizzr database...');

  // 1. Clean existing records
  await prisma.answer.deleteMany({});
  await prisma.score.deleteMany({});
  await prisma.cheatLog.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create demo Host User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const host = await prisma.user.create({
    data: {
      username: 'host_demo',
      email: 'host@quizzr.com',
      passwordHash: hashedPassword,
    },
  });
  console.log(`Demo host created: ${host.username} (${host.email})`);

  // 3. Create Quiz 1: Web Development Masterclass
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Web Dev Masterclass',
      description: 'Test your knowledge on React, Vite, CSS Grid, and core web architecture concepts.',
      category: 'Technology',
      hostId: host.id,
    },
  });

  // Questions for Quiz 1
  const q1Data = [
    {
      text: 'Which hook should be used to memoize the result of an expensive calculation in React?',
      timer: 20,
      points: 100,
      options: ['useCallback', 'useMemo', 'useRef', 'useEffect'],
      correctIdx: 1, // useMemo
    },
    {
      text: 'What does Vite use under the hood for extremely fast module bundling during development?',
      timer: 15,
      points: 150,
      options: ['Webpack', 'Rollup', 'esbuild', 'Babel'],
      correctIdx: 2, // esbuild
    },
    {
      text: 'Which CSS layout system is specifically optimized for two-dimensional grids (rows & columns)?',
      timer: 20,
      points: 100,
      options: ['Flexbox', 'CSS Grid', 'Float layouts', 'Position absolute'],
      correctIdx: 1, // CSS Grid
    },
    {
      text: 'What is the primary role of standard Socket.io communication in full-stack applications?',
      timer: 15,
      points: 200,
      options: [
        'Secure password hashing',
        'Database query caching',
        'Low-latency bi-directional event transmission',
        'RESTful API routing'
      ],
      correctIdx: 2, // Low-latency bi-directional event transmission
    }
  ];

  for (const q of q1Data) {
    const question = await prisma.question.create({
      data: {
        quizId: quiz1.id,
        text: q.text,
        timer: q.timer,
        points: q.points,
      },
    });

    const options = [];
    for (const optText of q.options) {
      const opt = await prisma.option.create({
        data: {
          questionId: question.id,
          text: optText,
        },
      });
      options.push(opt);
    }

    const correctOption = options[q.correctIdx];
    await prisma.question.update({
      where: { id: question.id },
      data: { correctOptionId: correctOption.id },
    });
  }

  // 4. Create Quiz 2: General Knowledge & Gaming Trivia
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Gaming & General Trivia',
      description: 'A rapid-fire speed trivia challenge testing gaming lore and general science history.',
      category: 'General',
      hostId: host.id,
    },
  });

  const q2Data = [
    {
      text: 'Which video game holds the record for the best-selling game of all time as of 2026?',
      timer: 15,
      points: 100,
      options: ['Grand Theft Auto V', 'Tetris', 'Minecraft', 'Wii Sports'],
      correctIdx: 2, // Minecraft
    },
    {
      text: 'Who is recognized as the father of modern evolutionary biology for his natural selection theories?',
      timer: 20,
      points: 100,
      options: ['Gregor Mendel', 'Charles Darwin', 'Albert Einstein', 'Louis Pasteur'],
      correctIdx: 1, // Charles Darwin
    }
  ];

  for (const q of q2Data) {
    const question = await prisma.question.create({
      data: {
        quizId: quiz2.id,
        text: q.text,
        timer: q.timer,
        points: q.points,
      },
    });

    const options = [];
    for (const optText of q.options) {
      const opt = await prisma.option.create({
        data: {
          questionId: question.id,
          text: optText,
        },
      });
      options.push(opt);
    }

    const correctOption = options[q.correctIdx];
    await prisma.question.update({
      where: { id: question.id },
      data: { correctOptionId: correctOption.id },
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
