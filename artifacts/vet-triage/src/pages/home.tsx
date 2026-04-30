import { useEffect } from "react";
import { Link } from "wouter";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareLogo } from "@/components/care-logo";

export default function Home() {
  useEffect(() => {
    document.title = "CARE Triage | Welcome";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-triage-orange/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full space-y-14 text-center relative z-10">
        <div className="space-y-8">
          <div className="mx-auto inline-flex items-center justify-center">
            <CareLogo className="h-20 w-auto md:h-24" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            24 Hour Emergency &amp; Specialist Animal Hospital
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            When it matters most, <br className="hidden md:block" />
            <span className="text-primary">we're here for them.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CARE Triage is the in-clinic waiting-room system used by our emergency team to prioritise critical patients, keep families reassured with a calm public display, and give every pet the right level of care, exactly when they need it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-[1.03] active:scale-95"
          >
            <Link href="/sign-in">
              Staff Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-full bg-white border-2 border-primary text-primary hover:bg-primary/5 hover:text-primary transition-all hover:scale-[1.03] active:scale-95"
          >
            <Link href="/display" target="_blank">
              <Users className="mr-2 h-5 w-5" />
              View Waiting Room Display
            </Link>
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-border/60">
          <div className="space-y-2 pt-8">
            <h3 className="font-bold text-lg text-foreground">Standardised Triage</h3>
            <p className="text-muted-foreground leading-relaxed">A 5-level urgency system (red through blue) makes sure the most critical patients are always seen first.</p>
          </div>
          <div className="space-y-2 pt-8">
            <h3 className="font-bold text-lg text-foreground">Live Wait Times</h3>
            <p className="text-muted-foreground leading-relaxed">Auto-ticking timers help the team see at a glance how long every pet has been waiting.</p>
          </div>
          <div className="space-y-2 pt-8">
            <h3 className="font-bold text-lg text-foreground">Calm for Families</h3>
            <p className="text-muted-foreground leading-relaxed">A privacy-safe public display shows position and "next to be seen" — no medical details, no anxiety.</p>
          </div>
        </div>

        <p className="pt-4 text-sm text-muted-foreground">
          For pet owners and our website, please visit{" "}
          <a
            href="https://www.carevet.com.au"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            carevet.com.au
          </a>
          .
        </p>
      </div>
    </div>
  );
}
