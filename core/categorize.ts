// Maps Plaid's Personal Finance Category (PFC) "primary" value to our internal
// spending buckets. Keep this list small and meaningful for onboarding insights.
// Plaid PFC reference: https://plaid.com/docs/api/products/transactions/#categories
export type Bucket =
  | "rent"
  | "fast_food"
  | "coffee"
  | "groceries"
  | "gas"
  | "entertainment"
  | "subscriptions"
  | "shopping"
  | "personal_care"
  | "transport"
  | "gambling"
  | "alcohol"
  | "tobacco"
  | "cannabis"
  | "transfer"
  | "loan_payment"
  | "income"
  | "other";

// Buckets that are NOT discretionary spending and must be excluded from
// budget/overspend math (transfers between accounts, debt paydown, paychecks).
export const NON_SPEND_BUCKETS: ReadonlySet<Bucket> = new Set<Bucket>([
  "transfer",
  "loan_payment",
  "income",
]);

const PFC_PRIMARY_TO_BUCKET: Record<string, Bucket> = {
  RENT_AND_UTILITIES: "rent",
  FOOD_AND_DRINK: "fast_food", // refined below by detailed category
  GENERAL_MERCHANDISE: "shopping",
  ENTERTAINMENT: "entertainment",
  TRANSPORTATION: "transport",
  TRAVEL: "transport",
  PERSONAL_CARE: "personal_care",
  GENERAL_SERVICES: "subscriptions",
  TRANSFER_IN: "transfer",
  TRANSFER_OUT: "transfer",
  LOAN_PAYMENTS: "loan_payment",
  INCOME: "income",
  BANK_FEES: "other",
};

// Some buckets need the detailed category to be accurate (groceries vs fast food,
// gas vs other transport).
const DETAILED_OVERRIDES: Record<string, Bucket> = {
  FOOD_AND_DRINK_GROCERIES: "groceries",
  FOOD_AND_DRINK_FAST_FOOD: "fast_food",
  FOOD_AND_DRINK_RESTAURANT: "fast_food",
  FOOD_AND_DRINK_COFFEE: "coffee",
  FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR: "alcohol",
  TRANSPORTATION_GAS: "gas",
  ENTERTAINMENT_CASINOS_AND_GAMBLING: "gambling",
  // NOTE: Plaid has no cannabis or tobacco/vape category — that spend can't be
  // reliably detected from PFC. The "cannabis" bucket is rule-intent only;
  // "tobacco" is detected at the card via MCC instead (see cards/mcc.ts).
};

export function toBucket(
  pfcPrimary: string | null | undefined,
  pfcDetailed?: string | null,
): Bucket {
  if (pfcDetailed && DETAILED_OVERRIDES[pfcDetailed]) {
    return DETAILED_OVERRIDES[pfcDetailed];
  }
  if (pfcPrimary && PFC_PRIMARY_TO_BUCKET[pfcPrimary]) {
    return PFC_PRIMARY_TO_BUCKET[pfcPrimary];
  }
  return "other";
}
