import { createNeonAuth } from "@neondatabase/auth/next/server";

// Instância única do Neon Auth (Better Auth por baixo). Usada em Server
// Components, Server Actions, no handler de /api/auth e no proxy.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
