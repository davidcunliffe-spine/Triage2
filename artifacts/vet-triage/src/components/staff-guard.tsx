import { useUser, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CareLogo } from "@/components/care-logo";
import { ShieldAlert } from "lucide-react";

export const ALLOWED_STAFF_EMAIL_DOMAIN = "carevet.com.au";

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
  const allowed = !!email && email.endsWith(`@${ALLOWED_STAFF_EMAIL_DOMAIN}`);

  if (!allowed) {
    const handleSignOut = async () => {
      await signOut();
      setLocation("/");
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="max-w-md w-full bg-white border border-border rounded-3xl shadow-xl p-8 md:p-10 text-center space-y-6">
          <div className="mx-auto inline-flex items-center justify-center">
            <CareLogo className="h-12 w-auto" />
          </div>

          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Access restricted
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              CARE Triage is only available to staff signed in with a{" "}
              <span className="font-semibold text-foreground">
                @{ALLOWED_STAFF_EMAIL_DOMAIN}
              </span>{" "}
              email address.
            </p>
            {email && (
              <p className="text-sm text-muted-foreground">
                You're currently signed in as{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSignOut}
              size="lg"
              className="rounded-full font-semibold"
            >
              Sign out and try a different account
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              If you believe this is an error, please contact your CARE
              administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
