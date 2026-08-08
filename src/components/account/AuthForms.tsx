"use client";

import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { brandLogoPath } from "@/lib/brand-assets";
import { isStrongPassword } from "@/lib/password";

export function LoginForm() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    setMessage(data.message ?? data.error);
  }

  return (
    <AuthShell title="Entrar">
      <form onSubmit={submit} className="grid gap-4">
        <Input icon={<Mail className="size-4" />} label="E-mail" name="email" type="email" required />
        <PasswordInput show={show} setShow={setShow} label="Senha" name="password" />
        <Button type="submit">Entrar com segurança</Button>
        <Button href="/cadastro" variant="secondary">Criar conta</Button>
        <a href="#recuperar" className="text-center text-sm font-bold text-rosebrand-700">Esqueci minha senha</a>
        {message && <p className="rounded-lg bg-rosebrand-100 p-3 text-sm font-bold text-rosebrand-800">{message}</p>}
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const strong = useMemo(() => isStrongPassword(password), [password]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      setMessage("As senhas não conferem.");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password")
      }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    setMessage(data.message ?? data.error);
  }

  return (
    <AuthShell title="Criar conta">
      <form onSubmit={submit} className="grid gap-4">
        <Input icon={<UserRound className="size-4" />} label="Nome" name="name" required />
        <Input icon={<Mail className="size-4" />} label="E-mail" name="email" type="email" required />
        <Input icon={<Phone className="size-4" />} label="Telefone" name="phone" required />
        <PasswordInput show={show} setShow={setShow} label="Senha" name="password" value={password} onChange={setPassword} />
        <PasswordInput show={show} setShow={setShow} label="Confirmar senha" name="confirmPassword" />
        <PasswordRules strong={strong} />
        <Button type="submit">Cadastrar</Button>
        <Button href="/login" variant="secondary">Já tenho conta</Button>
        {message && <p className="rounded-lg bg-rosebrand-100 p-3 text-sm font-bold text-rosebrand-800">{message}</p>}
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-10">
      <div className="glam-panel w-full max-w-md animate-soft-pop rounded-lg p-6">
        <div className="relative mx-auto mb-5 h-36 w-36">
          <Image src={brandLogoPath} alt="Barb's Closet" fill priority sizes="144px" className="object-contain drop-shadow-[0_10px_20px_rgba(247,37,133,0.18)]" />
        </div>
        <h1 className="mb-5 text-center text-2xl font-black text-ink">{title}</h1>
        {children}
        <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
          Proteção preparada com hash Argon2id, rate limiting, validação de e-mail, token temporário e CAPTCHA em produção.
        </p>
      </div>
    </section>
  );
}

function Input({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-rosebrand-200 bg-white/80 px-3">
        <span className="text-rosebrand-600">{icon}</span>
        <input {...props} className="min-w-0 flex-1 outline-none" />
      </span>
    </label>
  );
}

function PasswordInput({
  show,
  setShow,
  label,
  name,
  value,
  onChange
}: {
  show: boolean;
  setShow: (value: boolean) => void;
  label: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-rosebrand-200 bg-white/80 px-3">
        <LockKeyhole className="size-4 text-rosebrand-600" />
        <input name={name} type={show ? "text" : "password"} value={value} onChange={(event) => onChange?.(event.target.value)} required className="min-w-0 flex-1 outline-none" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="rounded p-1 text-neutral-500 hover:bg-rosebrand-100">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
    </label>
  );
}

function PasswordRules({ strong }: { strong: boolean }) {
  return (
    <div className={strong ? "rounded-lg bg-green-50 p-3 text-xs font-bold text-green-700" : "rounded-lg bg-rosebrand-100 p-3 text-xs font-bold text-rosebrand-800"}>
      Use ao menos 10 caracteres, letra maiúscula, minúscula, número e caractere especial.
    </div>
  );
}
