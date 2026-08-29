// Clearance workflow types.
//
// Tracks accounts through the clearing journey: offer → payment → cleared

import type { Ymd } from "../tape.ts";

/** Account in clearance workflow */
export interface ClearanceAccount {
  // Identity (for clearing workflow, not underwriting)
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;

  // Debt details
  readonly originalCreditor: string;
  readonly balanceCents: number;
  readonly chargeoffDate: Ymd;
  readonly lastPaymentDate: Ymd | null;

  // Offer
  readonly matchRatio: number; // e.g., 2 = pay $1, cancel $2
  readonly clearingAmountCents: number; // balance / (matchRatio + 1)
  readonly offerExpiresDate: Ymd;
  readonly offerToken: string; // secure token for offer page URL

  // Status
  readonly status: ClearanceStatus;
  readonly statusHistory: StatusEvent[];

  // Contact tracking
  readonly emailsSent: EmailEvent[];
  readonly lastContactDate: Ymd | null;

  // Payment (if applicable)
  readonly paymentMethod: "one_time" | "plan" | null;
  readonly paidCents: number;
  readonly clearedDate: Ymd | null;
}

export type ClearanceStatus =
  | "pending_contact" // Just purchased, not contacted yet
  | "offer_sent" // Email sent, waiting for response
  | "offer_viewed" // User opened offer page
  | "payment_pending" // User initiated payment
  | "payment_plan_active" // On 3-month payment plan
  | "cleared" // Fully paid, balance $0
  | "disputed" // User filed dispute
  | "dispute_verified" // Dispute auto-verified, offer still stands
  | "dispute_forgiven" // Couldn't verify, debt forgiven
  | "written_off"; // No response after 21 days, forgiven

export interface StatusEvent {
  readonly timestamp: Date;
  readonly fromStatus: ClearanceStatus | null;
  readonly toStatus: ClearanceStatus;
  readonly reason: string;
}

export interface EmailEvent {
  readonly timestamp: Date;
  readonly emailType: "offer_initial" | "offer_reminder" | "offer_final" | "confirmation" | "dispute_response";
  readonly sent: boolean;
  readonly error?: string;
}

/** Payment plan schedule */
export interface PaymentPlan {
  readonly accountId: string;
  readonly totalAmountCents: number;
  readonly monthlyAmountCents: number;
  readonly paymentsTotal: 3; // Always 3 for MVP
  readonly paymentsCompleted: number;
  readonly stripeSubscriptionId: string | null;
  readonly nextPaymentDate: Ymd | null;
}

/** Dispute record */
export interface Dispute {
  readonly accountId: string;
  readonly filedDate: Date;
  readonly reason: "dont_recognize" | "wrong_balance" | "already_paid" | "not_mine" | "other";
  readonly reasonText?: string;
  readonly status: "pending" | "verified" | "forgiven";
  readonly resolvedDate: Date | null;
  readonly resolution?: string;
}
