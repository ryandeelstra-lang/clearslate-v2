// Contact data generator.
//
// Generates email and phone fields with realistic fill rates.
// Email includes Reg F prior-use flag (critical for fintech/BNPL).

import type { ContactParams, RNG } from "../types.ts";

/** Contact data for one account */
export interface ContactData {
  email?: string;
  email_prior_use?: boolean; // Reg F-usable
  phone?: string;
}

/** Generate contact data for N accounts */
export function generateContactData(
  n: number,
  params: ContactParams,
  rng: RNG,
): ContactData[] {
  const contacts: ContactData[] = [];

  for (let i = 0; i < n; i++) {
    const contact: ContactData = {};

    // Email
    if (rng() < params.email_fill_rate) {
      contact.email = generateEmail(i, rng);

      // Prior use (Reg F safe harbor)
      if (rng() < params.email_prior_use_rate) {
        contact.email_prior_use = true;
      }
    }

    // Phone
    if (rng() < params.phone_fill_rate) {
      contact.phone = generatePhone(rng);
    }

    contacts.push(contact);
  }

  return contacts;
}

/** Generate a realistic-looking email */
function generateEmail(accountIndex: number, rng: RNG): string {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
  const domain = domains[Math.floor(rng() * domains.length)];

  // Use account index as base to ensure uniqueness
  const username = `user${String(accountIndex).padStart(6, "0")}`;

  return `${username}@${domain}`;
}

/** Generate a US phone number (fake but realistic format) */
function generatePhone(rng: RNG): string {
  const areaCode = 200 + Math.floor(rng() * 800); // 200-999
  const exchange = 200 + Math.floor(rng() * 800);
  const line = Math.floor(rng() * 10000);

  return `${areaCode}-${String(exchange).padStart(3, "0")}-${String(line).padStart(4, "0")}`;
}
