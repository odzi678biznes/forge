import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 10: sieci, kompresja i bezpieczeństwo.
 *
 * Podstawa programowa 2024: III.4 (budowa internetu, identyfikacja
 * komputerów), III.R1 (kompresja stratna i bezstratna), III.R2 (urządzenia
 * i protokoły sieciowe), V.1–V.3 (prawo autorskie, licencje, hasła),
 * V.R1–V.R2 (uwierzytelnianie, kryptografia, podpis elektroniczny),
 * I+II.3f (szyfrowanie z kluczem publicznym i podpis).
 */

export const NET_TOPIC: Topic = {
  id: 'cs-networks-topic',
  subjectId: 'cs',
  name: 'Sieci, kompresja i bezpieczeństwo',
  summary: 'Adresy IP i maski, urządzenia i protokoły; kompresja RLE i Huffmana; szyfrowanie z kluczem publicznym (RSA), podpis elektroniczny, hasła i licencje.',
};

export const NET_SKILLS: Skill[] = [
  {
    id: 'cs-networks',
    topicId: 'cs-networks-topic',
    name: 'Sieci komputerowe i adresy IP',
    level: 'PR',
    ckeRequirement: 'Budowa internetu, identyfikacja komputerów w sieci, urządzenia i protokoły (III.4, III.R2)',
    prerequisites: ['cs-logic'],
    examValue: 0.6,
  },
  {
    id: 'cs-compression',
    topicId: 'cs-networks-topic',
    name: 'Kompresja danych',
    level: 'PR',
    ckeRequirement: 'Kompresja stratna i bezstratna tekstów, obrazów, dźwięków i filmów (III.R1)',
    prerequisites: ['cs-strings', 'cs-greedy'],
    examValue: 0.5,
  },
  {
    id: 'cs-security',
    topicId: 'cs-networks-topic',
    name: 'Kryptografia, podpis i bezpieczeństwo',
    level: 'PR',
    ckeRequirement: 'Szyfrowanie z kluczem publicznym, podpis elektroniczny, uwierzytelnianie, ochrona informacji i prawo (I+II.3f, V.R1, V.R2, V.1–V.3)',
    prerequisites: ['cs-fastpow', 'cs-gcd'],
    examValue: 0.55,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const NET_LESSONS: Lesson[] = [
  {
    skillId: 'cs-networks',
    minutes: 15,
    intro:
      'Każdy komputer w sieci ma adres IP — w wersji 4 to 32 bity zapisane jako cztery liczby 0–255, np. 192.168.1.130. Maska (prefiks, np. /25) mówi, ile początkowych bitów to numer sieci, a ile — numer komputera w tej sieci.',
    blocks: [
      f('192.168.1.130/25:\\quad 11000000.10101000.00000001.1\\,0000010', 'Pierwsze 25 bitów to sieć, ostatnie 7 — numer hosta.'),
      p('Adres sieci dostajesz, zerując bity hosta (AND z maską), a adres rozgłoszeniowy — ustawiając je na 1. Adresów dla komputerów jest $2^{32-p} - 2$: dwa skrajne są zarezerwowane dla sieci i rozgłaszania.'),
      listing('def adres_sieci(ip, p):\n    n = 0\n    for x in ip.split("."):\n        n = n * 256 + int(x)            # adres jako jedna liczba 32-bitowa\n    maska = (2 ** 32 - 1) ^ (2 ** (32 - p) - 1)\n    n &= maska                          # zerujemy bity hosta\n    return ".".join(str((n >> k) & 255) for k in (24, 16, 8, 0))'),
      p('Urządzenia: przełącznik (switch) łączy komputery w sieci lokalnej, router przekazuje pakiety między sieciami. Protokoły: IP (adresowanie), TCP (niezawodny, z potwierdzeniami), UDP (szybki, bez retransmisji), DNS (nazwa domeny → adres IP), DHCP (automatyczne nadawanie adresów), HTTP/HTTPS (strony WWW, HTTPS szyfrowany TLS).'),
      tip('Dwa komputery są w tej samej sieci, gdy ich adresy po nałożeniu maski dają ten sam adres sieci.'),
      warn('Nie myl prefiksu z liczbą hostów: /24 to 256 adresów, ale komputerów tylko 254.'),
    ],
    examples: [
      example(
        'Jaki jest adres sieci dla 192.168.1.130/25?',
        [['Ostatni bajt 130 = 10000010; prefiks 25 zostawia z niego tylko najstarszy bit.', '24 bity to pierwsze trzy bajty'], '10000000 = 128.'],
        '192.168.1.128',
      ),
      example(
        'Ilu komputerom można nadać adres w sieci /26?',
        ['Bitów hosta: 32 − 26 = 6, adresów $2^6 = 64$.', 'Minus adres sieci i rozgłoszeniowy.'],
        '62',
      ),
    ],
    pitfalls: ['Liczba hostów bez odjęcia dwóch adresów zarezerwowanych.', 'Pomylenie routera z przełącznikiem.', 'Przekonanie, że DNS szyfruje ruch.'],
  },
  {
    skillId: 'cs-compression',
    minutes: 15,
    intro:
      'Kompresja zmniejsza rozmiar danych. Bezstratna (ZIP, PNG, FLAC) pozwala odtworzyć dane co do bitu. Stratna (JPEG, MP3, MP4) wyrzuca szczegóły, których człowiek prawie nie zauważy — i dlatego zmniejsza dane dużo bardziej.',
    blocks: [
      p('RLE (kodowanie długości serii) zapisuje serie powtórzeń: „AAAABBBCCD” → „4A3B2C1D”. Działa dobrze dla danych z długimi seriami (proste grafiki), źle dla tekstu — może nawet wydłużyć zapis.'),
      p('Kod Huffmana daje częstym znakom krótkie kody, a rzadkim — długie. Budowa: dopóki zostało więcej niż jedno drzewo, połącz dwa o najmniejszej wadze (liczbie wystąpień). Liczba bitów zakodowanego tekstu to suma wag wszystkich połączeń.'),
      listing('Tekst AAAAABBCD: A:5, B:2, C:1, D:1\n  C+D   -> 2      (koszt 2)\n  CD+B  -> 4      (koszt 4)\n  A+CDB -> 9      (koszt 9)\nKody: A=0, B=10, C=110, D=111\nRazem: 2 + 4 + 9 = 15 bitów (kodem stałej długości: 9 · 2 = 18)'),
      tip('Rozmiar nieskompresowanego obrazu: szerokość × wysokość × bity na piksel / 8 bajtów. Zdjęcie 1920 × 1080 w kolorze 24-bitowym to ponad 6 MB — stąd potrzeba JPEG.'),
      warn('Kodu Huffmana nie da się odczytać bez tablicy kodów (albo drzewa) — przy małych plikach sama tablica może zjeść cały zysk.'),
    ],
    examples: [
      example(
        'Jak zakodować RLE napis „WWWWBBW”?',
        ['Serie: 4 × W, 2 × B, 1 × W.', 'Każda seria to liczba i znak.'],
        '4W2B1W',
      ),
      example(
        'Który format jest stratny: PNG czy JPEG?',
        [['JPEG upraszcza szczegóły obrazu.', 'dlatego przy mocnej kompresji widać „kafelki”'], 'PNG odtwarza obraz dokładnie.'],
        'JPEG',
      ),
    ],
    pitfalls: ['RLE dla tekstu bez powtórzeń — zapis się wydłuża.', 'Łączenie w Huffmanie nie dwóch najmniejszych wag.', 'Pomylenie bitów z bajtami przy liczeniu rozmiaru.'],
  },
  {
    skillId: 'cs-security',
    minutes: 16,
    intro:
      'Szyfr symetryczny ma jeden klucz — do szyfrowania i odszyfrowania. Problem: jak bezpiecznie przekazać ten klucz? Kryptografia z kluczem publicznym rozwiązuje go parą kluczy: publiczny każdy może znać, prywatny zna tylko właściciel.',
    blocks: [
      p('RSA: wybierasz liczby pierwsze p, q; $n = pq$, $\\varphi = (p-1)(q-1)$; wykładnik publiczny e względnie pierwszy z φ; prywatny d spełnia $e \\cdot d \\equiv 1 \\pmod{\\varphi}$. Szyfrowanie: $c = m^e \\bmod n$, odszyfrowanie: $m = c^d \\bmod n$ — szybkim potęgowaniem.'),
      listing('p, q = 5, 11\nn = p * q            # 55\nphi = (p - 1) * (q - 1)   # 40\ne = 3\nd = pow(e, -1, phi)  # 27, bo 3 · 27 = 81 = 2 · 40 + 1\nc = pow(7, e, n)     # szyfrujemy m = 7 -> 13\nprint(pow(c, d, n))  # 7'),
      p('Wiadomość DLA Ani szyfrujesz jej kluczem publicznym — odczyta ją tylko Ania, kluczem prywatnym. Podpis elektroniczny działa odwrotnie: nadawca podpisuje skrót dokumentu swoim kluczem prywatnym, a każdy sprawdza podpis jego kluczem publicznym.'),
      p('Hasła: serwis nie powinien znać Twojego hasła. Przechowuje jego skrót (funkcja jednokierunkowa, np. z rodziny SHA) z losową „solą”. Uwierzytelnianie dwuskładnikowe dokłada coś, co masz (telefon, klucz sprzętowy), do tego, co wiesz (hasło).'),
      tip('Prawo: program chroni prawo autorskie. Licencja określa, co wolno: freeware — używać za darmo; open source (np. GNU GPL) — też czytać i zmieniać kod, a zmienioną wersję rozpowszechniać na tej samej licencji.'),
      warn('Bezpieczeństwo RSA opiera się na trudności rozkładu dużego n na czynniki. Liczby z przykładów są małe tylko po to, żeby dało się liczyć ręcznie.'),
    ],
    examples: [
      example(
        'Zaszyfruj m = 7 kluczem publicznym (e, n) = (3, 55).',
        [['$7^3 = 343$.', 'c = m^e mod n'], '343 mod 55 = 343 − 330 = 13.'],
        '13',
      ),
      example(
        'Czyim kluczem sprawdza się podpis elektroniczny Bartka?',
        ['Bartek podpisuje kluczem prywatnym.', 'Sprawdzić może każdy — kluczem publicznym Bartka.'],
        'kluczem publicznym Bartka',
      ),
    ],
    pitfalls: ['Szyfrowanie wiadomości dla kogoś własnym kluczem prywatnym.', 'Przechowywanie haseł zamiast ich skrótów.', 'Mylenie freeware z open source.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const NET_QUESTIONS: Question[] = [
  // cs-networks ---------------------------------------------------------------
  choice({
    id: 'ne-n-1',
    skill: 'cs-networks',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które urządzenie przekazuje pakiety między różnymi sieciami (np. między siecią domową a internetem)?',
    choices: ['router', 'przełącznik (switch)', 'karta graficzna', 'drukarka sieciowa'],
    answer: 'A',
    hints: ['Czym różni się łączenie komputerów w jednej sieci od łączenia sieci między sobą?', 'W jednej sieci wystarczy przełącznik.', 'Między sieciami trzeba wybrać trasę pakietu.', 'Wybieranie trasy to trasowanie (routing).'],
    steps: ['Router wybiera trasę pakietu między sieciami.', 'Przełącznik działa w obrębie jednej sieci lokalnej.'],
    errors: [
      ['B', 'Przełącznik łączy urządzenia w jednej sieci.', 'Między sieciami pakiety przekazuje router.'],
      ['C', 'To podzespół komputera.', 'Urządzeniem sieciowym trasującym pakiety jest router.'],
      ['D', 'Drukarka jest odbiorcą danych.', 'Trasowaniem zajmuje się router.'],
    ],
  }),
  choice({
    id: 'ne-n-2',
    skill: 'cs-networks',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Do czego służy system DNS?',
    choices: ['zamienia nazwy domen (np. cke.gov.pl) na adresy IP', 'szyfruje połączenia ze stronami WWW', 'automatycznie nadaje komputerom adresy IP', 'przesyła pocztę elektroniczną'],
    answer: 'A',
    hints: ['Czego potrzebuje komputer, żeby połączyć się z serwerem?', 'Adresu IP.', 'Co wpisujesz w przeglądarce?', 'Nazwę domeny — ktoś musi ją przetłumaczyć na adres.'],
    steps: ['DNS tłumaczy nazwy domen na adresy IP.', 'Szyfrowanie to TLS (HTTPS), adresy nadaje DHCP, pocztę przesyła SMTP.'],
    errors: [
      ['B', 'To zadanie TLS/HTTPS.', 'DNS tłumaczy nazwy na adresy.'],
      ['C', 'To zadanie DHCP.', 'DNS tłumaczy nazwy na adresy.'],
      ['D', 'Pocztę przesyła SMTP.', 'DNS tłumaczy nazwy na adresy.'],
    ],
  }),
  numeric({
    id: 'ne-n-3',
    skill: 'cs-networks',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ilu komputerom można nadać adresy w sieci z prefiksem /26 (bez adresu sieci i adresu rozgłoszeniowego)?',
    answer: 62,
    verify: () => 2 ** (32 - 26) - 2,
    hints: ['Ile bitów adresu zostaje na numer komputera?', '32 minus długość prefiksu.', 'Ile różnych adresów daje ta liczba bitów?', 'Odejmij dwa adresy zarezerwowane.'],
    steps: ['Bitów hosta: 32 − 26 = 6, adresów $2^6 = 64$.', 'Minus adres sieci i rozgłoszeniowy: 62.'],
    errors: [['64', 'Nie odjęto adresów zarezerwowanych.', 'Adres sieci i rozgłoszeniowy nie są przydzielane komputerom.']],
  }),
  pyTask({
    id: 'ne-n-4',
    skill: 'cs-networks',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `adres_sieci(ip, p)`, która dla adresu IPv4 (napis „a.b.c.d”) i długości prefiksu p zwraca adres sieci (też jako napis).',
    functionName: 'adres_sieci',
    params: ['ip', 'p'],
    types: 'str, int (0–32) -> str',
    tests: [
      { name: '/25', input: ['192.168.1.130', 25], expected: '192.168.1.128' },
      { name: '/8', input: ['10.20.30.40', 8], expected: '10.0.0.0' },
      { name: '/20', input: ['172.16.5.99', 20], expected: '172.16.0.0' },
      { name: '/27', input: ['192.168.0.77', 27], expected: '192.168.0.64', hidden: true },
      { name: '/1', input: ['255.255.255.255', 1], expected: '128.0.0.0', hidden: true },
    ],
    model: `
      def adres_sieci(ip, p):
          n = 0
          for x in ip.split("."):
              n = n * 256 + int(x)
          maska = (2 ** 32 - 1) ^ (2 ** (32 - p) - 1)
          n &= maska
          return ".".join(str((n >> k) & 255) for k in (24, 16, 8, 0))
    `,
    hints: ['Jak zamienić adres „a.b.c.d” na jedną liczbę 32-bitową?', 'Jak liczbę w systemie o podstawie 256: n = n · 256 + bajt.', 'Maska ma p jedynek z przodu; bity hosta zeruje AND.', 'Z powrotem na napis: bajty to `(n >> 24) & 255`, `(n >> 16) & 255` itd.'],
    steps: ['Adres jako liczba: cztery bajty w systemie o podstawie 256.', 'AND z maską zeruje bity hosta; wynik rozkładasz z powrotem na cztery bajty.'],
  }),
  pyTask({
    id: 'ne-n-5',
    skill: 'cs-networks',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `ta_sama_siec(ip1, ip2, p)`, która sprawdza, czy dwa adresy IPv4 należą do tej samej sieci o prefiksie p.',
    functionName: 'ta_sama_siec',
    params: ['ip1', 'ip2', 'p'],
    types: 'str, str, int -> bool',
    tests: [
      { name: 'ta sama /24', input: ['192.168.1.10', '192.168.1.200', 24], expected: true },
      { name: 'różne /25', input: ['192.168.1.10', '192.168.1.200', 25], expected: false },
      { name: 'różne /16', input: ['10.1.0.1', '10.2.0.1', 16], expected: false },
      { name: 'ta sama /12', input: ['172.16.0.1', '172.31.255.254', 12], expected: true, hidden: true },
      { name: 'granica /30', input: ['192.168.0.3', '192.168.0.4', 30], expected: false, hidden: true },
    ],
    model: `
      def na_liczbe(ip):
          n = 0
          for x in ip.split("."):
              n = n * 256 + int(x)
          return n

      def ta_sama_siec(ip1, ip2, p):
          przesun = 32 - p
          return na_liczbe(ip1) >> przesun == na_liczbe(ip2) >> przesun
    `,
    hints: ['Co mają wspólnego adresy z tej samej sieci?', 'Te same pierwsze p bitów.', 'Zamień oba adresy na liczby 32-bitowe.', 'Porównaj je po przesunięciu w prawo o 32 − p bitów (albo po nałożeniu maski).'],
    steps: ['Adresy zamieniasz na liczby.', 'Te same pierwsze p bitów ⇔ równe wartości po przesunięciu `>> (32 - p)`.'],
  }),
  choice({
    id: 'ne-n-6',
    skill: 'cs-networks',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Dlaczego rozmowy wideo przez internet często korzystają z protokołu UDP, a nie TCP?',
    choices: [
      'UDP nie czeka na ponowne przesłanie zgubionych pakietów — małe opóźnienie jest ważniejsze niż pojedyncza utracona klatka',
      'UDP szyfruje dane, a TCP nie',
      'UDP gwarantuje dostarczenie wszystkich pakietów w kolejności',
      'TCP nie działa w sieciach bezprzewodowych',
    ],
    answer: 'A',
    hints: ['Co robi TCP, gdy pakiet się zgubi?', 'Czeka i prosi o ponowne wysłanie.', 'Co w rozmowie na żywo jest gorsze: zgubiony fragment czy opóźnienie?', 'Opóźnienie — spóźniona klatka jest już bezużyteczna.'],
    steps: ['TCP gwarantuje dostarczenie kosztem opóźnień (retransmisje).', 'W transmisji na żywo liczy się szybkość, więc wybiera się UDP.'],
    errors: [
      ['B', 'Ani TCP, ani UDP samo nie szyfruje.', 'Szyfrowanie zapewnia np. TLS.'],
      ['C', 'To cecha TCP, nie UDP.', 'UDP niczego nie gwarantuje — dlatego jest szybki.'],
      ['D', 'TCP działa w każdej sieci IP.', 'Powodem jest opóźnienie retransmisji.'],
    ],
  }),
  pyTask({
    id: 'ne-n-7',
    skill: 'cs-networks',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `zakres_hostow(ip, p)`, która dla adresu IPv4 i prefiksu p (8 ≤ p ≤ 30) zwraca `[pierwszy, ostatni]` — najmniejszy i największy adres, który można nadać komputerowi w tej sieci.',
    functionName: 'zakres_hostow',
    params: ['ip', 'p'],
    types: 'str, int -> list[str]',
    tests: [
      { name: '/25', input: ['192.168.1.130', 25], expected: ['192.168.1.129', '192.168.1.254'] },
      { name: '/8', input: ['10.0.0.5', 8], expected: ['10.0.0.1', '10.255.255.254'] },
      { name: '/30', input: ['172.16.5.4', 30], expected: ['172.16.5.5', '172.16.5.6'] },
      { name: '/27', input: ['192.168.0.77', 27], expected: ['192.168.0.65', '192.168.0.94'], hidden: true },
      { name: '/12', input: ['100.64.200.1', 12], expected: ['100.64.0.1', '100.79.255.254'], hidden: true },
    ],
    model: `
      def na_liczbe(ip):
          n = 0
          for x in ip.split("."):
              n = n * 256 + int(x)
          return n

      def na_napis(n):
          return ".".join(str((n >> k) & 255) for k in (24, 16, 8, 0))

      def zakres_hostow(ip, p):
          rozmiar = 2 ** (32 - p)
          siec = na_liczbe(ip) // rozmiar * rozmiar
          return [na_napis(siec + 1), na_napis(siec + rozmiar - 2)]
    `,
    hints: ['Jakie adresy są pierwszym i ostatnim w sieci?', 'Adres sieci i adres rozgłoszeniowy — komputerom ich się nie nadaje.', 'Sieć ma $2^{32-p}$ adresów, a adres sieci to adres IP zaokrąglony w dół do wielokrotności tej liczby.', 'Pierwszy host: sieć + 1, ostatni: sieć + rozmiar − 2.'],
    steps: ['Rozmiar sieci $2^{32-p}$; adres sieci — zaokrąglenie adresu w dół do wielokrotności rozmiaru.', 'Hosty: od sieci + 1 do sieci + rozmiar − 2 (bez adresu rozgłoszeniowego).'],
  }),

  // cs-compression ------------------------------------------------------------
  choice({
    id: 'ne-c-1',
    skill: 'cs-compression',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Który format zapisu stosuje kompresję stratną?',
    choices: ['JPEG', 'PNG', 'ZIP', 'TXT'],
    answer: 'A',
    hints: ['Co oznacza kompresja stratna?', 'Po rozpakowaniu dane nie są identyczne z oryginałem.', 'Który format upraszcza szczegóły zdjęcia?', 'Ten, w którym przy mocnej kompresji widać „kafelki”.'],
    steps: ['JPEG usuwa szczegóły obrazu — kompresja stratna.', 'PNG i ZIP są bezstratne, TXT to zwykły tekst bez kompresji.'],
    errors: [
      ['B', 'PNG kompresuje bezstratnie.', 'Stratny jest JPEG.'],
      ['C', 'ZIP odtwarza pliki co do bitu.', 'Stratny jest JPEG.'],
      ['D', 'TXT to tekst bez kompresji.', 'Stratny jest JPEG.'],
    ],
  }),
  numeric({
    id: 'ne-c-2',
    skill: 'cs-compression',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napis AAAABBBCCD zakodowano metodą RLE, zapisując każdą serię jako liczbę powtórzeń i znak. Ile znaków ma zakodowany napis?',
    answer: 8,
    verify: () => '4A3B2C1D'.length,
    hints: ['Ile serii jednakowych znaków ma ten napis?', 'Policz grupy: A, B, C, D.', 'Każda seria krótsza niż 10 to dwa znaki: cyfra i litera.', 'Pomnóż liczbę serii przez dwa.'],
    steps: ['Serie: 4A, 3B, 2C, 1D.', '4 serie × 2 znaki = 8 znaków.'],
    errors: [['10', 'Podana długość oryginału.', 'Pytanie dotyczy zapisu po kompresji.']],
  }),
  choice({
    id: 'ne-c-3',
    skill: 'cs-compression',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Na czym polega oszczędność w kodzie Huffmana?',
    choices: [
      'częste znaki dostają krótsze kody, a rzadkie — dłuższe',
      'wszystkie znaki dostają kody tej samej, krótszej długości',
      'rzadkie znaki są usuwane z tekstu',
      'serie powtórzeń zastępuje się liczbą i znakiem',
    ],
    answer: 'A',
    hints: ['Co decyduje o długości kodu znaku w kodzie Huffmana?', 'Jego częstość w tekście.', 'Które znaki najbardziej wpływają na długość całego zapisu?', 'Te, które występują najczęściej.'],
    steps: ['Kody mają różną długość: częste znaki — krótkie.', 'Łączna liczba bitów maleje, a dane da się odtworzyć bez strat.'],
    errors: [
      ['B', 'Kody stałej długości to nie Huffman.', 'Huffman różnicuje długości kodów.'],
      ['C', 'Huffman jest bezstratny.', 'Żaden znak nie znika.'],
      ['D', 'To opis RLE.', 'Huffman przydziela kody według częstości.'],
    ],
  }),
  numeric({
    id: 'ne-c-4',
    skill: 'cs-compression',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Tekst AAAAABBCD zakodowano kodem Huffmana. Ile bitów ma zakodowany tekst (bez tablicy kodów)?',
    answer: 15,
    verify: () => 5 * 1 + 2 * 2 + 1 * 3 + 1 * 3,
    hints: ['Ile razy występuje każdy znak?', 'A: 5, B: 2, C: 1, D: 1.', 'Łącz zawsze dwa drzewa o najmniejszych wagach i sumuj koszty połączeń.', 'Najpierw C i D, potem wynik z B, na końcu z A.'],
    steps: ['Połączenia: C + D = 2, (CD) + B = 4, (CDB) + A = 9.', 'Suma wag połączeń: 2 + 4 + 9 = 15 bitów.'],
    errors: [['18', 'Policzony kod stałej długości (2 bity na znak).', 'Huffman daje A kod jednobitowy.']],
  }),
  pyTask({
    id: 'ne-c-5',
    skill: 'cs-compression',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `rle_dekoduj(s)`, która odtwarza napis z zapisu RLE: liczba powtórzeń (może mieć kilka cyfr), potem znak — np. „12A3B” → dwanaście A i trzy B.',
    functionName: 'rle_dekoduj',
    params: ['s'],
    types: 'str -> str',
    tests: [
      { name: 'przykład', input: ['4A3B2C1D'], expected: 'AAAABBBCCD' },
      { name: 'wielocyfrowa liczba', input: ['12A1B'], expected: 'AAAAAAAAAAAAB' },
      { name: 'pusty', input: [''], expected: '' },
      { name: 'powrót znaku', input: ['2x1y2x'], expected: 'xxyxx', hidden: true },
      { name: 'dziesiątka', input: ['10z'], expected: 'zzzzzzzzzz', hidden: true },
    ],
    model: `
      def rle_dekoduj(s):
          wynik = ""
          liczba = ""
          for c in s:
              if c.isdigit():
                  liczba += c
              else:
                  wynik += c * int(liczba)
                  liczba = ""
          return wynik
    `,
    hints: ['Jak rozpoznać, gdzie kończy się liczba?', 'Liczba to ciąg cyfr — kończy się na pierwszym znaku, który nie jest cyfrą.', 'Zbieraj cyfry w napisie, a na znaku niebędącym cyfrą dopisz znak tyle razy, ile mówi liczba.', 'Napis razy liczba: `c * int(liczba)`.'],
    steps: ['Cyfry zbierasz w buforze liczby.', 'Znak niebędący cyfrą powtarzasz `int(bufor)` razy i czyścisz bufor.'],
  }),
  numeric({
    id: 'ne-c-6',
    skill: 'cs-compression',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Zdjęcie ma 1920 × 1080 pikseli, a każdy piksel zapisano na 24 bitach, bez kompresji. Ile to megabajtów (1 MB = $2^{20}$ bajtów)? Wynik zaokrąglij do dwóch miejsc po przecinku.',
    answer: '5,93',
    variants: ['5.93'],
    tolerance: 0.005,
    verify: () => Math.round(((1920 * 1080 * 24) / 8 / 2 ** 20) * 100) / 100,
    hints: ['Ile bajtów zajmuje jeden piksel?', '24 bity to 3 bajty.', 'Pomnóż liczbę pikseli przez rozmiar piksela.', 'Podziel liczbę bajtów przez 1 048 576.'],
    steps: ['1920 · 1080 · 3 = 6 220 800 bajtów.', '6 220 800 / 1 048 576 ≈ 5,93 MB.'],
    errors: [['47,46', 'Bity potraktowane jak bajty.', '24 bity to 3 bajty na piksel.']],
  }),
  pyTask({
    id: 'ne-c-7',
    skill: 'cs-compression',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `huffman_bity(tekst)`, która zwraca liczbę bitów tekstu zakodowanego kodem Huffmana (bez tablicy kodów). Wskazówka: to suma wag wszystkich połączeń, gdy zawsze łączysz dwie najmniejsze wagi (moduł `heapq`). Gdy w tekście jest jeden rodzaj znaku, każdy znak koduje się 1 bitem.',
    functionName: 'huffman_bity',
    params: ['tekst'],
    types: 'str -> int',
    tests: [
      { name: 'przykład', input: ['AAAAABBCD'], expected: 15 },
      { name: 'trzy różne', input: ['abc'], expected: 5 },
      { name: 'jeden rodzaj', input: ['aaaa'], expected: 4 },
      { name: 'pusty', input: [''], expected: 0, hidden: true },
      { name: 'abrakadabra', input: ['abracadabra'], expected: 23, hidden: true },
      { name: 'mississippi', input: ['mississippi'], expected: 21, hidden: true },
    ],
    model: `
      import heapq

      def huffman_bity(tekst):
          licznik = {}
          for c in tekst:
              licznik[c] = licznik.get(c, 0) + 1
          wagi = list(licznik.values())
          if len(wagi) <= 1:
              return len(tekst)
          heapq.heapify(wagi)
          bity = 0
          while len(wagi) > 1:
              a = heapq.heappop(wagi)
              b = heapq.heappop(wagi)
              bity += a + b
              heapq.heappush(wagi, a + b)
          return bity
    `,
    hints: ['Od czego zaczyna się budowa kodu Huffmana?', 'Od policzenia wystąpień każdego znaku — to wagi.', 'Dopóki jest więcej niż jedna waga: zdejmij dwie najmniejsze, dodaj ich sumę do wyniku i wstaw ją z powrotem.', 'Kolejka priorytetowa: `heapq.heapify`, `heappop`, `heappush`.'],
    steps: ['Wagi to liczby wystąpień znaków; jeden rodzaj znaku — osobny przypadek.', 'Łączysz dwie najmniejsze wagi, dodając ich sumę do wyniku, aż zostanie jedna.'],
  }),

  // cs-security ---------------------------------------------------------------
  choice({
    id: 'ne-s-1',
    skill: 'cs-security',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które hasło jest najbezpieczniejsze?',
    choices: ['długie zdanie z losowych słów, np. „kaktus-parasol-orbita-7-limonka”', 'imię i rok urodzenia, np. „Ola2008”', '„qwerty123”', 'to samo mocne hasło używane we wszystkich serwisach'],
    answer: 'A',
    hints: ['Co ułatwia odgadnięcie hasła?', 'Krótka długość i związek z Tobą albo popularność.', 'Co się dzieje, gdy wycieknie hasło używane wszędzie?', 'Tracisz dostęp do wszystkich kont naraz.'],
    steps: ['Długość i losowość utrudniają odgadnięcie.', 'Hasło nie powinno być powiązane z osobą ani powtarzane w wielu serwisach.'],
    errors: [
      ['B', 'Dane osobowe łatwo odgadnąć.', 'Hasło nie powinno wynikać z informacji o Tobie.'],
      ['C', 'To jedno z najpopularniejszych haseł.', 'Słowniki ataków zawierają takie hasła.'],
      ['D', 'Wyciek z jednego serwisu otwiera wszystkie konta.', 'Każdy serwis — osobne hasło (menedżer haseł).'],
    ],
  }),
  choice({
    id: 'ne-s-2',
    skill: 'cs-security',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Bartek chce wysłać Ani wiadomość, którą przeczyta tylko ona. Jakim kluczem powinien ją zaszyfrować?',
    choices: ['kluczem publicznym Ani', 'kluczem prywatnym Ani', 'swoim kluczem prywatnym', 'swoim kluczem publicznym'],
    answer: 'A',
    hints: ['Kto zna klucz prywatny Ani?', 'Tylko Ania.', 'Którym kluczem odszyfrowuje się wiadomość zaszyfrowaną kluczem publicznym?', 'Kluczem prywatnym z tej samej pary.'],
    steps: ['Wiadomość zaszyfrowaną kluczem publicznym Ani odczyta tylko posiadacz jej klucza prywatnego.', 'Bartek zna klucz publiczny Ani — i tylko ten jest mu potrzebny.'],
    errors: [
      ['B', 'Bartek nie zna klucza prywatnego Ani.', 'Klucz prywatny zna tylko właściciel.'],
      ['C', 'Własnym kluczem prywatnym się podpisuje.', 'Taki szyfrogram odczyta każdy znający klucz publiczny Bartka.'],
      ['D', 'Odszyfrować mógłby tylko Bartek.', 'Szyfruje się kluczem publicznym odbiorcy.'],
    ],
  }),
  choice({
    id: 'ne-s-3',
    skill: 'cs-security',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Program jest udostępniony na licencji GNU GPL. Co wolno z nim zrobić?',
    choices: [
      'używać, czytać i zmieniać kod oraz rozpowszechniać zmienioną wersję na tej samej licencji',
      'tylko używać, bez dostępu do kodu źródłowego',
      'zmienić kod i sprzedawać go jako program zamknięty',
      'nic — GPL oznacza zakaz kopiowania',
    ],
    answer: 'A',
    hints: ['Do jakiej grupy licencji należy GPL?', 'Do licencji otwartego oprogramowania (open source).', 'Czego wymaga GPL przy rozpowszechnianiu zmian?', 'Zmieniona wersja musi pozostać na tej samej licencji.'],
    steps: ['GPL daje prawo do używania, badania, zmiany i rozpowszechniania kodu.', 'Warunek: pochodna wersja też musi być na GPL.'],
    errors: [
      ['B', 'To opis freeware.', 'GPL gwarantuje dostęp do kodu źródłowego.'],
      ['C', 'GPL zabrania zamykania kodu pochodnego.', 'Zmiany muszą pozostać na GPL.'],
      ['D', 'GPL to licencja otwarta.', 'Pozwala kopiować i rozpowszechniać.'],
    ],
  }),
  numeric({
    id: 'ne-s-4',
    skill: 'cs-security',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Klucz publiczny RSA to (e, n) = (3, 55). Zaszyfruj wiadomość m = 7, czyli oblicz $c = m^e \\bmod n$.',
    answer: 13,
    verify: () => 7 ** 3 % 55,
    hints: ['Jaki jest wzór na szyfrogram?', '$c = m^e \\bmod n$.', 'Policz najpierw potęgę $7^3$.', 'Weź resztę z dzielenia przez n.'],
    steps: ['$7^3 = 343$.', '343 mod 55: 343 − 6 · 55 = 13.'],
    errors: [['343', 'Pominięte modulo.', 'Szyfrogram to reszta z dzielenia przez n.']],
  }),
  pyTask({
    id: 'ne-s-5',
    skill: 'cs-security',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `klucz_prywatny(p, q, e)`, która dla liczb pierwszych p, q i wykładnika publicznego e zwraca wykładnik prywatny d RSA: $0 < d < \\varphi$ i $e \\cdot d \\bmod \\varphi = 1$, gdzie $\\varphi = (p-1)(q-1)$.',
    functionName: 'klucz_prywatny',
    params: ['p', 'q', 'e'],
    types: 'int, int, int -> int',
    tests: [
      { name: 'małe liczby', input: [5, 11, 3], expected: 27 },
      { name: 'p = 3', input: [3, 11, 7], expected: 3 },
      { name: 'klasyczny przykład', input: [61, 53, 17], expected: 2753 },
      { name: 'większe', input: [17, 23, 3], expected: 235, hidden: true },
      { name: 'jeszcze większe', input: [101, 113, 3], expected: 7467, hidden: true },
    ],
    model: `
      def klucz_prywatny(p, q, e):
          phi = (p - 1) * (q - 1)
          d = 1
          while (e * d) % phi != 1:
              d += 1
          return d
    `,
    hints: ['Od czego zacząć?', 'Od policzenia φ = (p − 1)(q − 1).', 'Szukasz d, dla którego e · d daje resztę 1 z dzielenia przez φ.', 'Wystarczy sprawdzać kolejne d od 1 (albo użyć `pow(e, -1, phi)`).'],
    steps: ['φ = (p − 1)(q − 1).', 'd to odwrotność e modulo φ: najmniejsze d > 0 z (e · d) mod φ = 1.'],
  }),
  choice({
    id: 'ne-s-6',
    skill: 'cs-security',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Dlaczego serwis internetowy przechowuje skróty haseł (z losową solą), a nie same hasła?',
    choices: [
      'po wycieku bazy nie da się łatwo odtworzyć haseł, bo funkcja skrótu jest jednokierunkowa',
      'skrót zajmuje mniej miejsca niż hasło, a to główny cel',
      'dzięki temu serwis może przypomnieć użytkownikowi zapomniane hasło',
      'skróty haseł są krótsze, więc logowanie działa szybciej',
    ],
    answer: 'A',
    hints: ['Co się dzieje, gdy ktoś wykradnie bazę danych serwisu?', 'Dostaje wszystko, co w niej zapisano.', 'Czy ze skrótu da się łatwo odtworzyć hasło?', 'Nie — a sól sprawia, że nie pomogą gotowe tablice skrótów.'],
    steps: ['Funkcja skrótu jest jednokierunkowa: z hasła łatwo policzyć skrót, odwrotnie — praktycznie nie.', 'Sól sprawia, że te same hasła mają różne skróty.'],
    errors: [
      ['B', 'Oszczędność miejsca nie jest celem.', 'Celem jest bezpieczeństwo po wycieku.'],
      ['C', 'Ze skrótu nie da się odzyskać hasła.', 'Dlatego serwisy każą ustawić nowe hasło.'],
      ['D', 'Szybkość nie jest powodem.', 'Chodzi o ochronę haseł po wycieku.'],
    ],
  }),
  pyTask({
    id: 'ne-s-7',
    skill: 'cs-security',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Każdą literę wiadomości zaszyfrowano osobno RSA: $c = kod^e \\bmod n$, gdzie kod to `ord(znak)`. Napisz funkcję `odszyfruj(szyfrogram, d, n)`, która z listy liczb i klucza prywatnego (d, n) odtwarza tekst. Wykładniki są duże — potęguj modulo.',
    functionName: 'odszyfruj',
    params: ['szyfrogram', 'd', 'n'],
    types: 'list[int], int, int -> str',
    tests: [
      { name: 'HI', input: [[3000, 1486], 2753, 3233], expected: 'HI' },
      { name: 'Ala', input: [[2790, 745, 1632], 2753, 3233], expected: 'Ala' },
      { name: 'OK', input: [[40, 114], 103, 143], expected: 'OK' },
      { name: 'pusty', input: [[], 1, 2], expected: '', hidden: true },
    ],
    model: `
      def odszyfruj(szyfrogram, d, n):
          return "".join(chr(pow(c, d, n)) for c in szyfrogram)
    `,
    hints: ['Jaki wzór odszyfrowuje pojedynczą liczbę?', '$m = c^d \\bmod n$.', 'Potęgowanie modulo: `pow(c, d, n)` albo własne szybkie potęgowanie.', 'Kod z powrotem na znak: `chr`, a znaki sklej `"".join(...)`.'],
    steps: ['Każdą liczbę odszyfrowujesz: `pow(c, d, n)`.', 'Kody zamieniasz na znaki `chr` i sklejasz w napis.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const NET_CARDS: Flashcard[] = [
  card('c-ne-n-1', 'cs-networks', 'wzor', 'Ilu hostom można nadać adres w sieci /p?', '$2^{32-p} - 2$'),
  card('c-ne-n-2', 'cs-networks', 'definicja', 'DNS, DHCP, TCP, UDP — w jednym zdaniu każdy?', 'DNS: nazwa → IP; DHCP: nadaje adresy; TCP: niezawodny; UDP: szybki bez retransmisji.'),

  card('c-ne-c-1', 'cs-compression', 'definicja', 'Stratna czy bezstratna: JPEG, PNG, MP3, ZIP?', 'Stratne: JPEG, MP3. Bezstratne: PNG, ZIP.'),
  card('c-ne-c-2', 'cs-compression', 'metoda', 'Jak policzyć bity kodu Huffmana?', 'Łącz dwie najmniejsze wagi; wynik to suma wag wszystkich połączeń.'),

  card('c-ne-s-1', 'cs-security', 'definicja', 'Czym szyfrujesz wiadomość do Ani, a czym podpisujesz własny dokument?', 'Do Ani — jej kluczem publicznym; podpis — swoim kluczem prywatnym.'),
  card('c-ne-s-2', 'cs-security', 'wzor', 'Szyfrowanie i odszyfrowanie RSA?', '$c = m^e \\bmod n$, $m = c^d \\bmod n$'),
];
