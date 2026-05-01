import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TriageClass, Species } from "@workspace/api-client-react";
import { TriageBadge } from "./triage-badge";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  age: z.string().min(1, "Age is required"),
  presentingProblem: z.string().min(1, "Presenting problem is required"),
  triageClass: z.enum(["red", "orange", "yellow", "green", "blue"]).optional(),
  caseOwner: z.string().optional(),
  consultationOrder: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[1-9]\d*$/.test(v),
      "Consultation order must be a positive whole number",
    ),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface PatientFormSubmit {
  name: string;
  species: string;
  age: string;
  presentingProblem: string;
  triageClass?: TriageClass;
  caseOwner?: string;
  consultationOrder?: number | null;
  notes?: string | null;
}

interface PatientFormProps {
  initialValues?: Partial<{
    name: string;
    species: string;
    age: string;
    presentingProblem: string;
    triageClass: TriageClass | null;
    caseOwner: string | null;
    consultationOrder: number | null;
    notes: string | null;
  }>;
  onSubmit: (data: PatientFormSubmit) => void;
  isSubmitting?: boolean;
}

export function PatientForm({ initialValues, onSubmit, isSubmitting }: PatientFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      species: initialValues?.species || "Dog",
      age: initialValues?.age || "",
      presentingProblem: initialValues?.presentingProblem || "",
      triageClass: (initialValues?.triageClass as TriageClass) || undefined,
      caseOwner: initialValues?.caseOwner || "",
      consultationOrder: initialValues?.consultationOrder != null ? String(initialValues.consultationOrder) : "",
      notes: initialValues?.notes ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const payload: PatientFormSubmit = {
            name: values.name,
            species: values.species,
            age: values.age,
            presentingProblem: values.presentingProblem,
            triageClass: values.triageClass,
            caseOwner: values.caseOwner || undefined,
            consultationOrder: values.consultationOrder
              ? parseInt(values.consultationOrder, 10)
              : null,
            notes: values.notes ? values.notes : null,
          };
          onSubmit(payload);
        })}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Bella" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 6 months" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caseOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Owner (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dr. Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="triageClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Triage Class (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="red"><TriageBadge triageClass="red" /></SelectItem>
                  <SelectItem value="orange"><TriageBadge triageClass="orange" /></SelectItem>
                  <SelectItem value="yellow"><TriageBadge triageClass="yellow" /></SelectItem>
                  <SelectItem value="green"><TriageBadge triageClass="green" /></SelectItem>
                  <SelectItem value="blue"><TriageBadge triageClass="blue" /></SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="presentingProblem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presenting Problem</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Vomiting, Lethargy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="consultationOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation Order (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any other details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
