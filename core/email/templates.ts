// Email templates for clearance workflow.
//
// All templates are mission-aligned: empowerment framing, no threats.

import type { ClearanceAccount } from "../clearance/types.ts";
import { formatCurrency, formatDate, daysUntilExpiration } from "../clearance/account.ts";

/** Generate offer URL */
function offerUrl(token: string): string {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return `${baseUrl}/offer/${token}`;
}

/** Email #1: Initial offer */
export function generateOfferEmail(account: ClearanceAccount): {
  to: string;
  subject: string;
  text: string;
  html: string;
} {
  const clearingAmount = formatCurrency(account.clearingAmountCents);
  const balance = formatCurrency(account.balanceCents);
  const expiresDate = formatDate(account.offerExpiresDate);
  const monthlyAmount = formatCurrency(Math.round(account.clearingAmountCents / 3));
  const url = offerUrl(account.offerToken);

  const subject = `Take control: Clear your ${account.originalCreditor} account for ${clearingAmount}`;

  const text = `Hi ${account.firstName},

It's time to take control of your money.

We're ClearSlate — a company that buys debt and helps people get out of it. We now own your ${account.originalCreditor} account (balance: ${balance}).

Here's your offer:

  Pay ${clearingAmount} → We cancel the full ${balance}
  Your account balance becomes $0.00

This isn't a settlement where you still owe something. When you pay ${clearingAmount}, the entire account is cleared. Closed. Done.

You can pay in full today, or split it into 3 monthly payments of ${monthlyAmount}.

View your offer: ${url}

Why are we doing this? Because clearing whole accounts is what gets people out of debt — not just reducing balances. Each account you close restores your financial capacity and reduces anxiety.

This offer expires in 21 days (${expiresDate}).

Questions? Reply to this email.

— The ClearSlate Team

---
This is an attempt to collect a debt. Any information obtained will be used for that purpose. You have the right to dispute this debt. See your full rights at ${offerUrl(account.offerToken)}.
`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ClearSlate Offer</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 24px; margin: 0;">ClearSlate</h1>
    <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Get out of debt, for good</p>
  </div>

  <p>Hi ${account.firstName},</p>

  <p><strong>It's time to take control of your money.</strong></p>

  <p>We're ClearSlate — a company that buys debt and helps people get out of it. We now own your <strong>${account.originalCreditor}</strong> account (balance: <strong>${balance}</strong>).</p>

  <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0;">
    <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e40af;">Here's your offer:</h2>
    <p style="font-size: 16px; margin: 10px 0;"><strong>Pay ${clearingAmount}</strong> → We cancel the full <strong>${balance}</strong></p>
    <p style="font-size: 16px; margin: 10px 0; color: #059669;"><strong>Your account balance becomes $0.00</strong></p>
  </div>

  <p>This isn't a settlement where you still owe something. When you pay <strong>${clearingAmount}</strong>, the entire account is cleared. Closed. Done.</p>

  <p>You can pay in full today, or split it into 3 monthly payments of <strong>${monthlyAmount}</strong>.</p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${url}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Your Offer</a>
  </div>

  <p style="color: #666; font-size: 14px;"><strong>Why are we doing this?</strong> Because clearing whole accounts is what gets people out of debt — not just reducing balances. Each account you close restores your financial capacity and reduces anxiety.</p>

  <p style="color: #dc2626; font-weight: 600;">This offer expires in 21 days (${expiresDate}).</p>

  <p>Questions? Reply to this email.</p>

  <p>— The ClearSlate Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

  <p style="font-size: 12px; color: #999;">This is an attempt to collect a debt. Any information obtained will be used for that purpose. You have the right to dispute this debt. <a href="${url}" style="color: #2563eb;">See your full rights</a>.</p>

</body>
</html>`;

  return {
    to: account.email,
    subject,
    text,
    html,
  };
}

/** Email #2: Reminder */
export function generateReminderEmail(account: ClearanceAccount): {
  to: string;
  subject: string;
  text: string;
  html: string;
} {
  const clearingAmount = formatCurrency(account.clearingAmountCents);
  const balance = formatCurrency(account.balanceCents);
  const daysLeft = daysUntilExpiration(account.offerExpiresDate);
  const expiresDate = formatDate(account.offerExpiresDate);
  const url = offerUrl(account.offerToken);

  const subject = `Your ${clearingAmount} offer expires in ${daysLeft} days`;

  const text = `Hi ${account.firstName},

Just checking in — your offer to clear your ${account.originalCreditor} account is still available.

  Pay ${clearingAmount} → Account balance becomes $0.00
  ${daysLeft} days left (expires ${expiresDate})

View your offer: ${url}

If you have questions or need help, just reply to this email.

— The ClearSlate Team
`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hi ${account.firstName},</p>

  <p>Just checking in — your offer to clear your <strong>${account.originalCreditor}</strong> account is still available.</p>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Pay ${clearingAmount}</strong> → Account balance becomes <strong>$0.00</strong></p>
    <p style="margin: 5px 0; color: #dc2626;"><strong>${daysLeft} days left</strong> (expires ${expiresDate})</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600;">View Your Offer</a>
  </div>

  <p>If you have questions or need help, just reply to this email.</p>

  <p>— The ClearSlate Team</p>

</body>
</html>`;

  return {
    to: account.email,
    subject,
    text,
    html,
  };
}

