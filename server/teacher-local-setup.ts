import { spawn } from 'node:child_process';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { middleware as teacher, status } from './nauczyciel';

export interface TeacherVault { read(): Promise<string | null>; save(key: string): Promise<void> }
const VAULT_RESOURCE = 'FORGE.ClaudeTeacher';
const SCRIPT = `$ErrorActionPreference='Stop'
try {
  $inputData = [Console]::In.ReadToEnd() | ConvertFrom-Json
  $null = [Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]
  $vault = New-Object Windows.Security.Credentials.PasswordVault
  if ($inputData.action -eq 'save') {
    $credential = New-Object Windows.Security.Credentials.PasswordCredential('${VAULT_RESOURCE}','Anthropic',[string]$inputData.key)
    $vault.Add($credential)
    $saved = $vault.Retrieve('${VAULT_RESOURCE}','Anthropic')
    $saved.RetrievePassword()
    if ($saved.Password -ne $inputData.key) { throw 'Verification failed' }
    [Console]::Out.Write('{"saved":true}')
  } else {
    try { $credential = $vault.Retrieve('${VAULT_RESOURCE}','Anthropic') }
    catch { if ($_.Exception.HResult -eq -2147023728 -or ($_.Exception.InnerException -and $_.Exception.InnerException.HResult -eq -2147023728)) { [Console]::Out.Write('{"key":null}'); exit 0 }; throw }
    $credential.RetrievePassword()
    [Console]::Out.Write((@{key=$credential.Password} | ConvertTo-Json -Compress))
  }
} catch { [Console]::Error.Write('Windows credential vault operation failed.'); exit 1 }
`;

/** The credential travels only through anonymous pipes, never process arguments or logs. */
function vaultCall(input: { action: 'read' | 'save'; key?: string }): Promise<{ key?: string | null; saved?: boolean }> {
  if (process.platform !== 'win32') return Promise.reject(new Error('Ten zapis wymaga magazynu poświadczeń Windows.'));
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(SCRIPT, 'utf16le').toString('base64')], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = ''; let failed = false;
    const finishError = () => { if (!failed) { failed = true; reject(new Error('Nie udało się zapisać lub odczytać klucza w magazynie poświadczeń Windows.')); } };
    const timeout = setTimeout(() => { child.kill(); finishError(); }, 12_000);
    child.stdout.on('data', (part: Buffer) => { output += part.toString('utf8'); if (output.length > 8192) { child.kill(); finishError(); } });
    child.stderr.resume(); // Never forward subprocess diagnostics that could contain a credential.
    child.on('error', () => { clearTimeout(timeout); finishError(); });
    child.stdin.on('error', finishError);
    child.on('close', code => {
      clearTimeout(timeout); if (failed) return;
      if (code !== 0) { finishError(); return; }
      try { resolve(JSON.parse(output)); } catch { finishError(); }
      output = '';
    });
    child.stdin.end(JSON.stringify(input));
  });
}

export const windowsTeacherVault: TeacherVault = {
  async read() { const result = await vaultCall({ action: 'read' }); return typeof result.key === 'string' ? result.key : null; },
  async save(key) { const result = await vaultCall({ action: 'save', key }); if (result.saved !== true) throw new Error('Magazyn Windows nie potwierdził zapisu.'); },
};

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
export function trustedLocalTeacherRequest(request: Request, remoteAddress: string | undefined): boolean {
  if (!remoteAddress || !LOOPBACK.has(remoteAddress)) return false;
  const url = new URL(request.url);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !['http:', 'https:'].includes(url.protocol)) return false;
  if (request.headers.get('host') !== url.host) return false;
  const origin = request.headers.get('origin');
  if (request.method === 'POST' && origin !== url.origin) return false;
  if (origin && origin !== url.origin) return false;
  const site = request.headers.get('sec-fetch-site');
  return !site || site === 'same-origin' || site === 'none';
}

/** Authentication-only check; the Models API does not generate a completion. */
export async function verifyClaudeKey(key: string): Promise<boolean | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models?limit=1', {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000), redirect: 'error',
    });
    await response.body?.cancel();
    return response.ok ? true : response.status === 401 || response.status === 403 ? false : null;
  } catch { return null; }
}

