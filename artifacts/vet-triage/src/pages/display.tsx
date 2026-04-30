import { useEffect } from "react";
import { useGetPublicQueue, getGetPublicQueueQueryKey } from "@workspace/api-client-react";
import { Clock, PawPrint } from "lucide-react";
import { SpeciesIcon } from "@/components/species-icon";
import { CareLogo } from "@/components/care-logo";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisplayPage() {
  useEffect(() => {
    document.title = "CARE Triage | Waiting Room";
  }, []);

  const { data: queue, isLoading, isError, refetch } = useGetPublicQueue({
    query: {
      queryKey: getGetPublicQueueQueryKey(),
      refetchInterval: 5000, // Refresh every 5 seconds
    }
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

  const nextPatient = queue.entries.find(e => e.isNext);
  const waitingPatients = queue.entries.filter(e => !e.isNext);

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
        <div className="hidden md:flex items-center gap-3 text-2xl text-muted-foreground bg-card px-6 py-4 rounded-2xl shadow-sm border border-border/50">
          <Clock className="w-8 h-8 text-foreground" />
          <span className="font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Next up Hero */}
        <div className="lg:col-span-4 flex flex-col">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Next to be seen</h2>
          
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
                <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-8">
                  <SpeciesIcon species={nextPatient.species} className="w-12 h-12" />
                </div>
                
                <h3 className="text-6xl font-bold mb-4 break-words">{nextPatient.firstName}</h3>
                
                <div className="mt-8 flex items-center gap-3 text-primary-foreground/80 text-xl">
                  <Clock className="w-6 h-6" />
                  <span>Waiting ~{nextPatient.waitMinutes}m</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border-2 border-dashed border-border rounded-[2rem] p-10 flex-1 flex flex-col items-center justify-center text-center">
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
            <h2 className="text-2xl font-semibold text-muted-foreground uppercase tracking-wider">In the Queue ({waitingPatients.length})</h2>
          </div>
          
          <div className="flex-1 bg-card rounded-[2rem] shadow-sm border border-border/50 p-4 md:p-8 overflow-hidden flex flex-col">
            {waitingPatients.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2">
                <AnimatePresence>
                  {waitingPatients.map((patient, index) => (
                    <motion.div
                      key={patient.position}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-background border border-border/50 rounded-2xl p-6 flex items-center gap-6 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold shrink-0">
                        {index + 2}
                      </div>
                      
                      <div className="bg-primary/5 p-4 rounded-xl text-primary shrink-0">
                        <SpeciesIcon species={patient.species} className="w-8 h-8" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-3xl font-bold text-foreground truncate">{patient.firstName}</h4>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Wait Time</div>
                        <div className="text-2xl font-semibold text-foreground flex items-center gap-2 justify-end">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          {patient.waitMinutes}m
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
