/** Local E2E fixture, deliberately unavailable in production. Never starts from the application. */
import { createServer } from 'node:http';
import { createTutorHandler } from '../server/tutor/http';
import { SqliteTutorStore } from '../server/tutor/store';
import { testProvider } from '../src/features/tutor/test-support';

if (process.env.FORGE_TUTOR_TEST_SERVER !== '1') throw new Error('Ten serwer jest przeznaczony wyłącznie do testów E2E.');
process.env.FORGE_TEACHER_ACCESS_CODE = 'test-forge-access-code-at-least-24';
process.env.FORGE_TUTOR_MODEL = 'E2E-provider-double';
process.env.FORGE_ALLOWED_ORIGINS = 'http://localhost:4173,http://127.0.0.1:4173';
const store = new SqliteTutorStore('.forge-test/e2e.sqlite');
const handler = createTutorHandler({ store: () => store, provider: testProvider(), availability: () => true, kind: () => 'sqlite' });
const server = createServer(async (req, res) => {
  try {
    let body = ''; for await (const chunk of req) { body += String(chunk); if (body.length > 4_000_000) throw new Error('too large'); }
    const response = await handler(new Request(`http://localhost:4181${req.url}`, { method: req.method ?? 'GET',
      headers: Object.fromEntries(Object.entries(req.headers).filter((x): x is [string, string] => typeof x[1] === 'string')),
      ...(req.method === 'POST' ? { body } : {}) }));
    res.writeHead(response.status, Object.fromEntries(response.headers.entries())); res.end(await response.text());
  } catch { res.writeHead(500); res.end(); }
});
server.listen(4181, '127.0.0.1', () => process.stdout.write('Tutor E2E fixture ready at http://127.0.0.1:4181\n'));
const close = () => server.close(() => { store.close(); process.exit(0); });
process.on('SIGTERM', close); process.on('SIGINT', close);
