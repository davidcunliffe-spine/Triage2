import { useEffect, useState } from "react";
import {
  useListPatients, getListPatientsQueryKey,
  useGetTriageSummary, getGetTriageSummaryQueryKey,
  getListSeenPatientsQueryKey,
  getGetPublicQueueQueryKey,
  useCreatePatient,
  useUpdatePatient,
  useMarkPatientSeen,
  useDeletePatient,
  useReorderPatients,
  type Patient,
  type TriageClass,
  type CreatePatientInput,
  type UpdatePatientInput
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { WaitTime } from "@/components/wait-time";
import { TriageBadge } from "@/components/triage-badge";
import { SpeciesIcon } from "@/components/species-icon";
import { PatientForm } from "@/components/patient-form";
import { toast } from "sonner";
import { 
  Plus, Edit2, CheckCircle2, Trash2, Clock, AlertTriangle, 
  Activity, Users, PawPrint, MoreVertical, StickyNote, GripVertical 
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface SortablePatientRowProps {
  patient: Patient;
  onMarkSeen: (id: string, name: string) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string, name: string) => void;
}

function SortablePatientRow({
  patient,
  onMarkSeen,
  onEdit,
  onDelete,
}: SortablePatientRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: patient.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background rounded-xl border border-border p-4 md:px-4 md:py-3 shadow-sm hover:shadow transition-shadow grid grid-cols-1 md:grid-cols-12 gap-4 items-center group relative overflow-hidden ${isDragging ? "shadow-lg ring-2 ring-primary/40" : ""}`}
    >
      {patient.consultationOrder === 1 && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      <div className="col-span-1 md:col-span-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Drag to reorder ${patient.name}`}
          className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 rounded-md p-1 -ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="bg-primary/5 p-2 rounded-lg text-primary shrink-0">
          <SpeciesIcon species={patient.species} className="w-5 h-5" />
        </div>
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="text-left rounded-md -mx-1 px-1 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
              aria-label={`View notes for ${patient.name}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">{patient.name}</span>
                {patient.notes && patient.notes.trim().length > 0 && (
                  <StickyNote
                    className="w-3.5 h-3.5 text-primary shrink-0"
                    aria-label="Has additional notes"
                  />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {patient.species}, {patient.age}
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="right" align="start" className="w-80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <StickyNote className="w-3.5 h-3.5 text-primary" />
                Additional notes
              </div>
              {patient.notes && patient.notes.trim().length > 0 ? (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {patient.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No additional notes recorded.
                </p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="col-span-1 md:col-span-2">
        <TriageBadge triageClass={patient.triageClass} />
      </div>

      <div
        className="col-span-1 md:col-span-3 text-sm truncate text-foreground pr-2"
        title={patient.presentingProblem}
      >
        {patient.presentingProblem}
      </div>

      <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground">
        {patient.caseOwner}
      </div>

      <div className="col-span-1 text-right font-medium flex items-center md:justify-end gap-2 text-foreground">
        <Clock className="w-4 h-4 text-muted-foreground md:hidden" />
        <WaitTime arrivedAt={patient.arrivedAt} format="long" />
      </div>

      <div className="col-span-1 flex justify-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => onMarkSeen(patient.id, patient.name)}
          title="Mark as seen"
        >
          <CheckCircle2 className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(patient)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(patient.id, patient.name)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SummaryStats() {
  const { data: summary, isLoading } = useGetTriageSummary({
    query: {
      queryKey: getGetTriageSummaryQueryKey(),
      refetchInterval: 5000,
    }
  });

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-2xl" />;
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Waiting</p>
          <p className="text-2xl font-bold">{summary.totalActive}</p>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex items-center gap-4">
        <div className="bg-triage-orange-bg p-3 rounded-xl text-triage-orange">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Avg Wait</p>
          <p className="text-2xl font-bold">{summary.averageWaitMinutes}m</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex items-center gap-4">
        <div className="bg-triage-red-bg p-3 rounded-xl text-triage-red">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Longest Wait</p>
          <p className="text-2xl font-bold">{summary.longestWaitMinutes}m</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Next Up</p>
          <p className="text-lg font-bold truncate max-w-[100px]">{summary.nextPatientName || "None"}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  useEffect(() => {
    document.title = "CARE Triage | Active Queue";
  }, []);

  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data: patients = [], isLoading, isError, refetch } = useListPatients({
    query: {
      queryKey: getListPatientsQueryKey(),
      refetchInterval: 3000,
    }
  });

  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient();
  const markSeenMut = useMarkPatientSeen();
  const deleteMut = useDeletePatient();
  const reorderMut = useReorderPatients();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const invalidateAllQueues = () => {
    queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTriageSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListSeenPatientsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPublicQueueQueryKey() });
  };

  const handleAddSubmit = (data: any) => {
    createMut.mutate(
      { data: data as CreatePatientInput },
      {
        onSuccess: () => {
          toast.success("Patient added to queue");
          setIsAddOpen(false);
          invalidateAllQueues();
        },
        onError: () => toast.error("Failed to add patient")
      }
    );
  };

  const handleEditSubmit = (data: any) => {
    if (!editingPatient) return;
    updateMut.mutate(
      { id: editingPatient.id, data: data as UpdatePatientInput },
      {
        onSuccess: () => {
          toast.success("Patient updated");
          setEditingPatient(null);
          invalidateAllQueues();
        },
        onError: () => toast.error("Failed to update patient")
      }
    );
  };

  const handleMarkSeen = (id: string, name: string) => {
    markSeenMut.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(`${name} marked as seen`);
          invalidateAllQueues();
        },
        onError: () => toast.error("Failed to mark as seen")
      }
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Ignore overlapping reorders to avoid stale-snapshot rollbacks racing
    // with later successful saves.
    if (reorderMut.isPending) return;

    const currentIds = sortedPatients.map((p) => p.id);
    const oldIndex = currentIds.indexOf(active.id as string);
    const newIndex = currentIds.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedPatients, oldIndex, newIndex).map(
      (p, i) => ({ ...p, consultationOrder: i + 1 }),
    );

    await queryClient.cancelQueries({ queryKey: getListPatientsQueryKey() });
    const previous = queryClient.getQueryData(getListPatientsQueryKey());
    queryClient.setQueryData(getListPatientsQueryKey(), reordered);

    reorderMut.mutate(
      { data: { ids: reordered.map((p) => p.id) } },
      {
        onSuccess: () => {
          invalidateAllQueues();
        },
        onError: (err: unknown) => {
          if (previous !== undefined) {
            queryClient.setQueryData(getListPatientsQueryKey(), previous);
          }
          const status =
            typeof err === "object" && err !== null && "response" in err
              ? (err as { response?: { status?: number } }).response?.status
              : undefined;
          if (status === 409) {
            toast.error(
              "Queue changed while you were dragging — refreshed to the latest.",
            );
          } else {
            toast.error("Couldn't save the new order — reverted.");
          }
          invalidateAllQueues();
        },
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the active queue? They will still appear in patient history for reporting.`)) return;
    deleteMut.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(`${name} removed from queue`);
          invalidateAllQueues();
        },
        onError: () => toast.error("Failed to remove patient")
      }
    );
  };

  // Sort: Consultation Order Ascending (with nulls last), then Triage Class severity
  const triagePriority: Record<TriageClass, number> = { red: 1, orange: 2, yellow: 3, green: 4, blue: 5 };
  
  const sortedPatients = [...patients].sort((a, b) => {
    if (a.consultationOrder !== null && b.consultationOrder !== null) {
      if (a.consultationOrder !== b.consultationOrder) return a.consultationOrder - b.consultationOrder;
    } else if (a.consultationOrder !== null) {
      return -1;
    } else if (b.consultationOrder !== null) {
      return 1;
    }
    
    // Sort by triage urgency
    if (triagePriority[a.triageClass] !== triagePriority[b.triageClass]) {
      return triagePriority[a.triageClass] - triagePriority[b.triageClass];
    }
    
    // Finally by arrival time
    return new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime();
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Active Queue</h1>
            <p className="text-muted-foreground mt-1">Manage waiting patients and triage priorities</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-medium px-6 shadow-sm hover:shadow transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Patient to Queue</DialogTitle>
              </DialogHeader>
              <PatientForm 
                onSubmit={handleAddSubmit} 
                isSubmitting={createMut.isPending} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <SummaryStats />

        <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Error loading patients</p>
                <Button onClick={() => refetch()} variant="outline">Retry</Button>
              </div>
            ) : sortedPatients.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PawPrint className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No active patients</h3>
                <p className="text-muted-foreground mb-6">The waiting room is clear.</p>
                <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-xl">
                  Add the first patient
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-2">Triage</div>
                  <div className="col-span-3">Problem</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-1 text-right">Wait</div>
                  <div className="col-span-1"></div>
                </div>

                <p className="hidden md:block text-xs text-muted-foreground px-4 -mt-1">
                  Drag the handle on the left of any row to change the consultation order.
                </p>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedPatients.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {sortedPatients.map((patient) => (
                        <SortablePatientRow
                          key={patient.id}
                          patient={patient}
                          onMarkSeen={handleMarkSeen}
                          onEdit={(p) => setEditingPatient(p)}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPatient} onOpenChange={(o) => !o && setEditingPatient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm 
              initialValues={editingPatient}
              onSubmit={handleEditSubmit}
              isSubmitting={updateMut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