export function createLocalTeacherSetup(vault: TeacherVault, env: NodeJS.ProcessEnv = process.env, verify: (key: string) => Promise<boolean | null> = verifyClaudeKey) {
  let loaded: Promise<void> | undefined;
  let nextVaultRead = 0;
  let nextVerification = 0;
  let verificationVersion = 0;
  let persisted = false;
  let storageError: string | null = null;
  let saving = false;
  let providerVerified = false;
  const load = () => loaded ??= (async () => {
    if (Date.now() >= nextVaultRead && !saving) {
      try {
        const saved = await vault.read(); persisted = !!saved;
        if (saved && !env.ANTHROPIC_API_KEY && !env.ANTHROPIC_AUTH_TOKEN) env.ANTHROPIC_API_KEY = saved;
        storageError = null;
        nextVaultRead = saved ? Number.POSITIVE_INFINITY : Date.now() + 30_000;
      } catch {
        storageError = 'Magazyn poświadczeń Windows jest niedostępny. Klucz nie został odczytany.';
        nextVaultRead = Date.now() + 5_000;
      }
    }
    // Only the non-generating Models API is retried. A successful result is fresh for one minute.
    if (env.ANTHROPIC_API_KEY && Date.now() >= nextVerification && !saving) {
      const version = verificationVersion;
      let result: boolean | null = null;
      try { result = await verify(env.ANTHROPIC_API_KEY); } catch { /* unavailable is not invalid */ }
      if (version === verificationVersion) {
        providerVerified = result === true;
        nextVerification = Date.now() + (providerVerified ? 60_000 : 5_000);
      }
    }
  })().finally(() => { loaded = undefined; });
  const invalidateVerification = () => {
    verificationVersion++;
    providerVerified = false;
    nextVerification = Date.now() + 5_000;
  };
  const handle = async (request: Request, remoteAddress: string | undefined): Promise<Response> => {
    const json = (code: number, value: unknown) => new Response(JSON.stringify(value), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
    if (!trustedLocalTeacherRequest(request, remoteAddress)) return json(403, { blad: 'Konfiguracja klucza jest dostępna tylko z tej przeglądarki na tym komputerze.' });
    if (request.method !== 'GET' && request.method !== 'POST') return json(405, { blad: 'Nieobsługiwana metoda.' });
    await load();
    if (request.method === 'GET') return json(200, { localSetupAvailable: true, configured: !!(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN), persisted, providerVerified, storageError });
    if (saving) return json(409, { blad: 'Zapis klucza już trwa.' });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { blad: 'Wymagany JSON.' });
    const declared = Number(request.headers.get('content-length') ?? '0');
    if (declared > 2048) return json(413, { blad: 'Dane są zbyt długie.' });
    let bytes = 0; let body = ''; const reader = request.body?.getReader(); const decoder = new TextDecoder();
    if (!reader) return json(400, { blad: 'Brak klucza.' });
    while (true) {
      const part = await reader.read(); if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return json(413, { blad: 'Dane są zbyt długie.' }); }
      body += decoder.decode(part.value, { stream: true });
    }
    body += decoder.decode();
    let key: unknown;
    try { key = (JSON.parse(body) as { key?: unknown }).key; } catch { return json(400, { blad: 'Nieprawidłowe dane.' }); }
    body = '';
    if (typeof key !== 'string' || !/^sk-ant-[A-Za-z0-9_-]{20,500}$/.test(key.trim())) return json(400, { blad: 'Wpisz klucz API Claude zaczynający się od sk-ant-. To nie jest kod dostępu do FORGE.' });
    saving = true;
    try {
      const verified = await verify(key.trim());
      if (verified === false) {
        if (key.trim() === env.ANTHROPIC_API_KEY) invalidateVerification();
        return json(401, { blad: 'Claude nie zaakceptował tego klucza. Sprawdź klucz i uprawnienia w Anthropic.' });
      }
      await vault.save(key.trim());
      env.ANTHROPIC_API_KEY = key.trim(); persisted = true; storageError = null; providerVerified = verified === true;
      verificationVersion++;
      nextVaultRead = Number.POSITIVE_INFINITY;
      nextVerification = Date.now() + (providerVerified ? 60_000 : 5_000);
      return json(200, { saved: true, persisted: true, configured: true, providerVerified, message: providerVerified
        ? 'Klucz zapisany w magazynie Windows. Anthropic potwierdził dostęp do API. Nie wygenerowano płatnej odpowiedzi.'
        : 'Klucz zapisany w magazynie Windows. Połączenie z Claude jest jeszcze niesprawdzone — sprawdzenie sieci nie powiodło się.' });
    } catch { return json(503, { blad: 'Nie udało się trwale zapisać klucza w magazynie poświadczeń Windows. Spróbuj ponownie.' }); }
    finally { key = undefined; saving = false; }
  };
  return Object.assign(handle, { invalidateVerification });
}

const setup = createLocalTeacherSetup(windowsTeacherVault);

/** Installed in Vite only: this module is never imported by a public/serverless route. */
async function dispatchLocalTeacher(req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> {
  const path = (req.url ?? '').split('?')[0] ?? '';
  if (!/\/api\/nauczyciel(?:\/status|\/setup)?$/.test(path)) { next(); return; }
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(name, value);
  let request: Request;
  try { request = new Request(`http://${req.headers.host ?? 'invalid'}${path}`, { method: req.method ?? 'GET', headers }); }
  catch { res.statusCode = 400; res.end(); return; }
  if (!trustedLocalTeacherRequest(request, req.socket.remoteAddress)) { res.statusCode = 403; res.end(JSON.stringify({ blad: 'Nauczyciel lokalny wymaga połączenia z tego komputera.' })); return; }
  if (path.endsWith('/setup')) {
    let data = ''; let count = 0;
    if (req.method === 'POST') {
      for await (const chunk of req) { count += Buffer.byteLength(chunk); if (count > 2048) { res.statusCode = 413; res.end(); return; } data += chunk.toString(); }
      request = new Request(request.url, { method: 'POST', headers, body: data }); data = '';
    }
    const response = await setup(request, req.socket.remoteAddress);
    res.statusCode = response.status; response.headers.forEach((v, k) => res.setHeader(k, v)); res.end(await response.text()); return;
  }
  const setupStatus = await setup(new Request(request.url, { headers }), req.socket.remoteAddress);
  if (path.endsWith('/status') && req.method === 'GET') {
    const details = await setupStatus.json() as { localSetupAvailable?: boolean; persisted?: boolean; storageError?: string };
    res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ ...status(), ...details })); return;
  }
  await teacher(req, res, next, setup.invalidateVerification);
}

export async function localTeacherMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> {
  try { await dispatchLocalTeacher(req, res, next); }
  catch { if (!res.headersSent) { res.statusCode = 503; res.setHeader('Content-Type', 'application/json'); } res.end(JSON.stringify({ blad: 'Lokalny nauczyciel nie odpowiedział. Spróbuj ponownie.' })); }
}
