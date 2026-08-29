// Email sending via Resend.
//
// Simple email delivery for clearance workflow.

import type { ClearanceAccount } from "../clearance/types.ts";
import {
  generateOfferEmail,
  generateReminderEmail,
  generateFinalNoticeEmail,
  generateConfirmationEmail,
} from "./templates.ts";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "ClearSlate <help@clearslatedebit.com>";

/** Send email via Resend API */
async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log("\n[EMAIL] No RESEND_API_KEY, printing to console instead:\n");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`\n${params.text}\n`);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Resend API error: ${errorText}` };
    }

    const data = await response.json();
    console.log(`[EMAIL] Sent to ${params.to}: ${params.subject} (ID: ${data.id})`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/** Send initial offer email */
export async function sendOfferEmail(
  account: ClearanceAccount,
): Promise<{ success: boolean; error?: string }> {
  const email = generateOfferEmail(account);
  return sendEmail(email);
}

/** Send reminder email */
export async function sendReminderEmail(
  account: ClearanceAccount,
): Promise<{ success: boolean; error?: string }> {
  const email = generateReminderEmail(account);
  return sendEmail(email);
}

/** Send final notice email */
export async function sendFinalNoticeEmail(
  account: ClearanceAccount,
): Promise<{ success: boolean; error?: string }> {
  const email = generateFinalNoticeEmail(account);
  return sendEmail(email);
}

/** Send confirmation email */
export async function sendConfirmationEmail(
  account: ClearanceAccount,
): Promise<{ success: boolean; error?: string }> {
  const email = generateConfirmationEmail(account);
  return sendEmail(email);
}
