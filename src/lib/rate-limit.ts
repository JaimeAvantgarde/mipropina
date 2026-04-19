/**
 * Rate limiter in-memory por IP.
 * Funciona por instancia serverless (Vercel). Para distribución multi-instancia
 * usar Upstash Redis + @upstash/ratelimit.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Limpiar entradas expiradas cada 5 minutos para evitar fugas de memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * @param key    Identificador único (ej: IP de cliente)
 * @param limit  Número máximo de peticiones en la ventana
 * @param windowMs Tamaño de la ventana en ms (por defecto 60 s)
 * @returns `{ allowed: boolean; remaining: number }`
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

/** Extrae la IP del cliente desde los headers de Next.js */
export function getClientIp(request: Request): string {
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
  ];
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) return value.split(",")[0].trim();
  }
  return "unknown";
}
