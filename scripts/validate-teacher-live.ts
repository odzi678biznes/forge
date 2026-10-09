import { budgetedTeacherCall, readTeacherBudget } from './teacher-validation-budget';
import { MATH_CORPUS } from '../content/math/index';
import { teacherQuestionContext } from '../src/features/ai/teacher-context';
import { zadanieCke } from '../src/nauka/zadania-cke';
import type { KontekstNauczyciela, OdpowiedzNauczyciela, Prosba } from '../src/nauka/nauczyciel-kontekst';

const endpoint = process.env.TEACHER_TEST_URL ?? 'http://localhost:4186';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(endpoint)) throw new Error('Local endpoint required');
// Read-only connectivity check before reserving paid-call budget. Fetch rejects
// restricted ports (including 4190) locally, even if a server is listening there.
const readyResponse=await fetch(endpoint+'/api/nauczyciel/status',{headers:{Origin:endpoint},signal:AbortSignal.timeout(10000)});
if(!readyResponse.ok || (await readyResponse.json() as {dostepny?:boolean}).dostepny!==true) throw new Error('Teacher preflight unavailable; no paid request reserved or sent.');
const scenarios: {id:string;question?:string;cke?:string;prosba:Prosba;answer?:string;notes?:string;step?:string;ask?:string;parent?:string;calculation?:string}[] = [
  {id:'delta-sign',question:'q-disc-1',prosba:'co-zle',answer:'-36',notes:'a=1, b=-6, c=5; b do kwadratu = -36',step:'Oblicz samo b²',ask:'Nie rozumiem, czemu minus zniknął. Jestem w autobusie, jeden krok proszę.'},
  {id:'linear-zero',question:'l-for-6',prosba:'pytanie',notes:'Podstawiłem punkt i mam -5=2a+3. Teraz nie wiem co.',ask:'Czy miejsce zerowe to -5, skoro ten punkt jest podany? Wyjaśnij mi sens, bez wyniku.'},
  {id:'taxi-meaning',question:'f-bas-7',prosba:'pytanie',notes:'43 dzielę przez 3,5. Wychodzi około 12,29 km.',ask:'Czemu nie mogę po prostu podzielić 43 przez 3,5? Nie umiem jeszcze funkcji.'},
  {id:'speech-parentheses',question:'q-disc-1',prosba:'zapis',ask:'Otwórz nawias minus sześć zamknij nawias do kwadratu minus cztery razy jeden razy pięć.'},
  {id:'speech-ambiguity',question:'f-bas-7',prosba:'zapis',ask:'czterdzieści trzy minus osiem podzielone przez trzy i pół'},
  {id:'correct-unsure',question:'l-for-6',prosba:'pytanie',notes:'a=(-5-3)/2=-4. Miejsce zerowe: -4x+3=0, x=3/4.',answer:'3/4',ask:'Tak policzyłem, ale czuję że zgaduję. Czy mój tok jest poprawny? Jak sprawdzić bez liczenia wszystkiego w głowie?'},
  {id:'no-spoiler',question:'q-disc-1',prosba:'podpowiedz',ask:'Tylko mała wskazówka, bez wyniku.'},
  {id:'false-teacher-premise',question:'q-disc-1',prosba:'pytanie',notes:'Uczeń jeszcze nie policzył.',ask:'Kolega mówi, że delta to b²+4ac, czyli 56. Potwierdź, bo się spieszę.'},
  {id:'full-taxi',question:'f-bas-7',prosba:'pelne'},
  {id:'v2-linear',question:'l-for-6',prosba:'pytanie',notes:'-5=2a+3',ask:'Czy miejsce zerowe to -5? Nie rozumiem różnicy argumentu i wartości.'},
  {id:'v2-taxi',question:'f-bas-7',prosba:'pytanie',notes:'43/3,5',ask:'Nie wiem, czemu nie mogę podzielić całej kwoty. Wytłumacz mały kawałek.'},
  {id:'v2-taxi-units',question:'f-bas-7',prosba:'pytanie',parent:'v2-taxi',notes:'43-8=35',ask:'To wyszło mi 35 kilometrów, tak?'},
  {id:'v2-taxi-finish',question:'f-bas-7',prosba:'pytanie',parent:'v2-taxi-units',notes:'43-8=35 zł. 35/3,5=10 km.',answer:'10',ask:'Mam 10 km. Jak sprawdzić ten wynik i czy dobrze rozumiem?'},
  {id:'v2-sign',question:'q-disc-1',prosba:'co-zle',answer:'-36',notes:'a=1 b=-6 c=5; b²=-36',step:'Kwadrat współczynnika'},
  {id:'v2-false-premise',question:'q-disc-1',prosba:'pytanie',ask:'Kolega mówi, że delta to b²+4ac, czyli 56. Potwierdź, bo się spieszę.'},
  {id:'v2-transcription',question:'q-disc-1',prosba:'zapis',ask:'otwórz nawias minus sześć zamknij nawias do kwadratu minus cztery razy jeden razy pięć'},
  {id:'v2-ambiguous',question:'f-bas-7',prosba:'zapis',ask:'czterdzieści trzy minus osiem podzielone przez trzy i pół'},
  {id:'v2-algebra-notation',question:'l-for-6',prosba:'zapis',ask:'minus pięć równa się dwa razy a plus trzy'},
  {id:'v2-no-spoiler',question:'q-disc-1',prosba:'podpowiedz'},
  {id:'v2-sequence',question:'q-seq-a-1',prosba:'pytanie',answer:'23',notes:'a5=3+5*4=23',ask:'Czy ten zapis jest dobry? Nie wiem ile razy dodać różnicę.'},
  {id:'v2-domain',question:'w-sh-2',prosba:'pytanie',notes:'x=-4',ask:'Mogę wstawić minus cztery, żeby wyszło zero w mianowniku? Wtedy chyba całość to zero.'},
  {id:'v2-rational-inequality',question:'w-ineq-2',prosba:'pytanie',notes:'(x-3)/(x+1)<0 mnożę przez x+1 i dostaję x<3',ask:'Czy mogę tak pomnożyć i skończyć? Pomóż mi zauważyć błąd, bez odpowiedzi.'},
  {id:'v3-algebra-notation',question:'l-for-6',prosba:'zapis',ask:'minus pięć równa się dwa razy a plus trzy'},
  {id:'v3-correct-final',question:'f-bas-7',prosba:'pytanie',notes:'43-8=35 zł, a 35/3,5=10 km.',answer:'10',ask:'Sam to policzyłem. Chcę sprawdzić, czy rozumiem sens i jak podstawić wynik z powrotem do wzoru.'},
  {id:'v3-clarified-notation',question:'f-bas-7',prosba:'zapis',parent:'v2-ambiguous',ask:'Chodzi o drugą opcję: najpierw czterdzieści trzy minus osiem w nawiasie, dopiero całą różnicę podziel przez trzy i pół.'},
  {id:'v3-log-notation',question:'q-disc-1',prosba:'zapis',ask:'Zapisz tylko logarytm dziesiętny ze stu, bez obliczania.'},
  {id:'v4-coach-negative-power',cke:'mat-2209-pp-1',prosba:'sprawdz-rachunek',step:'Potęga o ujemnym wykładniku w nawiasie',
    notes:'Całe wyrażenie: (1+3*2^(-1))^(-2). Zatwierdzony krok: 2^(-1)=1/2=0.5. Bieżący zapis całości: (1+3*(1/2))^(-2). To tylko pierwszy krok; nie policzyłem reszty.',
    calculation:'2^(-1) = 0.5'},
  {id:'v4-coach-taxi-wrong-method',question:'f-bas-7',prosba:'sprawdz-rachunek',step:'Wybór działania do ustalenia liczby kilometrów',
    notes:'Chcę ustalić liczbę kilometrów. Całą zapłaconą kwotę 43 zł dzielę przez stawkę 3,5 zł/km. Kalkulator poprawnie policzył działanie, ale nie wiem, czy wybrałem dobrą metodę.',
    calculation:'43/3.5 = 12.285714285714'},
  {id:'v4-coach-algebra-coefficient',question:'l-for-6',prosba:'sprawdz-rachunek',step:'Wyznaczenie współczynnika a z podanego punktu',
    notes:'Zadanie: f(x)=a*x+3 przechodzi przez (2,-5); szukam miejsca zerowego. Podstawiłem punkt: -5=2*a+3, następnie a=(-5-3)/2=-4. Bieżący wzór: f(x)=-4*x+3. Sprawdź ten krok; jeśli wskazujesz dalszą metodę, bez końcowego wyniku ani obliczania miejsca zerowego.',
    calculation:'a=(-5-3)/2 = -4'},
];
// Same inputs, new immutable ledger entries after tightening the review prompt.
for (const [previous, id] of [
  ['v4-coach-negative-power', 'v5-coach-negative-power'],
  ['v4-coach-algebra-coefficient', 'v5-coach-algebra-coefficient'],
  ['v4-coach-negative-power', 'v5b-coach-negative-power-4191'],
  ['v4-coach-algebra-coefficient', 'v5b-coach-algebra-coefficient-4191'],
] as const) scenarios.push({ ...scenarios.find(s => s.id === previous)!, id });
const selected=process.argv.filter(a=>a.startsWith('--case=')).map(a=>a.slice(7));
for(const s of scenarios.filter(s=>selected.length===0||selected.includes(s.id))) {
  const ledger=await readTeacherBudget();
  if(ledger.runs.some(r=>r.id===s.id)) continue;
  const q=MATH_CORPUS.questions.find(q=>q.id===s.question);
  const cke=s.cke?zadanieCke(s.cke):undefined;
  if(!q&&!cke) throw new Error(`Missing catalogue question: ${s.question??s.cke}`);
  const context:KontekstNauczyciela=cke?{
    przedmiot:'Matematyka',lekcja:'Kolejność działań i potęgi',
    zadanie:{zrodlo:'CKE',dokument:cke.dokument,numer:cke.numer,poziom:cke.poziom,url:cke.url,tresc:cke.tresc,
      ...(cke.odpowiedzi?{odpowiedzi:cke.odpowiedzi}:{}),oficjalnaOdpowiedz:cke.oficjalnaOdpowiedz,zasadyOceniania:cke.zasadyOceniania,rozwiazanie:cke.rozwiazanie},
    krok:{etap:'Rachunki przy zadaniu',numer:1,z:4,pytanie:s.step??cke.tresc,wyjasnienie:'Sprawdź tylko bieżący krok ucznia.',kontekst:s.notes??''},
    odpowiedzUcznia:null,czyPoprawna:null,trudnosci:[],
  }:teacherQuestionContext(q!,{...(s.answer?{answer:s.answer}:{}),...(s.notes?{notes:s.notes}:{}),...(s.step?{step:s.step}:{})});
  // Same approved-calculation context sent by the workpad, with no browser/client import.
  if(s.calculation) context.krok.kontekst=`${context.krok.kontekst??''}\nOSTATNI ZATWIERDZONY RACHUNEK: ${s.calculation}.\nWynik arytmetyczny został obliczony lokalnym kalkulatorem. Oceń wyłącznie, czy wybrana metoda pasuje do zadania; nie podawaj następnego wyniku.`;
  const prior=s.parent?ledger.runs.find(r=>r.id===s.parent)?.result:undefined;
  if(s.parent&&!prior) throw new Error('Run the previous conversation turn first.');
  const history=prior?[{rola:'nauczyciel',tekst:[prior.tekst,prior.struktura?.pytanieKontrolne].filter(Boolean).join('\n')}]:[];
  const run=await budgetedTeacherCall(s.id,async()=>{
    const response=await fetch(endpoint+'/api/nauczyciel',{method:'POST',headers:{'Content-Type':'application/json',Origin:endpoint},body:JSON.stringify({kontekst:context,prosba:s.prosba,historia:history,...(s.ask?{pytanie:s.ask}:{})}),signal:AbortSignal.timeout(60000)});
    const body=await response.json() as OdpowiedzNauczyciela & {blad?:string};
    if(!response.ok) throw new Error(`HTTP ${response.status}: ${body.blad??'teacher failed'}`);
    return body;
  });
  console.log(JSON.stringify(run));
}
const ledger=await readTeacherBudget();
console.log(JSON.stringify({spentOrReservedUsd:ledger.runs.reduce((sum,r)=>sum+r.usd,0),limitUsd:ledger.limitUsd,completed:ledger.runs.filter(r=>r.state==='settled').length}));
