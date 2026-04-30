import { SignIn, SignUp } from "@clerk/react";
import { useEffect } from "react";
import { CareLogo } from "@/components/care-logo";
import { ALLOWED_STAFF_EMAIL_DOMAIN } from "@/components/staff-guard";
import { Info } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-triage-green/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <CareLogo className="h-12 w-auto" />
        {children}
      </div>
    </div>
  );
}

export function SignInPage() {
  useEffect(() => {
    document.title = "CARE Triage | Sign In";
  }, []);

  return (
    <AuthShell>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthShell>
  );
}

export function SignUpPage() {
  useEffect(() => {
    document.title = "CARE Triage | Sign Up";
  }, []);

  return (
    <AuthShell>
      <div className="w-[440px] max-w-full bg-accent/40 border border-accent rounded-2xl px-4 py-3 flex items-start gap-3 text-sm text-foreground">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <p>
          Staff accounts must be created with your{" "}
          <span className="font-semibold">@{ALLOWED_STAFF_EMAIL_DOMAIN}</span>{" "}
          email address. Other addresses will not be granted access to the
          triage board.
        </p>
      </div>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthShell>
  );
}
