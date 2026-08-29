// Email templates, revision 2 — evidence-based sequence.
//
// Supersedes templates.ts. See docs/research/u15-opening-move.md for the
// evidence behind every choice here.
//
// THE CORE INVERSION: prove ourselves first, let them discover the offer second.
// Trust is the binding constraint at first contact. Price is the binding
// constraint at second contact. templates.ts solved them in the wrong order.
//
// What changed and why:
//   - Contact 1 carries NO offer and NO price. Our old subject line hit four of
//     four FTC debt-relief-scam markers (unsolicited, >70% reduction promised,
//     deadline pressure, unique-method claim).
//   - Personalization by name is kept everywhere. It is the one messaging lever
//     with clean support (Latvia RCT, n=9,196: doubled payment rate; every other
//     arm — social norm, prosocial loss-frame, prosocial gain-frame — was null).
//   - No social-norm lines. Null in Latvia, backfired in the Netherlands RCTs.
//   - No prosocial or moral appeal. Null in both frames.
//   - Discounts stated as PERCENTAGE first, dollars second (Kuan et al. 2025
//     PNAS, 13M-person RCT: percentage framing beat dollar framing by 0.14pp).
//   - Never "forgive", "relief", "gift", or "charity". Kluender et al. 2024
//     (n=83,401, two RCTs) found gifted debt relief produces no mental-health or
//     financial-wellness benefit. Our only theoretical escape is effort
//     justification — the person BUYS the closure. Calling it a gift destroys
//     the mechanism.
//   - Dispute link is in email #1, prominently. Scams do not hand you a dispute
//     button; doing so is our cheapest legitimacy signal.
//   - Autonomy-supportive phrasing throughout ("you can decide", "your call").
//     20% of consumers withhold a planned payment after a controlling contact.

import type { ClearanceAccount } from "../clearance/types.ts";
import { formatCurrency, formatDate } from "../clearance/account.ts";

export interface RenderedEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function baseUrl(): string {
  return process.env.BASE_URL || "http://localhost:3000";
}

function offerUrl(token: string): string {
  return `${baseUrl()}/offer/${token}`;
}

function verifyUrl(token: string): string {
  return `${baseUrl()}/verify/${token}`;
}

function disputeUrl(token: string): string {
  return `${baseUrl()}/dispute/${token}`;
}

/** Percentage of the balance that gets cancelled at a given match ratio. */
export function cancelledPercent(matchRatio: number): number {
  // clearing amount = balance / (R+1); cancelled = balance - clearing
  return Math.round((matchRatio / (matchRatio + 1)) * 100);
}

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f6f7f9;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
    <div style="margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
      <div style="font-size:20px;font-weight:700;color:#1d4ed8;">ClearSlate</div>
      <div style="font-size:13px;color:#6b7280;margin-top:2px;">ClearSlate LLC · Texas · EIN 42-2819082</div>
    </div>
    ${bodyHtml}
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT 1 — RECOGNITION
// No offer. No price. No deadline. No CTA that costs anything.
// Goal: be verifiable, be human, be zero-pressure, invite scrutiny.
// ─────────────────────────────────────────────────────────────────────────────

