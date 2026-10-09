import {afterEach,expect,it,vi} from 'vitest';

afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();vi.resetModules();});
const reply=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}});

it('ponowne sprawdzenie odzyskuje połączenie po awarii',async()=>{
  const fetch=vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(reply({dostepny:true,model:'test-model',powod:null}));
  vi.stubGlobal('fetch',fetch);
  const client=await import('./nauczyciel-klient');
  expect((await client.statusNauczyciela()).dostepny).toBe(false);
  expect((await client.odswiezStatusNauczyciela()).dostepny).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('odświeża status po 30 sekundach mimo częstego odczytu',async()=>{
  const now=vi.spyOn(Date,'now').mockReturnValue(1000);
  const fetch=vi.fn().mockImplementation(()=>Promise.resolve(reply({dostepny:false,model:null,powod:'test'})));
  vi.stubGlobal('fetch',fetch);
  const client=await import('./nauczyciel-klient');
  await client.statusNauczyciela();
  now.mockReturnValue(20000);await client.statusNauczyciela();
  expect(fetch).toHaveBeenCalledTimes(1);
  now.mockReturnValue(32000);await client.statusNauczyciela();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('nie traktuje nieprawidłowego statusu jako działającego AI',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(reply({dostepny:'tak'})));
  const client=await import('./nauczyciel-klient');
  expect((await client.statusNauczyciela()).dostepny).toBe(false);
});

it('kod dostępu odblokowuje połączenie bez zmiany adresu strony',async()=>{
  const fetch=vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({dostepny:false,model:null,powod:'Kod',wymagaKodu:true}),{status:401,headers:{'content-type':'application/json'}}))
    .mockResolvedValueOnce(reply({dostepny:true,model:'test-model',powod:null}));
  vi.stubGlobal('fetch',fetch);
  const client=await import('./nauczyciel-klient');
  expect((await client.statusNauczyciela()).wymagaKodu).toBe(true);
  client.ustawKodNauczyciela('private-access-code');
  expect((await client.statusNauczyciela()).dostepny).toBe(true);
  expect(fetch.mock.calls[1]?.[1]?.headers.Authorization).toBe('Bearer private-access-code');
});

it('zmiana serwera usuwa kod poprzedniego serwera, a adres pozostaje zapisany', async () => {
  const saved = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => saved.get(k) ?? null, setItem: (k: string, v: string) => saved.set(k, v) });
  const client = await import('./nauczyciel-klient');
  client.ustawKodNauczyciela('previous-server-private-code');
  client.ustawAdresNauczyciela('https://teacher.example/api/nauczyciel');
  expect(client.kodNauczyciela()).toBe('');
  expect(saved.get('forge.teacher.endpoint')).toBe('https://teacher.example/api/nauczyciel');
  expect([...saved.values()].join()).not.toContain('previous-server-private-code');
  vi.resetModules();
  expect((await import('./nauczyciel-klient')).adresNauczyciela()).toBe('https://teacher.example/api/nauczyciel');
});

it('odrzuca niezabezpieczony adres i sekret w adresie serwera', async () => {
  const client = await import('./nauczyciel-klient');
  expect(() => client.ustawAdresNauczyciela('http://teacher.example/api/nauczyciel')).toThrow();
  expect(() => client.ustawAdresNauczyciela('https://user:secret@teacher.example/api')).toThrow();
  expect(() => client.ustawAdresNauczyciela('https://teacher.example/api?key=secret')).toThrow();
});

it('nowe rachunki nie dostają starej odpowiedzi z pamięci', async () => {
  const fetch = vi.fn().mockImplementation((url: string) => Promise.resolve(reply(url.endsWith('/status')
    ? { dostepny: true, model: 'test', powod: null }
    : { tekst: 'Sprawdź zapis nawiasu.', model: 'test' })));
  vi.stubGlobal('fetch', fetch);
  const client = await import('./nauczyciel-klient');
  const context = { przedmiot: 'Matematyka', lekcja: 'Delta', zadanie: null, krok: { etap: 'Rachunki', numer: 1, z: 1, pytanie: 'Oblicz deltę', kontekst: 'b=6', wyjasnienie: 'Odczytaj dane' }, odpowiedzUcznia: null, czyPoprawna: null, trudnosci: [] };
  await client.zapytajNauczyciela(context, 'nastepny-krok', []);
  expect((await client.zapytajNauczyciela(context, 'nastepny-krok', [])).zPamieci).toBe(true);
  context.krok.kontekst = 'b=-6';
  expect((await client.zapytajNauczyciela(context, 'nastepny-krok', [])).zPamieci).not.toBe(true);
  expect(fetch).toHaveBeenCalledTimes(3);
});
