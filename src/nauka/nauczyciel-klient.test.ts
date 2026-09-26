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
