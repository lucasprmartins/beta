import {
  CaretDownIcon,
  EnvelopeIcon,
  LockIcon,
  SignOutIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ComponentPropsWithoutRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { sessionOptions, useSignIn, useSignOut, useSignUp } from "../lib/auth";

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

export const SignInForm = ({ onSwitchForm }: SignInFormProps) => {
  const { mutateAsync: signIn, isPending } = useSignIn();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const result = await signIn({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    });

    if (!result.success) {
      setError(result.error?.message ?? "Erro ao fazer login.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          className="alert alert-error fixed bottom-4 left-1/2 z-50 w-auto max-w-md -translate-x-1/2"
          role="alert"
        >
          <WarningCircleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <fieldset className="fieldset w-sm rounded-box bg-base-200 p-6">
        <legend className="fieldset-legend text-sm">
          Faça o seu login
          <ThemeToggle size="sm" />
        </legend>

        <label className="fieldset-label" htmlFor="sign-in-username">
          Usuário
        </label>
        <label className="input validator w-full">
          <UserIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-in-username"
            name="username"
            placeholder="Digite seu usuário..."
            required
            type="text"
          />
        </label>
        <p className="validator-hint hidden">Usuário é obrigatório.</p>

        <label className="fieldset-label" htmlFor="sign-in-password">
          Senha
        </label>
        <label className="input validator w-full">
          <LockIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-in-password"
            minLength={8}
            name="password"
            placeholder="Digite sua senha..."
            required
            type="password"
          />
        </label>
        <p className="validator-hint hidden">
          Senha deve ter no mínimo 8 caracteres.
        </p>

        <button
          className="btn btn-primary btn-block mt-4"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <span className="loading loading-ring loading-xs" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <div className="divider">Não possui conta?</div>

        <button
          className="btn btn-ghost btn-block"
          onClick={onSwitchForm}
          type="button"
        >
          Cadastre-se
        </button>
      </fieldset>
    </form>
  );
};

export const SignUpForm = ({ onSwitchForm }: SignUpFormProps) => {
  const { mutateAsync: signUp, isPending } = useSignUp();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const result = await signUp({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    });

    if (!result.success) {
      setError(result.error?.message ?? "Erro ao criar conta.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          className="alert alert-error alert-soft fixed bottom-4 left-1/2 z-50 w-auto max-w-md -translate-x-1/2 shadow-lg"
          role="alert"
        >
          <WarningCircleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <fieldset className="fieldset w-sm rounded-box bg-base-200 p-6">
        <legend className="fieldset-legend text-sm">
          Crie sua conta
          <ThemeToggle size="sm" />
        </legend>

        <label className="fieldset-label" htmlFor="sign-up-name">
          Nome
        </label>
        <label className="input validator w-full">
          <UserIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-up-name"
            name="name"
            placeholder="Digite seu nome..."
            required
            type="text"
          />
        </label>
        <p className="validator-hint hidden">Nome é obrigatório.</p>

        <label className="fieldset-label" htmlFor="sign-up-username">
          Usuário
        </label>
        <label className="input validator w-full">
          <UserIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-up-username"
            name="username"
            placeholder="Digite seu usuário..."
            required
            type="text"
          />
        </label>
        <p className="validator-hint hidden">Usuário é obrigatório.</p>

        <label className="fieldset-label" htmlFor="sign-up-email">
          E-mail
        </label>
        <label className="input validator w-full">
          <EnvelopeIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-up-email"
            name="email"
            placeholder="exemplo@email.com"
            required
            type="email"
          />
        </label>
        <p className="validator-hint hidden">Formato de e-mail inválido.</p>

        <label className="fieldset-label" htmlFor="sign-up-password">
          Senha
        </label>
        <label className="input validator w-full">
          <LockIcon className="h-4 w-4 opacity-50" />
          <input
            disabled={isPending}
            id="sign-up-password"
            minLength={8}
            name="password"
            placeholder="Digite sua senha..."
            required
            type="password"
          />
        </label>
        <p className="validator-hint hidden">
          Senha deve ter no mínimo 8 caracteres.
        </p>

        <button
          className="btn btn-primary btn-block mt-4"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <span className="loading loading-ring loading-xs" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </button>

        <div className="divider">Já possui conta?</div>

        <button
          className="btn btn-ghost btn-block"
          onClick={onSwitchForm}
          type="button"
        >
          Entrar
        </button>
      </fieldset>
    </form>
  );
};

export const UserMenu = () => {
  const { data: session } = useQuery(sessionOptions);
  const { mutate: signOut, isPending } = useSignOut();

  const user = session?.user;
  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    (document.activeElement as HTMLElement)?.blur();
    signOut();
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-ghost h-10 min-h-10 gap-2 px-2"
        tabIndex={0}
        type="button"
      >
        <div className="avatar avatar-placeholder">
          <div className="w-8 rounded-full bg-primary/10 text-primary">
            <span className="font-semibold text-xs">{initials}</span>
          </div>
        </div>
        <span className="hidden font-medium text-sm sm:block">
          {user.username ?? user.name}
        </span>
        <CaretDownIcon className="h-3 w-3 opacity-40" weight="bold" />
      </button>

      <div className="dropdown-content z-50 mt-1 w-56 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-lg">
        <div className="border-base-300 border-b px-4 py-3">
          <p className="font-semibold text-base-content text-sm">{user.name}</p>
          {user.username && (
            <p className="text-base-content/50 text-xs">@{user.username}</p>
          )}
          <p className="mt-0.5 text-base-content/40 text-xs">{user.email}</p>
        </div>

        <div className="p-2">
          <button
            className="btn btn-soft btn-error btn-sm btn-block justify-start"
            disabled={isPending}
            onClick={handleSignOut}
            type="button"
          >
            {isPending ? (
              <span className="loading loading-ring loading-xs" />
            ) : (
              <SignOutIcon className="h-4 w-4" weight="bold" />
            )}
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export const SignOutButton = ({ disabled, ...props }: SignOutButtonProps) => {
  const { mutate: signOut, isPending } = useSignOut();

  return (
    <button
      className="btn btn-ghost btn-circle"
      disabled={disabled || isPending}
      onClick={() => signOut()}
      {...props}
    >
      {isPending ? (
        <span className="loading loading-ring loading-xs" />
      ) : (
        <SignOutIcon className="h-5 w-5" />
      )}
    </button>
  );
};
