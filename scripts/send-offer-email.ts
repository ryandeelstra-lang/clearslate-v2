#!/usr/bin/env node
// Send initial offer email to Ryan.

import fs from "node:fs";
import path from "node:path";
import type { ClearanceAccount } from "../core/clearance/types.ts";
import { sendOfferEmail } from "../core/email/send.ts";
import { recordEmailSent, updateStatus } from "../core/clearance/account.ts";

async function main() {
  console.log("Sending offer email to Ryan...\n");

  // Load account
  const accountPath = path.join(import.meta.dirname || ".", "..", "data", "ryan-account.json");
  if (!fs.existsSync(accountPath)) {
    console.error("Error: Account not found. Run scripts/simulate-ryan-account.ts first.");
    process.exit(1);
  }

  let account: ClearanceAccount = JSON.parse(fs.readFileSync(accountPath, "utf8"));

  // Send email
  const result = await sendOfferEmail(account);

  // Update account
  account = recordEmailSent(account, "offer_initial", result.success, result.error);
  if (result.success) {
    account = updateStatus(account, "offer_sent", "Initial offer email sent");
  }

  // Save updated account
  fs.writeFileSync(accountPath, JSON.stringify(account, null, 2), "utf8");

  if (result.success) {
    console.log("\n✓ Offer email sent successfully");
    console.log(`  Status: ${account.status}`);
    console.log(`  Emails sent: ${account.emailsSent.length}`);
  } else {
    console.error(`\n✗ Failed to send email: ${result.error}`);
    process.exit(1);
  }
}

main();
