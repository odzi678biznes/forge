import { handleLektorRequest } from '../server/lektor-http.js';

export const maxDuration = 60;
// Funkcja wrappera nie przekazuje kontekstu platformy jako flagi lokalnego dostępu.
export const GET = (request: Request) => handleLektorRequest(request);
export const POST = (request: Request) => handleLektorRequest(request);
export const OPTIONS = (request: Request) => handleLektorRequest(request);
