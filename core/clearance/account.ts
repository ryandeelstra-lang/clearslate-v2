// Account clearance logic.
//
// Core functions for managing accounts through the clearing workflow.

import crypto from "node:crypto";
import type { Ymd } from "../tape.ts";
import type { ClearanceAccount, ClearanceStatus, StatusEvent, EmailEvent } from "./types.ts";

/** Create clearance account from tape account + identity */
export function createClearanceAccount(params: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  originalCreditor: string;
  balanceCents: number;
  chargeoffDate: Ymd;
  lastPaymentDate: Ymd | null;
  matchRatio: number;
  offerExpiresDate: Ymd;
}): ClearanceAccount {
  const clearingAmountCents = Math.round(params.balanceCents / (params.matchRatio + 1));
  const offerToken = generateSecureToken(params.id, params.balanceCents);

  return {
    id: params.id,
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    phone: params.phone,
    originalCreditor: params.originalCreditor,
    balanceCents: params.balanceCents,
    chargeoffDate: params.chargeoffDate,
    lastPaymentDate: params.lastPaymentDate,
    matchRatio: params.matchRatio,
    clearingAmountCents,
    offerExpiresDate: params.offerExpiresDate,
    offerToken,
    status: "pending_contact",
    statusHistory: [{
      timestamp: new Date(),
      fromStatus: null,
      toStatus: "pending_contact",
      reason: "Account created in clearance workflow",
    }],
    emailsSent: [],
    lastContactDate: null,
    paymentMethod: null,
    paidCents: 0,
    clearedDate: null,
  };
}

/** Generate secure token for offer page URL */
function generateSecureToken(accountId: string, balanceCents: number): string {
  const secret = process.env.OFFER_TOKEN_SECRET || "dev-secret-change-in-production";
  const payload = `${accountId}:${balanceCents}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex").substring(0, 32);
}

/** Verify offer token */
export function verifyOfferToken(accountId: string, balanceCents: number, token: string): boolean {
  const expected = generateSecureToken(accountId, balanceCents);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/** Update account status */
export function updateStatus(
  account: ClearanceAccount,
  newStatus: ClearanceStatus,
  reason: string,
): ClearanceAccount {
  const event: StatusEvent = {
    timestamp: new Date(),
    fromStatus: account.status,
    toStatus: newStatus,
    reason,
  };

  return {
    ...account,
    status: newStatus,
    statusHistory: [...account.statusHistory, event],
  };
}

/** Record email sent */
export function recordEmailSent(
  account: ClearanceAccount,
  emailType: EmailEvent["emailType"],
  sent: boolean,
  error?: string,
): ClearanceAccount {
  const event: EmailEvent = {
    timestamp: new Date(),
    emailType,
    sent,
    error,
  };

  const today: Ymd = {
    y: new Date().getFullYear(),
    m: new Date().getMonth() + 1,
    d: new Date().getDate(),
  };

  return {
    ...account,
    emailsSent: [...account.emailsSent, event],
    lastContactDate: sent ? today : account.lastContactDate,
  };
}

/** Record payment */
export function recordPayment(
  account: ClearanceAccount,
  params: {
    amountCents: number;
    method: "one_time" | "plan";
    stripePaymentId?: string;
  },
): ClearanceAccount {
  const totalPaid = account.paidCents + params.amountCents;
  const isCleared = totalPaid >= account.clearingAmountCents;

  const clearedDate: Ymd | null = isCleared
    ? {
        y: new Date().getFullYear(),
        m: new Date().getMonth() + 1,
        d: new Date().getDate(),
      }
    : null;

  let newStatus: ClearanceStatus = account.status;
  if (params.method === "one_time" && isCleared) {
    newStatus = "cleared";
  } else if (params.method === "plan" && !isCleared) {
    newStatus = "payment_plan_active";
  } else if (params.method === "plan" && isCleared) {
    newStatus = "cleared";
  }

  return {
    ...account,
    paidCents: totalPaid,
    paymentMethod: params.method,
    clearedDate,
    status: newStatus,
    statusHistory: [
      ...account.statusHistory,
      {
        timestamp: new Date(),
        fromStatus: account.status,
        toStatus: newStatus,
        reason: `Payment received: $${(params.amountCents / 100).toFixed(2)}`,
      },
    ],
  };
}

/** Format currency */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format date as "September 18, 2026" */
export function formatDate(date: Ymd): string {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${monthNames[date.m - 1]} ${date.d}, ${date.y}`;
}

/** Calculate days until offer expires */
export function daysUntilExpiration(expiresDate: Ymd): number {
  const today = new Date();
  const expires = new Date(expiresDate.y, expiresDate.m - 1, expiresDate.d);
  const diffMs = expires.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
