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

      <div className="max-w-3xl w-full space-y-12 text-center relative z-10">
        <div className="space-y-6">
          <div className="mx-auto bg-white rounded-3xl shadow-xl border border-border/50 mb-8 px-8 py-6 inline-flex items-center justify-center">
            <CareLogo className="h-16 w-auto md:h-20" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Calm, clear triage <br className="hidden md:block" />
            <span className="text-primary">for emergency care.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CARE's waiting-room companion: prioritise critical patients, keep families reassured with a transparent public display, and give your team the tools to deliver calm, confident care under pressure.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Link href="/sign-in">
              Staff Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl bg-white/50 backdrop-blur-sm border-2 hover:bg-white transition-all hover:scale-105 active:scale-95">
            <Link href="/display" target="_blank">
              <Users className="mr-2 h-5 w-5 text-muted-foreground" />
              View Waiting Room Display
            </Link>
          </Button>
        </div>
        
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-border/50">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">Smart Prioritization</h3>
            <p className="text-muted-foreground">Standardized 5-level triage system ensures critical patients are seen first.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">Live Wait Times</h3>
            <p className="text-muted-foreground">Automatically ticking timers help staff monitor how long every patient has been waiting.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground">Owner Transparency</h3>
            <p className="text-muted-foreground">A dedicated public display reduces anxiety by showing queue order and status without compromising medical privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
