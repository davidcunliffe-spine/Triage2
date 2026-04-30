import { useEffect } from "react";
import { useGetPublicQueue, getGetPublicQueueQueryKey } from "@workspace/api-client-react";
import type { TriageClass } from "@workspace/api-client-react";
import { Clock, PawPrint } from "lucide-react";
import { SpeciesIcon } from "@/components/species-icon";
import { CareLogo } from "@/components/care-logo";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const triageRowStyles: Record<
  TriageClass,
  { bar: string; dot: string; ring: string; label: string }
> = {
  red: {
    bar: "bg-[hsl(var(--triage-red))]",
    dot: "bg-[hsl(var(--triage-red))]",
    ring: "ring-[hsl(var(--triage-red))]/30",
    label: "Immediate",
  },
  orange: {
    bar: "bg-[hsl(var(--triage-orange))]",
    dot: "bg-[hsl(var(--triage-orange))]",
    ring: "ring-[hsl(var(--triage-orange))]/30",
    label: "Urgent",
  },
  yellow: {
    bar: "bg-[hsl(var(--triage-yellow))]",
    dot: "bg-[hsl(var(--triage-yellow))]",
    ring: "ring-[hsl(var(--triage-yellow))]/30",
    label: "Semi-urgent",
  },
  green: {
    bar: "bg-[hsl(var(--triage-green))]",
    dot: "bg-[hsl(var(--triage-green))]",
    ring: "ring-[hsl(var(--triage-green))]/30",
    label: "Non-urgent",
  },
  blue: {
    bar: "bg-[hsl(var(--triage-blue))]",
    dot: "bg-[hsl(var(--triage-blue))]",
    ring: "ring-[hsl(var(--triage-blue))]/30",
    label: "Routine",
  },
};

function triageStyle(tc: TriageClass) {
  return triageRowStyles[tc] ?? triageRowStyles.blue;
}

export default function DisplayPage() {
  useEffect(() => {
    document.title = "CARE Triage | Waiting Room";
  }, []);

  const { data: queue, isLoading, isError } = useGetPublicQueue({
    query: {
      queryKey: getGetPublicQueueQueryKey(),
      refetchInterval: 5000,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 md:p-12 flex flex-col">
        <header className="flex justify-between items-end mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl text-primary-foreground">
              <PawPrint className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Waiting Room</h1>
              <p className="text-xl text-muted-foreground mt-1">We will be with you shortly</p>
            </div>
          </div>
        </header>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="w-full h-80 rounded-3xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !queue) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <PawPrint className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
          <h2 className="text-2xl font-bold text-foreground">Unable to load queue</h2>
          <p className="text-muted-foreground">Please ask reception for an update.</p>
        </div>
      </div>
    );
  }

  const nextPatient = queue.entries.find((e) => e.isNext);
  const waitingPatients = queue.entries.filter((e) => !e.isNext);

  return (
    <div className="min-h-screen bg-background p-8 md:p-12 flex flex-col font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-border/50 pb-6 gap-6">
        <div className="flex items-center gap-6">
          <CareLogo className="h-14 md:h-16 w-auto" />
          <div className="border-l border-border pl-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Waiting Room</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-1 font-medium">We appreciate your patience</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 bg-card px-6 py-4 rounded-2xl shadow-sm border border-border/50">
            <Clock className="w-7 h-7 text-primary" />
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Avg. wait
              </div>
              <div className="text-2xl font-bold text-foreground">
                {queue.totalWaiting === 0 ? "—" : `~${queue.averageWaitMinutes} min`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-2xl text-muted-foreground bg-card px-6 py-4 rounded-2xl shadow-sm border border-border/50">
            <span className="font-medium">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Next up Hero */}
        <div className="lg:col-span-4 flex flex-col">
          {nextPatient ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary text-primary-foreground rounded-[2rem] p-10 shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <SpeciesIcon species={nextPatient.species} className="w-48 h-48" />
              </div>

              <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-wider text-primary-foreground/80 mb-8">
                  Next to be seen
                </h2>

                <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-8">
                  <SpeciesIcon species={nextPatient.species} className="w-12 h-12" />
                </div>

                <h3 className="text-6xl font-bold mb-4 break-words">{nextPatient.firstName}</h3>

                <div className="mt-6 inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm">
                  <span
                    aria-hidden
                    className={cn(
                      "h-3 w-3 rounded-full ring-2 ring-white/40",
                      triageStyle(nextPatient.triageClass).dot,
                    )}
                  />
                  <span className="text-base font-semibold tracking-wide uppercase text-primary-foreground/90">
                    {triageStyle(nextPatient.triageClass).label}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border-2 border-dashed border-border rounded-[2rem] p-10 flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                Next to be seen
              </h2>
              <div className="bg-muted p-6 rounded-full mb-6">
                <PawPrint className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-3xl font-semibold text-foreground mb-2">No patients waiting</h3>
              <p className="text-xl text-muted-foreground">The vet is ready to see you.</p>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-muted-foreground uppercase tracking-wider">
              In the Queue ({waitingPatients.length})
            </h2>
            <p className="text-sm text-muted-foreground hidden md:block">
              Colour indicates triage priority
            </p>
          </div>

          <div className="flex-1 bg-card rounded-[2rem] shadow-sm border border-border/50 p-4 md:p-8 overflow-hidden flex flex-col">
            {waitingPatients.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2">
                <AnimatePresence>
                  {waitingPatients.map((patient, index) => {
                    const styles = triageStyle(patient.triageClass);
                    return (
                      <motion.div
                        key={patient.position}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-background border border-border/50 rounded-2xl flex items-stretch gap-0 shadow-sm overflow-hidden"
                      >
                        {/* Colored triage bar */}
                        <div
                          aria-hidden
                          className={cn("w-2 shrink-0", styles.bar)}
                        />

                        <div className="flex items-center gap-6 p-6 flex-1 min-w-0">
                          <div
                            className={cn(
                              "w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold shrink-0 ring-4",
                              styles.ring,
                            )}
                          >
                            {index + 2}
                          </div>

                          <div className="bg-primary/5 p-4 rounded-xl text-primary shrink-0">
                            <SpeciesIcon species={patient.species} className="w-8 h-8" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-3xl font-bold text-foreground truncate">{patient.firstName}</h4>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                aria-hidden
                                className={cn("h-2.5 w-2.5 rounded-full", styles.dot)}
                              />
                              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {styles.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <PawPrint className="w-16 h-16 text-muted-foreground/30 mb-6" />
                <h3 className="text-2xl font-medium text-muted-foreground">The queue is empty</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
