import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { i18n } from "@better-auth/i18n";
import { betterAuth } from "better-auth";
import { admin as adminPlugin, openAPI, username } from "better-auth/plugins";
import { ptBR } from "@/auth/i18n/pt-br";
import { corsOrigins, env, isLocal } from "@/config/env";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";

export const auth = betterAuth({
  basePath: "/auth",
  baseUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account,
      session,
      user,
      verification,
    },
  }),
  trustedOrigins: corsOrigins,
  emailAndPassword: {
    enabled: true,
    disableSignUp: env.DISABLE_PUBLIC_SIGNUP,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    enabled: !isLocal,
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
