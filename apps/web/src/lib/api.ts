import { createClient } from "@app/api/client";

export const SESSION_EXPIRED_REASON = "session-expired";

let redirecionando = false;

export const { client, api } = createClient({
  onUnauthorized: () => {
    if (!redirecionando) {
      redirecionando = true;
      window.location.href = `/login?reason=${SESSION_EXPIRED_REASON}`;
    }
  },
});
