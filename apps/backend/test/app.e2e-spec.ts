import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AIService } from '../src/ai/ai.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aiService: AIService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    aiService = app.get<AIService>(AIService);
  });

  afterAll(async () => {
    // Cleanup em ordem correta
    if (aiService) {
      aiService.onModuleDestroy();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
    // Pequeno delay para garantir cleanup completo
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
