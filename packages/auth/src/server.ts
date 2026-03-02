import { db } from "@app/infra/db";
import {
  account,
  session,
  user,
  verification,
} from "@app/infra/db/schema/auth";
import { env, isLocal } from "@app/infra/env";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { i18n } from "@better-auth/i18n";
import { betterAuth } from "better-auth";
import { admin as adminPlugin, openAPI, username } from "better-auth/plugins";
import { ptBR } from "./i18n/pt-br";

export const auth = betterAuth({
  basePath: "/auth",
  baseUrl: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account,
      session,
      user,
      verification,
    },
  }),
  trustedOrigins: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : [],
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
    adminPlugin(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
    }),
    i18n({
      defaultLocale: "pt-br",
      detection: ["header"],
      translations: {
        "pt-br": ptBR,
      },
    }),
    ...(isLocal ? [openAPI()] : []),
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
