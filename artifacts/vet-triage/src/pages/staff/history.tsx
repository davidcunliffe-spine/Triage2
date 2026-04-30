import { useEffect } from "react";
import {
  useListSeenPatients, getListSeenPatientsQueryKey,
  useRestorePatient,
  getListPatientsQueryKey,
  getGetTriageSummaryQueryKey,
  getGetPublicQueueQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { TriageBadge } from "@/components/triage-badge";
import { SpeciesIcon } from "@/components/species-icon";
import { toast } from "sonner";
import { History, Download, RotateCcw, FileText, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInMinutes, format } from "date-fns";

export default function HistoryPage() {
  useEffect(() => {
    document.title = "CARE Triage | History";
  }, []);

  const queryClient = useQueryClient();
  const { data: seenPatients = [], isLoading, isError } = useListSeenPatients({
    query: {
      queryKey: getListSeenPatientsQueryKey()
    }
  });

  const restoreMut = useRestorePatient();

  const handleRestore = (id: string, name: string) => {
    restoreMut.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(`${name} restored to active queue`);
          queryClient.invalidateQueries({ queryKey: getListSeenPatientsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTriageSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPublicQueueQueryKey() });
        },
        onError: () => toast.error("Failed to restore patient")
      }
    );
  };

  const handleDownloadCSV = () => {
    if (seenPatients.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = ["Patient Name", "Age", "Species", "Presenting Problem", "Triage Class", "Case Owner", "Arrived At", "Seen At", "Wait Time (mins)"];
    
    const rows = seenPatients.map(p => {
      const waitTime = p.seenAt ? differenceInMinutes(new Date(p.seenAt), new Date(p.arrivedAt)) : 0;
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.age.replace(/"/g, '""')}"`,
        `"${p.species}"`,
        `"${p.presentingProblem.replace(/"/g, '""')}"`,
        `"${p.triageClass}"`,
        `"${p.caseOwner.replace(/"/g, '""')}"`,
        `"${new Date(p.arrivedAt).toISOString()}"`,
        `"${p.seenAt ? new Date(p.seenAt).toISOString() : ''}"`,
        waitTime
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vet-triage-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <History className="w-8 h-8 text-primary" />
              Patient History
            </h1>
            <p className="text-muted-foreground mt-1">Recently seen and discharged patients</p>
          </div>
          
          <Button 
            variant="outline" 
            className="rounded-xl bg-white" 
            onClick={handleDownloadCSV}
            disabled={seenPatients.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-destructive">
                Error loading history
              </div>
            ) : seenPatients.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No history yet</h3>
                <p className="text-muted-foreground">Seen patients will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-2">Triage</div>
                  <div className="col-span-3">Timing</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {seenPatients.map((patient) => {
                  const waitMins = patient.seenAt ? differenceInMinutes(new Date(patient.seenAt), new Date(patient.arrivedAt)) : 0;
                  
                  return (
                    <div
                      key={patient.id}
                      className="bg-background rounded-xl border border-border p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg text-muted-foreground shrink-0">
                          <SpeciesIcon species={patient.species} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">{patient.species}, {patient.age}</div>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <TriageBadge triageClass={patient.triageClass} />
                      </div>

                      <div className="col-span-1 md:col-span-3 text-sm">
                        <div className="text-foreground">Wait: <span className="font-medium">{waitMins}m</span></div>
                        <div className="text-muted-foreground text-xs">Seen: {patient.seenAt ? format(new Date(patient.seenAt), 'h:mm a') : 'N/A'}</div>
                      </div>

                      <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground">
                        {patient.caseOwner}
                      </div>

                      <div className="col-span-1 md:col-span-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={() => handleRestore(patient.id, patient.name)}
                          disabled={restoreMut.isPending}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" /> Restore
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