export function renderRecognitionEmail(account: ClearanceAccount): RenderedEmail {
  const balance = formatCurrency(account.balanceCents);
  const chargeoff = formatDate(account.chargeoffDate);

  const subject = `We bought your ${account.originalCreditor} account — here's how to check that`;

  const text = `Hi ${account.firstName},

I'll be direct about why you're getting this email.

ClearSlate bought your ${account.originalCreditor} account. It was charged off on ${chargeoff} with a balance of ${balance}. We own it now.

You've never heard of us, and an email like this is exactly what a scam looks like. So before anything else, here's how to check us out:

  - We're ClearSlate LLC, a Texas company. EIN 42-2819082.
  - You have a legal right to make us prove this debt is yours. Use it:
    ${disputeUrl(account.offerToken)}
  - If you dispute, we stop all contact until we've sent you written proof. That's the law, and we follow it.
  - Full account details and your rights: ${verifyUrl(account.offerToken)}

Here's what we will never do:

  - We will not sue you.
  - We will not garnish your wages.
  - We will not report anything new to the credit bureaus that hurts you.
  - We will not call you at work, or call your family, or threaten you.

We make money one way only: when the amount you owe goes down. That's the whole company. We have no way to profit from late fees, penalties, or dragging this out, because we don't charge any.

There's nothing for you to do right now. No payment, no deadline, no decision. I'll follow up in a few days to walk through your options, and there are more of them than you'd expect.

If you'd rather we didn't email you again, reply with "stop" and we'll stop.

— The ClearSlate Team
help@clearslatedebit.com

---
This is a communication from a debt collector. This is an attempt to collect a debt and any information obtained will be used for that purpose. Your validation rights: ${verifyUrl(account.offerToken)}`;

  const html = shell(`
  <p>Hi ${account.firstName},</p>

  <p>I'll be direct about why you're getting this email.</p>

  <p><strong>ClearSlate bought your ${account.originalCreditor} account.</strong> It was charged off on ${chargeoff} with a balance of ${balance}. We own it now.</p>

  <p>You've never heard of us, and an email like this is exactly what a scam looks like. So before anything else, here's how to check us out:</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin:20px 0;">
    <p style="margin:0 0 10px 0;">We're <strong>ClearSlate LLC</strong>, a Texas company. EIN 42-2819082.</p>
    <p style="margin:0 0 10px 0;">You have a legal right to make us prove this debt is yours.</p>
    <p style="margin:0 0 14px 0;">If you dispute, we stop all contact until we've sent you written proof. That's the law, and we follow it.</p>
    <a href="${disputeUrl(account.offerToken)}" style="display:inline-block;background:#ffffff;border:1.5px solid #1d4ed8;color:#1d4ed8;text-decoration:none;padding:11px 20px;border-radius:6px;font-weight:600;font-size:14px;">Make us prove it</a>
    <div style="margin-top:12px;font-size:13px;">
      <a href="${verifyUrl(account.offerToken)}" style="color:#1d4ed8;">See full account details and your rights →</a>
    </div>
  </div>

  <p><strong>Here's what we will never do:</strong></p>
  <ul style="padding-left:20px;margin:12px 0;">
    <li style="margin-bottom:6px;">We will not sue you.</li>
    <li style="margin-bottom:6px;">We will not garnish your wages.</li>
    <li style="margin-bottom:6px;">We will not report anything new to the credit bureaus that hurts you.</li>
    <li style="margin-bottom:6px;">We will not call you at work, or call your family, or threaten you.</li>
  </ul>

  <p>We make money one way only: <strong>when the amount you owe goes down.</strong> That's the whole company. We have no way to profit from late fees, penalties, or dragging this out, because we don't charge any.</p>

  <p><strong>There's nothing for you to do right now.</strong> No payment, no deadline, no decision. I'll follow up in a few days to walk through your options, and there are more of them than you'd expect.</p>

  <p style="color:#6b7280;font-size:14px;">If you'd rather we didn't email you again, reply with "stop" and we'll stop.</p>

  <p>— The ClearSlate Team<br>
  <a href="mailto:help@clearslatedebit.com" style="color:#1d4ed8;">help@clearslatedebit.com</a></p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px 0;">
  <p style="font-size:12px;color:#9ca3af;">This is a communication from a debt collector. This is an attempt to collect a debt and any information obtained will be used for that purpose. <a href="${verifyUrl(account.offerToken)}" style="color:#6b7280;">Your validation rights</a>.</p>
  `);

  return { to: account.email, subject, text, html };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT 2 — OPTIONS
// First mention that the balance is movable. Autonomy-framed: a menu they
// control, not a single take-it-or-leave-it price. Percentage before dollars.
// ─────────────────────────────────────────────────────────────────────────────

export function renderOptionsEmail(account: ClearanceAccount): RenderedEmail {
  const balance = formatCurrency(account.balanceCents);
  const pct = cancelledPercent(account.matchRatio);

  const subject = `${account.firstName}, your ${account.originalCreditor} balance is not fixed`;

  const text = `Hi ${account.firstName},

Following up on the ${account.originalCreditor} account we bought (${balance}).

Here's the thing most people don't know: a collection agency can only ask you to pay what you owe. They're working for someone else, so the number is fixed. They can change how often they call. They can't change the balance.

We own your account outright. That means we can change the balance itself.

So the question isn't "will you pay ${balance}." It's which of these you want:

  1. Clear the account outright. We cancel ${pct}% of the balance, you pay the rest, the account closes at zero.
  2. Clear it over three months. Same ${pct}% cancelled, split into three payments.
  3. Tell us what you can actually do. If neither number works, reply to this email. We'd rather find something that works than have you ignore us.
  4. Nothing. It's a real option and there's no punishment for it. We're not going to sue you.

You can see your actual numbers here — no obligation, and looking at them doesn't commit you to anything:

  ${offerUrl(account.offerToken)}

Your call entirely.

— The ClearSlate Team

---
This is an attempt to collect a debt. Any information obtained will be used for that purpose.`;

  const html = shell(`
  <p>Hi ${account.firstName},</p>

  <p>Following up on the ${account.originalCreditor} account we bought (${balance}).</p>

  <p>Here's the thing most people don't know: <strong>a collection agency can only ask you to pay what you owe.</strong> They're working for someone else, so the number is fixed. They can change how often they call. They can't change the balance.</p>

  <p><strong>We own your account outright. That means we can change the balance itself.</strong></p>

  <p>So the question isn't "will you pay ${balance}." It's which of these you want:</p>

  <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:20px 0;">
    <div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><strong>1. Clear the account outright.</strong><br><span style="color:#4b5563;font-size:14px;">We cancel <strong>${pct}%</strong> of the balance, you pay the rest, the account closes at zero.</span></div>
    <div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><strong>2. Clear it over three months.</strong><br><span style="color:#4b5563;font-size:14px;">Same <strong>${pct}%</strong> cancelled, split into three payments.</span></div>
    <div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><strong>3. Tell us what you can actually do.</strong><br><span style="color:#4b5563;font-size:14px;">If neither number works, reply to this email. We'd rather find something that works than have you ignore us.</span></div>
    <div style="padding:14px 18px;"><strong>4. Nothing.</strong><br><span style="color:#4b5563;font-size:14px;">It's a real option and there's no punishment for it. We're not going to sue you.</span></div>
  </div>

  <div style="text-align:center;margin:28px 0;">
    <a href="${offerUrl(account.offerToken)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;">See your numbers</a>
    <div style="font-size:13px;color:#6b7280;margin-top:10px;">No obligation. Looking doesn't commit you to anything.</div>
  </div>

  <p>Your call entirely.</p>

  <p>— The ClearSlate Team</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px 0;">
  <p style="font-size:12px;color:#9ca3af;">This is an attempt to collect a debt. Any information obtained will be used for that purpose.</p>
  `);

  return { to: account.email, subject, text, html };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT 3 — THE CLOSE
// Earned, not gifted. Never "forgiveness". The person BUYS the closure.
// ─────────────────────────────────────────────────────────────────────────────

export function renderCloseEmail(account: ClearanceAccount): RenderedEmail {
  const clearing = formatCurrency(account.clearingAmountCents);
  const balance = formatCurrency(account.balanceCents);
  const pct = cancelledPercent(account.matchRatio);
  const expires = formatDate(account.offerExpiresDate);

  const subject = `${account.firstName} — one payment closes the ${account.originalCreditor} account`;

  const text = `Hi ${account.firstName},

Short version: ${clearing} closes your ${account.originalCreditor} account. Not reduces it. Closes it.

  You pay:        ${clearing}
  We cancel:      ${pct}% of the balance
  Balance after:  $0.00

This is not a settlement where a stump of the balance follows you around. It's not us forgiving you, and it's not charity. You're buying the closure, and when it's done, you're the one who closed it.

That distinction matters more than it sounds. An account you closed yourself is a different thing than one that got written off for you.

  ${offerUrl(account.offerToken)}

Two practical notes:

  - Available through ${expires}. If you need longer, reply and ask. We'll almost certainly say yes.
  - If ${clearing} isn't doable, reply with what is. We have more room than you'd think.

— The ClearSlate Team

---
This is an attempt to collect a debt. Any information obtained will be used for that purpose.`;

  const html = shell(`
  <p>Hi ${account.firstName},</p>

  <p>Short version: <strong>${clearing} closes your ${account.originalCreditor} account.</strong> Not reduces it. Closes it.</p>

  <div style="background:#f0f9ff;border-left:4px solid #1d4ed8;padding:20px;margin:22px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr><td style="padding:4px 0;color:#4b5563;">You pay</td><td style="padding:4px 0;text-align:right;font-weight:700;">${clearing}</td></tr>
      <tr><td style="padding:4px 0;color:#4b5563;">We cancel</td><td style="padding:4px 0;text-align:right;font-weight:700;">${pct}% of the balance</td></tr>
      <tr><td style="padding:8px 0 0 0;color:#4b5563;border-top:1px solid #bfdbfe;">Balance after</td><td style="padding:8px 0 0 0;text-align:right;font-weight:700;color:#059669;font-size:18px;border-top:1px solid #bfdbfe;">$0.00</td></tr>
    </table>
  </div>

  <p>This is not a settlement where a stump of the balance follows you around. It's not us forgiving you, and it's not charity. <strong>You're buying the closure, and when it's done, you're the one who closed it.</strong></p>

  <p style="color:#4b5563;">That distinction matters more than it sounds. An account you closed yourself is a different thing than one that got written off for you.</p>

  <div style="text-align:center;margin:28px 0;">
    <a href="${offerUrl(account.offerToken)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;">Close the account</a>
  </div>

  <p style="font-size:14px;color:#4b5563;">
    Available through <strong>${expires}</strong>. If you need longer, reply and ask — we'll almost certainly say yes.<br><br>
    If ${clearing} isn't doable, reply with what is. We have more room than you'd think.
  </p>

  <p>— The ClearSlate Team</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px 0;">
  <p style="font-size:12px;color:#9ca3af;">This is an attempt to collect a debt. Any information obtained will be used for that purpose.</p>
  `);

  return { to: account.email, subject, text, html };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT 4 — IMPLEMENTATION INTENTION
// Only to people who engaged but did not pay. Asks WHEN and HOW.
// Meta-analytic d ≈ 0.65; 2–3x follow-through. Cheapest unclaimed lift we have.
// ─────────────────────────────────────────────────────────────────────────────

export function renderPlanPromptEmail(account: ClearanceAccount): RenderedEmail {
  const clearing = formatCurrency(account.clearingAmountCents);

  const subject = `${account.firstName}, when works for you?`;

  const text = `Hi ${account.firstName},

You looked at the ${account.originalCreditor} offer but didn't finish, which usually means the money is fine but the moment wasn't.

So one question instead of another pitch: when do you want to do this?

  - After my next paycheck
  - First of the month
  - This weekend
  - Pick a date myself

  ${offerUrl(account.offerToken)}?plan=1

Picking a specific day makes people roughly twice as likely to actually follow through. That's not a sales line, it's one of the most replicated findings in behavioral science, and it's the only reason I'm sending this email instead of just repeating the number.

${clearing} closes it, whenever you're ready.

— The ClearSlate Team

---
This is an attempt to collect a debt. Any information obtained will be used for that purpose.`;

  const html = shell(`
  <p>Hi ${account.firstName},</p>

  <p>You looked at the ${account.originalCreditor} offer but didn't finish, which usually means the money is fine but the moment wasn't.</p>

  <p><strong>So one question instead of another pitch: when do you want to do this?</strong></p>

  <div style="margin:22px 0;">
    <a href="${offerUrl(account.offerToken)}?when=paycheck" style="display:block;padding:13px 18px;margin-bottom:8px;border:1px solid #e2e8f0;border-radius:6px;text-decoration:none;color:#1f2937;">After my next paycheck</a>
    <a href="${offerUrl(account.offerToken)}?when=first" style="display:block;padding:13px 18px;margin-bottom:8px;border:1px solid #e2e8f0;border-radius:6px;text-decoration:none;color:#1f2937;">First of the month</a>
    <a href="${offerUrl(account.offerToken)}?when=weekend" style="display:block;padding:13px 18px;margin-bottom:8px;border:1px solid #e2e8f0;border-radius:6px;text-decoration:none;color:#1f2937;">This weekend</a>
    <a href="${offerUrl(account.offerToken)}?when=custom" style="display:block;padding:13px 18px;border:1px solid #e2e8f0;border-radius:6px;text-decoration:none;color:#1f2937;">Pick a date myself</a>
  </div>

  <p style="color:#4b5563;font-size:14px;">Picking a specific day makes people roughly twice as likely to actually follow through. That's not a sales line — it's one of the most replicated findings in behavioral science, and it's the only reason I'm sending this email instead of just repeating the number.</p>

  <p><strong>${clearing}</strong> closes it, whenever you're ready.</p>

  <p>— The ClearSlate Team</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px 0;">
  <p style="font-size:12px;color:#9ca3af;">This is an attempt to collect a debt. Any information obtained will be used for that purpose.</p>
  `);

  return { to: account.email, subject, text, html };
}

/** The v2 sequence, in order, with the day each is sent. */
export const SEQUENCE_V2 = [
  { day: 0, name: "recognition", render: renderRecognitionEmail, hasOffer: false },
  { day: 4, name: "options", render: renderOptionsEmail, hasOffer: true },
  { day: 11, name: "close", render: renderCloseEmail, hasOffer: true },
  { day: 18, name: "plan_prompt", render: renderPlanPromptEmail, hasOffer: true },
] as const;
