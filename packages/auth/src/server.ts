import { db } from "@app/infra/db";
import {
  account,
  session,
  user,
  verification,
} from "@app/infra/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, openAPI, username } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/auth",
  baseUrl: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account,
      session,
      user,
      verification,
    },
  }),
  trustedOrigins: process.env.CORS_ORIGIN?.split(",") ?? [],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/auth/sign-in/*": { window: 300, max: 5 },
      "/auth/sign-up/*": { window: 600, max: 3 },
    },
  },
  advanced: {
    cookiePrefix: "app",
  },
  plugins: [
    openAPI(),
    adminPlugin(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
    }),
  ],
});

export interface CreateContextOptions {
  request: Request;
}

export async function createContext({ request }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
