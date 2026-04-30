import {
  Router,
  type IRouter,
  type Request,
  type Response,
} from "express";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db, patientsTable, type Patient } from "@workspace/db";
import {
  CreatePatientBody,
  UpdatePatientBody,
  UpdatePatientParams,
  DeletePatientParams,
  MarkPatientSeenParams,
  RestorePatientParams,
  ReorderPatientsBody,
  ListPatientsResponse,
  UpdatePatientResponse,
  MarkPatientSeenResponse,
  RestorePatientResponse,
  ReorderPatientsResponse,
  ListSeenPatientsResponse,
  GetTriageSummaryResponse,
  GetPublicQueueResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

type TriageClass = "red" | "orange" | "yellow" | "green" | "blue";
type PatientStatus = "waiting" | "seen" | "removed";
const TRIAGE_RANK: Record<TriageClass, number> = {
  red: 0,
  orange: 1,
  yellow: 2,
  green: 3,
  blue: 4,
};

function statusOf(p: Patient): PatientStatus {
  if (p.isRemoved) return "removed";
  if (p.isSeen) return "seen";
  return "waiting";
}

function toApiPatient(p: Patient) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    species: p.species,
    presentingProblem: p.presentingProblem,
    triageClass: p.triageClass as TriageClass,
    consultationOrder: p.consultationOrder,
    caseOwner: p.caseOwner,
    arrivedAt: p.arrivedAt,
    seenAt: p.seenAt,
    removedAt: p.removedAt,
    status: statusOf(p),
    notes: p.notes,
  };
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(" ");
  return space === -1 ? trimmed : trimmed.slice(0, space);
}

function minutesSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
}

const activeFilter = and(
  eq(patientsTable.isSeen, false),
  eq(patientsTable.isRemoved, false),
);

class ReorderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReorderConflictError";
  }
}

router.get(
  "/patients",
  requireAuth,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(patientsTable)
      .where(activeFilter)
      .orderBy(asc(patientsTable.arrivedAt));

    const ordered = [...rows].sort((a, b) => {
      const ao = a.consultationOrder ?? Number.POSITIVE_INFINITY;
      const bo = b.consultationOrder ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      const ar = TRIAGE_RANK[a.triageClass as TriageClass] ?? 99;
      const br = TRIAGE_RANK[b.triageClass as TriageClass] ?? 99;
      if (ar !== br) return ar - br;
      return a.arrivedAt.getTime() - b.arrivedAt.getTime();
    });

    res.json(ListPatientsResponse.parse(ordered.map(toApiPatient)));
  },
);

router.post(
  "/patients",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreatePatientBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { consultationOrder, notes, ...rest } = parsed.data;
    const [row] = await db
      .insert(patientsTable)
      .values({
        ...rest,
        consultationOrder: consultationOrder ?? null,
        notes: notes ?? null,
        createdBy: req.userId ?? null,
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to create patient" });
      return;
    }
    res.status(201).json(UpdatePatientResponse.parse(toApiPatient(row)));
  },
);

router.patch(
  "/patients/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdatePatientParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdatePatientBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const updates: Partial<typeof patientsTable.$inferInsert> = {};
    if (body.data.name !== undefined) updates.name = body.data.name;
    if (body.data.age !== undefined) updates.age = body.data.age;
    if (body.data.species !== undefined) updates.species = body.data.species;
    if (body.data.presentingProblem !== undefined)
      updates.presentingProblem = body.data.presentingProblem;
    if (body.data.triageClass !== undefined)
      updates.triageClass = body.data.triageClass;
    if (body.data.consultationOrder !== undefined)
      updates.consultationOrder = body.data.consultationOrder ?? null;
    if (body.data.caseOwner !== undefined)
      updates.caseOwner = body.data.caseOwner;
    if (body.data.notes !== undefined) updates.notes = body.data.notes ?? null;

    if (Object.keys(updates).length === 0) {
      const [existing] = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, params.data.id));
      if (!existing) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      res.json(UpdatePatientResponse.parse(toApiPatient(existing)));
      return;
    }

    const [row] = await db
      .update(patientsTable)
      .set(updates)
      .where(eq(patientsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(UpdatePatientResponse.parse(toApiPatient(row)));
  },
);

