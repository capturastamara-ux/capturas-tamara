"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAdmin, type SignInState } from "@/app/auth/actions";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { PasswordField } from "@/components/ui/PasswordField";

const initialState: SignInState = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className="mx-auto w-full max-w-md space-y-6">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-muted">
          {siteConfig.login.emailLabel}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <PasswordField
        label={siteConfig.login.passwordLabel}
        name="password"
        required
        autoComplete="current-password"
      />

      {state?.message ? (
        <p className="text-sm text-accent" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-full bg-catalog px-8 py-3 text-xs uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:bg-catalog-ink sm:text-sm",
          pending && "cursor-wait opacity-70",
        )}
      >
        {pending ? "Entrando…" : siteConfig.login.submitLabel}
      </button>

      <p className="text-center">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.14em] text-muted transition-opacity hover:opacity-70"
        >
          {siteConfig.login.backLabel}
        </Link>
      </p>
    </form>
  );
}
