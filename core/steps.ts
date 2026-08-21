// The canonical "path to financial freedom" ladder. Static, logic-bearing config
// kept in code rather than a table — the evaluator needs these typed defs anyway.
// Ported from backend/src/steps/catalog.ts; the 5-step count is canonical.

export type CriteriaType = "auto_cashflow" | "auto_debt" | "manual";

// done      — criterion met, or self-attested
// current   — the hard gate the user is actively on
// available — an OPTIONAL milestone reachable now that never blocks progress
// locked    — a gate above the current frontier
export type StepStatus = "done" | "current" | "available" | "locked";

export interface StepDef {
  key: string;
  position: number;
  name: string;
  description: string;
  criteriaType: CriteriaType;
  /** Optional milestones (savings) never block the ladder. */
  optional?: boolean;
  manualTargetCents?: number;
}

export const STEPS: readonly StepDef[] = [
  {
    key: "stop_the_bleeding",
    position: 1,
    name: "Stop the bleeding",
    description:
      "End the month with more money coming in than going out. Add income or cut spending until you're no longer going backwards.",
    criteriaType: "auto_cashflow",
  },
  {
    key: "starter_fund",
    position: 2,
    name: "Starter emergency fund",
    description:
      "Save your first $500 so a surprise expense doesn't become new debt.",
    criteriaType: "manual",
    optional: true,
    manualTargetCents: 50_000,
  },
  {
    key: "debt_snowball",
    position: 3,
    name: "Debt snowball",
    description: "Pay off your consumer debt, smallest balance first.",
    criteriaType: "auto_debt",
  },
  {
    key: "full_safety_net",
    position: 4,
    name: "Full safety net",
    description: "Save 3–6 months of expenses for real security.",
    criteriaType: "manual",
    optional: true,
  },
  {
    key: "invest",
    position: 5,
    name: "Invest",
    description:
      "Put your freed-up money to work and build wealth for the future.",
    criteriaType: "manual",
  },
] as const;

export const AUTO_GATES: readonly StepDef[] = STEPS.filter(
  (s) => s.criteriaType !== "manual",
);

export function stepByKey(key: string): StepDef | undefined {
  return STEPS.find((s) => s.key === key);
}

/** What the ladder needs to know about the user's real finances. */
export type LadderMetrics = {
  hasIncomeData: boolean;
  lastMonthIncomeCents: number;
  lastMonthOutflowCents: number;
  hasDebtReading: boolean;
  currentDebtCents: number;
};

/**
 * Did last month end net non-negative? You cannot get out of debt while going
 * backwards each month. This is deliberately NOT a permanent achievement — a
 * relapse pulls the user back to this step.
 */
export function bleedingStopped(m: LadderMetrics): boolean {
  if (!m.hasIncomeData) return false;
  return m.lastMonthOutflowCents <= m.lastMonthIncomeCents;
}

export function isAutoSatisfied(step: StepDef, m: LadderMetrics): boolean {
  switch (step.criteriaType) {
    case "auto_cashflow":
      return bleedingStopped(m);
    case "auto_debt":
      return m.hasDebtReading && m.currentDebtCents <= 0;
    default:
      return false;
  }
}

export type LadderEntry = StepDef & {
  status: StepStatus;
  /** Why this step is where it is — shown to the user, never a black box. */
  reason: string;
};

/**
 * Build the ladder. Position is derived live from finances, not from how many
 * milestones were ticked: the frontier is the lowest unsatisfied hard gate.
 */
export function buildLadder(
  m: LadderMetrics,
  attested: ReadonlySet<string>,
): { steps: LadderEntry[]; currentKey: string } {
  // The lowest auto gate that is not satisfied is where the user actually is.
  const frontier = AUTO_GATES.find((g) => !isAutoSatisfied(g, m));
  const frontierPos = frontier?.position ?? Number.MAX_SAFE_INTEGER;

  const steps: LadderEntry[] = STEPS.map((step) => {
    if (step.criteriaType !== "manual") {
      const satisfied = isAutoSatisfied(step, m);
      if (satisfied) {
        return {
          ...step,
          status: "done",
          reason:
            step.criteriaType === "auto_cashflow"
              ? "Last month you took in more than you spent."
              : "Your tracked consumer debt is cleared.",
        };
      }
      if (step.position === frontierPos) {
        return {
          ...step,
          status: "current",
          reason:
            step.criteriaType === "auto_cashflow"
              ? !m.hasIncomeData
                ? "We can't see income yet, so we can't confirm this. Connect the account your pay lands in."
                : "Last month you spent more than you took in."
              : "You still have consumer debt to clear.",
        };
      }
      return {
        ...step,
        status: "locked",
        reason: "Finish the step below first.",
      };
    }

    // Manual steps.
    if (attested.has(step.key)) {
      return { ...step, status: "done", reason: "You marked this done." };
    }
    // Optional milestones are reachable whenever the gates *below* them pass.
    const gateBelow = AUTO_GATES.filter((g) => g.position < step.position);
    const reachable = gateBelow.every((g) => isAutoSatisfied(g, m));
    if (reachable) {
      return {
        ...step,
        status: "available",
        reason: step.optional
          ? "Optional — you can work on this any time."
          : "You're ready for this.",
      };
    }
    return { ...step, status: "locked", reason: "Finish the step below first." };
  });

  const currentKey =
    steps.find((s) => s.status === "current")?.key ??
    STEPS[STEPS.length - 1]!.key;

  return { steps, currentKey };
}
