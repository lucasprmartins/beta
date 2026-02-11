import { auth } from "@app/auth/client";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createContext, type ReactNode, useContext } from "react";

export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export interface AuthRedirects {
  afterSignIn: string;
  afterSignUp: string;
  afterSignOut: string;
}

export interface AuthConfig {
  redirects: AuthRedirects;
  onSignInSuccess?: () => void;
  onSignUpSuccess?: () => void;
  onSignOutSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export interface AuthContextValue extends AuthConfig {
  queryKey: readonly string[];
}

export const defaultAuthConfig: AuthConfig = {
  redirects: {
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    afterSignOut: "/",
  },
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const sessionOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => auth.getSession().then((r) => r.data),
  staleTime: 1000 * 60 * 5,
});

export interface AuthProviderProps {
  children: ReactNode;
  redirects?: Partial<AuthRedirects>;
  onSignInSuccess?: () => void;
  onSignUpSuccess?: () => void;
  onSignOutSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export const AuthProvider = ({
  children,
  redirects,
  onSignInSuccess,
  onSignUpSuccess,
  onSignOutSuccess,
  onError,
}: AuthProviderProps) => {
  const value: AuthContextValue = {
    redirects: {
      ...defaultAuthConfig.redirects,
      ...redirects,
    },
    onSignInSuccess,
    onSignUpSuccess,
    onSignOutSuccess,
    onError,
    queryKey: ["session"],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthConfig = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      ...defaultAuthConfig,
      queryKey: ["session"] as const,
    };
  }
  return context;
};

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface UseSignInOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export const useSignIn = (options?: UseSignInOptions) => {
  const config = useAuthConfig();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: SignInCredentials): Promise<AuthResult> => {
      const result = await auth.signIn.username(credentials);

      if (result.error) {
        const error = {
          message: result.error.message ?? "Erro ao fazer login.",
        };
        options?.onError?.(error);
        config.onError?.(error);
        return { success: false, error };
      }

      await queryClient.refetchQueries({ queryKey: config.queryKey });
      navigate({ to: config.redirects.afterSignIn });

      options?.onSuccess?.();
      config.onSignInSuccess?.();

      return { success: true, data: result.data };
    },
  });
};

export interface SignUpCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface UseSignUpOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export const useSignUp = (options?: UseSignUpOptions) => {
  const config = useAuthConfig();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials): Promise<AuthResult> => {
      const result = await auth.signUp.email(credentials);

      if (result.error) {
        const error = {
          message: result.error.message ?? "Erro ao criar conta.",
        };
        options?.onError?.(error);
        config.onError?.(error);
        return { success: false, error };
      }

      await queryClient.refetchQueries({ queryKey: config.queryKey });
      navigate({ to: config.redirects.afterSignUp });

      options?.onSuccess?.();
      config.onSignUpSuccess?.();

      return { success: true, data: result.data };
    },
  });
};

export interface UseSignOutOptions {
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useSignOut = (options?: UseSignOutOptions) => {
  const config = useAuthConfig();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (): Promise<AuthResult> => {
      await auth.signOut();

      queryClient.removeQueries({ queryKey: config.queryKey });
      navigate({ to: options?.redirectTo ?? config.redirects.afterSignOut });

      options?.onSuccess?.();
      config.onSignOutSuccess?.();

      return { success: true };
    },
  });
};
