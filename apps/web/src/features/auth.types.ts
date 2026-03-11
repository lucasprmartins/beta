import type { ComponentPropsWithoutRef, ReactNode } from "react";

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

export interface AuthProviderProps {
  children: ReactNode;
  redirects?: Partial<AuthRedirects>;
  onSignInSuccess?: () => void;
  onSignUpSuccess?: () => void;
  onSignOutSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

export interface SignInCredentials {
  identifier: string;
  password: string;
}

export interface UseSignInOptions {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
}

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

export interface UseSignOutOptions {
  redirectTo?: string;
  onSuccess?: () => void;
}

export interface SignInFormProps {
  onSwitchForm?: () => void;
}

export interface SignUpFormProps {
  onSwitchForm?: () => void;
}

export type SignOutButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onClick"
>;
