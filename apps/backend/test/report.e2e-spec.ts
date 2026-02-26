import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AIService } from '../src/ai/ai.service';

interface ReportResponse {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  category?: string | null;
  priority?: string | null;
  technicalSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

describe('Report API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aiService: AIService;

  beforeAll(async () => {
    process.env.GROQ_API_KEY =
      process.env.GROQ_API_KEY || 'test_key_for_e2e_testing';
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgresql://admin:admin@localhost:5432/zeladoria_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableCors({
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    aiService = app.get<AIService>(AIService);
  });

  afterAll(async () => {
    await prisma.report.deleteMany({});
    if (aiService) {
      await aiService.onModuleDestroy();
    }
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.report.deleteMany({});
  });

  describe('POST /report', () => {
    it('should create a new report successfully', async () => {
      const createDto = {
        title: 'Buraco na via',
        description: 'Tem um buraco grande na rua causando acidentes',
        location: 'Rua Principal, 123',
      };

      const response = await request(app.getHttpServer())
        .post('/report')
        .send(createDto)
        .expect(201);

      const body = response.body as ReportResponse;

      expect(body).toHaveProperty('id');
      expect(body.title).toBe(createDto.title);
      expect(body.description).toBe(createDto.description);
      expect(body.location).toBe(createDto.location);
      expect(body.status).toBe('OPEN');
      expect(body).toHaveProperty('category');
      expect(body).toHaveProperty('priority');
      expect(body).toHaveProperty('technicalSummary');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    it('should reject report with invalid data', async () => {
      const invalidDto = {
        title: 'AB',
        description: 'Short',
      };

      await request(app.getHttpServer())
        .post('/report')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject report without required fields', async () => {
      const incompleteDto = {
        title: 'Apenas título',
      };

      await request(app.getHttpServer())
        .post('/report')
        .send(incompleteDto)
        .expect(400);
    });

    it('should handle optional location field', async () => {
      const dtoWithoutLocation = {
        title: 'Problema sem localização',
        description: 'Descrição do problema urbano sem localização específica',
      };

      const response = await request(app.getHttpServer())
        .post('/report')
        .send(dtoWithoutLocation)
        .expect(201);

      const body = response.body as ReportResponse;

      expect(body).toHaveProperty('id');
      expect(body.location).toBeNull();
    });
  });

  describe('GET /report', () => {
    it('should return empty array when no reports exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/report')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all reports ordered by createdAt desc', async () => {
      const report1 = await prisma.report.create({
        data: {
          title: 'Primeiro relatório',
          description: 'Descrição do primeiro problema',
          status: 'OPEN',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const report2 = await prisma.report.create({
        data: {
          title: 'Segundo relatório',
          description: 'Descrição do segundo problema',
          status: 'OPEN',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/report')
        .expect(200);

      const body = response.body as ReportResponse[];

      expect(body).toHaveLength(2);
      expect(body[0].id).toBe(report2.id);
      expect(body[1].id).toBe(report1.id);
    });
  });

  describe('GET /report/:id', () => {
    it('should return single report by id', async () => {
      const report = await prisma.report.create({
        data: {
          title: 'Relatório específico',
          description: 'Descrição do relatório',
          status: 'OPEN',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/report/${report.id}`)
        .expect(200);

      const body = response.body as ReportResponse;

      expect(body.id).toBe(report.id);
      expect(body.title).toBe(report.title);
    });

    it('should return null for non-existent id', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .get(`/report/${fakeId}`)
        .expect(200);

      // Para IDs inexistentes, a API responde 200 com corpo vazio
      expect(response.body).toEqual({});
    });
  });

  describe('CORS', () => {
    it('should have CORS headers configured', async () => {
      const response = await request(app.getHttpServer())
        .options('/report')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate title min length (3 chars)', async () => {
      await request(app.getHttpServer())
        .post('/report')
        .send({
          title: 'AB',
          description: 'Descrição válida com mais de 10 caracteres',
        })
        .expect(400);
    });

    it('should validate description min length (10 chars)', async () => {
      await request(app.getHttpServer())
        .post('/report')
        .send({
          title: 'Título válido',
          description: 'Curto',
        })
        .expect(400);
    });

    it('should strip unknown fields (whitelist: true)', async () => {
      const response = await request(app.getHttpServer())
        .post('/report')
        .send({
          title: 'Relatório com campo extra',
          description: 'Descrição válida para teste de validação',
          unknownField: 'Este campo não existe no DTO',
        })
        .expect(201);

      expect(response.body).not.toHaveProperty('unknownField');
    });
  });
});