router.delete(
  "/patients/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeletePatientParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    // Soft-remove so the patient still appears in seen / removed history reports.
    const [row] = await db
      .update(patientsTable)
      .set({
        isRemoved: true,
        removedAt: new Date(),
        consultationOrder: null,
      })
      .where(eq(patientsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.sendStatus(204);
  },
);

router.post(
  "/patients/reorder",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = ReorderPatientsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { ids } = parsed.data;

    if (new Set(ids).size !== ids.length) {
      res.status(400).json({ error: "Duplicate patient ids in reorder list" });
      return;
    }

    try {
      // SERIALIZABLE isolation gives us predicate locks on the active set, so
      // PostgreSQL will abort with a serialization failure if a concurrent
      // create / restore / mark-seen / delete changes the active queue while
      // we're reordering. We translate that into a 409 the client can handle.
      const ordered = await db.transaction(
        async (tx) => {
          const activeRows = await tx
            .select()
            .from(patientsTable)
            .where(activeFilter);

          const activeIds = new Set(activeRows.map((p) => p.id));
          const submittedIds = new Set(ids);

          if (
            submittedIds.size !== activeIds.size ||
            ![...submittedIds].every((id) => activeIds.has(id))
          ) {
            throw new ReorderConflictError(
              "Active queue changed since the page was loaded. Please refresh and try again.",
            );
          }

          for (let i = 0; i < ids.length; i++) {
            await tx
              .update(patientsTable)
              .set({ consultationOrder: i + 1 })
              .where(
                and(eq(patientsTable.id, ids[i]!), activeFilter),
              );
          }

          const rows = await tx
            .select()
            .from(patientsTable)
            .where(activeFilter);

          return [...rows].sort((a, b) => {
            const ao = a.consultationOrder ?? Number.POSITIVE_INFINITY;
            const bo = b.consultationOrder ?? Number.POSITIVE_INFINITY;
            if (ao !== bo) return ao - bo;
            const ar = TRIAGE_RANK[a.triageClass as TriageClass] ?? 99;
            const br = TRIAGE_RANK[b.triageClass as TriageClass] ?? 99;
            if (ar !== br) return ar - br;
            return a.arrivedAt.getTime() - b.arrivedAt.getTime();
          });
        },
        { isolationLevel: "serializable" },
      );

      res.json(ReorderPatientsResponse.parse(ordered.map(toApiPatient)));
    } catch (err) {
      if (err instanceof ReorderConflictError) {
        res.status(409).json({ error: err.message });
        return;
      }
      // PostgreSQL serialization failure (40001) — concurrent change to the
      // active queue. Surface as a conflict so the client can refresh.
      const pickCode = (e: unknown): string | undefined =>
        typeof e === "object" && e !== null && "code" in e
          ? (e as { code?: string }).code
          : undefined;
      const sqlState =
        pickCode(err) ??
        pickCode(
          typeof err === "object" && err !== null && "cause" in err
            ? (err as { cause?: unknown }).cause
            : undefined,
        );
      if (sqlState === "40001") {
        res.status(409).json({
          error:
            "Active queue changed while reordering. Please refresh and try again.",
        });
        return;
      }
      throw err;
    }
  },
);

router.post(
  "/patients/:id/mark-seen",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = MarkPatientSeenParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [row] = await db
      .update(patientsTable)
      .set({
        isSeen: true,
        seenAt: new Date(),
        consultationOrder: null,
      })
      .where(eq(patientsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(MarkPatientSeenResponse.parse(toApiPatient(row)));
  },
);

router.post(
  "/patients/:id/restore",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = RestorePatientParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [row] = await db
      .update(patientsTable)
      .set({
        isSeen: false,
        seenAt: null,
        isRemoved: false,
        removedAt: null,
      })
      .where(eq(patientsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(RestorePatientResponse.parse(toApiPatient(row)));
  },
);

router.get(
  "/patients/seen",
  requireAuth,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(patientsTable)
      .where(
        or(
          eq(patientsTable.isSeen, true),
          eq(patientsTable.isRemoved, true),
        ),
      );
    const sorted = [...rows].sort((a, b) => {
      const ad = (a.seenAt ?? a.removedAt ?? a.arrivedAt).getTime();
      const bd = (b.seenAt ?? b.removedAt ?? b.arrivedAt).getTime();
      return bd - ad;
    });
    res.json(ListSeenPatientsResponse.parse(sorted.map(toApiPatient)));
    void desc;
  },
);

router.get(
  "/triage/summary",
  requireAuth,
  async (_req, res): Promise<void> => {
    const rows = await db.select().from(patientsTable).where(activeFilter);

    const counts: Record<TriageClass, number> = {
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      blue: 0,
    };
    let totalWait = 0;
    let longest = 0;
    for (const r of rows) {
      const tc = r.triageClass as TriageClass;
      if (tc in counts) counts[tc] += 1;
      const wait = minutesSince(r.arrivedAt);
      totalWait += wait;
      if (wait > longest) longest = wait;
    }
    const total = rows.length;
    const next =
      rows
        .filter((r) => r.consultationOrder === 1)
        .map((r) => firstName(r.name))[0] ?? null;

    res.json(
      GetTriageSummaryResponse.parse({
        totalActive: total,
        averageWaitMinutes: total === 0 ? 0 : Math.round(totalWait / total),
        longestWaitMinutes: longest,
        countsByClass: counts,
        nextPatientName: next,
      }),
    );
  },
);

router.get("/public/queue", async (_req, res): Promise<void> => {
  const rows = await db.select().from(patientsTable).where(activeFilter);

  const ordered = [...rows].sort((a, b) => {
    const ao = a.consultationOrder ?? Number.POSITIVE_INFINITY;
    const bo = b.consultationOrder ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.arrivedAt.getTime() - b.arrivedAt.getTime();
  });

  // "Next" must be explicitly designated by staff (consultation order 1).
  // Do NOT fall back to the first row, that would mislead pet owners.
  const next = ordered.find((r) => r.consultationOrder === 1) ?? null;

  res.json(
    GetPublicQueueResponse.parse({
      updatedAt: new Date(),
      nextPatientFirstName: next ? firstName(next.name) : null,
      totalWaiting: ordered.length,
      entries: ordered.map((r, idx) => ({
        position: idx + 1,
        firstName: firstName(r.name),
        species: r.species,
        isNext: next ? r.id === next.id : false,
        waitMinutes: minutesSince(r.arrivedAt),
      })),
    }),
  );
});

export default router;
