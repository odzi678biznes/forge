import { isTauri } from '@/data/create-storage';

/**
 * Otwiera oficjalny dokument CKE w przeglądarce systemowej.
 *
 * W aplikacji desktopowej link w WebView nie otworzy się sam - robi to wtyczka
 * opener, której uprawnienia pozwalają WYŁĄCZNIE na adresy https://cke.gov.pl/.
 * Tę samą granicę pilnujemy tutaj, żeby błąd w treści nie otworzył niczego
 * innego także w wersji przeglądarkowej.
 */
export const ALLOWED_PREFIX = 'https://cke.gov.pl/';

export function isAllowedExternal(url: string): boolean {
  return url.startsWith(ALLOWED_PREFIX) && !/[\s"'<>]/.test(url);
}

export async function openExternal(url: string): Promise<void> {
  if (!isAllowedExternal(url)) throw new Error(`Niedozwolony adres: ${url}`);
  if (isTauri()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
