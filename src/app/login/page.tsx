import { AuthForm } from "@/components/auth-form";
import { BrandLogo } from "@/components/brand-logo";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="peblo-shell grid min-h-screen place-items-center px-4">
      <Card className="peblo-surface w-full max-w-md p-6 backdrop-blur">
        <BrandLogo className="mb-6" />
        <h1 className="text-2xl font-black tracking-tight text-[var(--peblo-ink)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--peblo-muted)]">Log in to continue writing in Peblo Notes.</p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </Card>
    </main>
  );
}
