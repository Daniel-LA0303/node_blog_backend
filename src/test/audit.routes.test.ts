import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../middleware/checkRoleAuth', () => ({
  __esModule: true,
  default: (req: any, res: any, next: any) => next(),
}));

import app from '../app';
import { AuditLog } from '../models/AuditLog';

const URL = '/api/audit-log/get-audit-logs';

let mongoServer: MongoMemoryServer;

// Crea un log válido; cada prueba sobreescribe solo lo que le importa
const makeLog = (overrides: {
  category?: string;
  name?: string;
  email?: string;
  createdAt?: Date;
} = {}) => ({
  category: overrides.category ?? 'AUTH',
  action: 'TEST_ACTION',
  actor: {
    user: new mongoose.Types.ObjectId(),
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? 'test@x.com',
  },
  createdAt: overrides.createdAt ?? new Date(),
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe(`GET ${URL}`, () => {
  it('filtra por search en nombre/email del actor', async () => {
    await AuditLog.create([
      makeLog({ name: 'Ana Garcia', email: 'ana@x.com' }),
      makeLog({ name: 'Luis Perez', email: 'luis@x.com' }),
    ]);

    const res = await request(app).get(URL).query({ search: 'garcia' });

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].actor.name).toBe('Ana Garcia');
  });

  it('pagina correctamente', async () => {
    await AuditLog.create(
      Array.from({ length: 5 }, (_, i) =>
        makeLog({ name: `User${i}`, email: `u${i}@x.com`, createdAt: new Date(2024, 0, i + 1) })
      )
    );

    const res = await request(app).get(URL).query({ page: 2, limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.meta).toMatchObject({
      total: 5,
      page: 2,
      limit: 2,
      totalPages: 3,
    });
  });
});