/** Email #3: Final notice */
export function generateFinalNoticeEmail(account: ClearanceAccount): {
  to: string;
  subject: string;
  text: string;
  html: string;
} {
  const clearingAmount = formatCurrency(account.clearingAmountCents);
  const daysLeft = daysUntilExpiration(account.offerExpiresDate);
  const expiresDate = formatDate(account.offerExpiresDate);
  const url = offerUrl(account.offerToken);

  const subject = `Final reminder: Offer expires in ${daysLeft} days`;

  const text = `Hi ${account.firstName},

This is your final reminder — your offer to clear your ${account.originalCreditor} account for ${clearingAmount} expires in ${daysLeft} days.

After ${expiresDate}, this offer will no longer be available.

View your offer: ${url}

If you're unable to pay right now, reply and let us know. We want to help.

— The ClearSlate Team
`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hi ${account.firstName},</p>

  <p><strong>This is your final reminder</strong> — your offer to clear your <strong>${account.originalCreditor}</strong> account for <strong>${clearingAmount}</strong> expires in <strong style="color: #dc2626;">${daysLeft} days</strong>.</p>

  <p>After <strong>${expiresDate}</strong>, this offer will no longer be available.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600;">View Your Offer</a>
  </div>

  <p>If you're unable to pay right now, reply and let us know. We want to help.</p>

  <p>— The ClearSlate Team</p>

</body>
</html>`;

  return {
    to: account.email,
    subject,
    text,
    html,
  };
}

/** Confirmation email (after payment) */
export function generateConfirmationEmail(account: ClearanceAccount): {
  to: string;
  subject: string;
  text: string;
  html: string;
} {
  const balance = formatCurrency(account.balanceCents);
  const paid = formatCurrency(account.paidCents);

  const subject = `Your ${account.originalCreditor} account is cleared ✓`;

  const text = `Hi ${account.firstName},

Congratulations — your account is officially cleared.

  Original balance: ${balance}
  You paid: ${paid}
  New balance: $0.00

We've reported this to the credit bureaus as "paid, $0 balance."

You should see this update on your credit report within 30 days.

You're done. No more contact from us about this account.

— The ClearSlate Team
`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="width: 60px; height: 60px; background: #059669; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 30px;">✓</div>
  </div>

  <p>Hi ${account.firstName},</p>

  <p><strong>Congratulations — your account is officially cleared.</strong></p>

  <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 30px 0;">
    <p style="margin: 5px 0;">Original balance: <strong>${balance}</strong></p>
    <p style="margin: 5px 0;">You paid: <strong>${paid}</strong></p>
    <p style="margin: 5px 0; color: #059669; font-size: 18px;"><strong>New balance: $0.00</strong></p>
  </div>

  <p>We've reported this to the credit bureaus as <strong>"paid, $0 balance."</strong></p>

  <p>You should see this update on your credit report within 30 days.</p>

  <p style="color: #059669; font-weight: 600;">You're done. No more contact from us about this account.</p>

  <p>— The ClearSlate Team</p>

</body>
</html>`;

  return {
    to: account.email,
    subject,
    text,
    html,
  };
}
