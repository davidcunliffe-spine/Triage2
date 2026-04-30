import { SignIn, SignUp } from "@clerk/react";
import { useEffect } from "react";
import { CareLogo } from "@/components/care-logo";

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
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthShell>
  );
}
