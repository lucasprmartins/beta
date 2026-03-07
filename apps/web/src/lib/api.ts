import { createClient } from "@app/api/client";

let redirecionando = false;

export const { client, api } = createClient({
  onUnauthorized: () => {
    if (!redirecionando) {
      redirecionando = true;
      window.location.href = "/login?reason=session-expired";
    }
  },
});
