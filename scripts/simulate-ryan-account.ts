#!/usr/bin/env node
// Simulate debt account for Ryan Deelstra.
//
// Creates a realistic fintech/BNPL debt account with Ryan's actual contact info.

import fs from "node:fs";
import path from "node:path";
import { createClearanceAccount } from "../core/clearance/account.ts";
import type { Ymd } from "../core/tape.ts";

function main() {
  console.log("Simulating debt account for Ryan Deelstra...\n");

  // Today's date
  const today = new Date();
  const todayYmd: Ymd = {
    y: today.getFullYear(),
    m: today.getMonth() + 1,
    d: today.getDate(),
  };

  // Offer expires in 21 days
  const expiresDate = new Date(today);
  expiresDate.setDate(expiresDate.getDate() + 21);
  const expiresYmd: Ymd = {
    y: expiresDate.getFullYear(),
    m: expiresDate.getMonth() + 1,
    d: expiresDate.getDate(),
  };

  // Charge-off date: 12 months ago
  const chargeoffDate = new Date(today);
  chargeoffDate.setMonth(chargeoffDate.getMonth() - 12);
  const chargeoffYmd: Ymd = {
    y: chargeoffDate.getFullYear(),
    m: chargeoffDate.getMonth() + 1,
    d: chargeoffDate.getDate(),
  };

  // Last payment: 18 months ago
  const lastPaymentDate = new Date(today);
  lastPaymentDate.setMonth(lastPaymentDate.getMonth() - 18);
  const lastPaymentYmd: Ymd = {
    y: lastPaymentDate.getFullYear(),
    m: lastPaymentDate.getMonth() + 1,
    d: lastPaymentDate.getDate(),
  };

  // Create account
  const account = createClearanceAccount({
    id: "ACCT00000001",
    firstName: "Ryan",
    lastName: "Deelstra",
    email: "deelstraryan@gmail.com",
    phone: "512-623-9209",
    originalCreditor: "Affirm",
    balanceCents: 87500, // $875 (mid-range fintech/BNPL)
    chargeoffDate: chargeoffYmd,
    lastPaymentDate: lastPaymentYmd,
    matchRatio: 2, // Pay $1, cancel $2
    offerExpiresDate: expiresYmd,
  });

  console.log("Account Details:");
  console.log(`  ID: ${account.id}`);
  console.log(`  Name: ${account.firstName} ${account.lastName}`);
  console.log(`  Email: ${account.email}`);
  console.log(`  Phone: ${account.phone}`);
  console.log(`  Original Creditor: ${account.originalCreditor}`);
  console.log(`  Balance: $${(account.balanceCents / 100).toFixed(2)}`);
  console.log(`  Charge-off Date: ${chargeoffYmd.y}-${String(chargeoffYmd.m).padStart(2, "0")}-${String(chargeoffYmd.d).padStart(2, "0")}`);
  console.log(`  Last Payment Date: ${lastPaymentYmd.y}-${String(lastPaymentYmd.m).padStart(2, "0")}-${String(lastPaymentYmd.d).padStart(2, "0")}`);
  console.log();

  console.log("Offer Details:");
  console.log(`  Match Ratio: ${account.matchRatio}:1 (pay $1, cancel $${account.matchRatio})`);
  console.log(`  Clearing Amount: $${(account.clearingAmountCents / 100).toFixed(2)}`);
  console.log(`  Monthly Plan: $${(account.clearingAmountCents / 3 / 100).toFixed(2)} × 3 months`);
  console.log(`  Offer Expires: ${expiresYmd.y}-${String(expiresYmd.m).padStart(2, "0")}-${String(expiresYmd.d).padStart(2, "0")}`);
  console.log(`  Offer Token: ${account.offerToken}`);
  console.log(`  Offer URL: https://clearslatedebit.com/offer/${account.offerToken}`);
  console.log();

  console.log("Economics:");
  const purchasePrice = Math.round(account.balanceCents * 0.054); // 5.4¢ per dollar
  const upfrontCost = 175; // $1.75
  const totalCost = purchasePrice + upfrontCost;
  const revenue = account.clearingAmountCents;
  const profit = revenue - totalCost;
  const roi = (profit / totalCost) * 100;

  console.log(`  Purchase Price: $${(purchasePrice / 100).toFixed(2)} (5.4¢ per dollar)`);
  console.log(`  Upfront Cost: $${(upfrontCost / 100).toFixed(2)}`);
  console.log(`  Total Cost: $${(totalCost / 100).toFixed(2)}`);
  console.log(`  Revenue (if paid): $${(revenue / 100).toFixed(2)}`);
  console.log(`  Profit (if paid): $${(profit / 100).toFixed(2)}`);
  console.log(`  ROI (if paid): ${roi.toFixed(1)}%`);
  console.log();

  // Save to data/ directory
  const dataDir = path.join(import.meta.dirname || ".", "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const accountPath = path.join(dataDir, "ryan-account.json");
  fs.writeFileSync(accountPath, JSON.stringify(account, null, 2), "utf8");

  console.log(`Saved to: ${accountPath}`);
  console.log();
  console.log("✓ Ready to send offer email");
}

main();
