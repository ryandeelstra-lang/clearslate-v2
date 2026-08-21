# ClearSlate — UI Walkthrough (Slide Deck Notes)

Screen-by-screen UI summary of the ClearSlate mobile app, in the exact order the
user sees them. Each slide lists the **look/feel**, **colors**, and **exact copy**
on screen, followed by a blank **▸ My notes** block for your own commentary
(talking points, voiceover, what to emphasize on stage, etc.).

> All copy below is quoted verbatim from the build. Numbers like `$X` / `{N}` are
> filled in live from the user's Plaid data.

---

## Global design language (applies to every slide)

- **Mood:** dark, premium, modern, sleek. Near-black navy background with one
  electric-blue accent. High-contrast white text, heavy bold weights.
- **Background:** deep navy-black `#0B1020`.
- **Accent / brand / primary action:** electric blue `#3B82F6`.
- **Cards / surfaces:** `#161D33` (elevated `#111A30`), thin border `#1E2746`.
- **Semantic color:** **green** `#22C55E` = safe / on-track / Allow / round-up ON;
  **red** `#EF4444` = danger / loss / over-budget / Block; **blue** = brand / neutral
  action / Cap.
- **Text:** white `#fff` headers, soft `#E6EAF5`, muted `#9AA4BF`, faint `#5B6488`.
- **Type:** big bold headers (28–64px, weight 800), small uppercase blue "eyebrow"
  labels with wide letter-spacing, rounded corners throughout.
- **Logo mark:** a blue rounded "slate" tile with a white checkmark + a faint wipe
  streak behind it — reads as "wiped clean / cleared."
- **Primary button:** solid blue, full-width, rounded, white bold label. **Ghost
  button:** text-only, muted gray (secondary actions).
- **Onboarding chrome (top of slides 2–5):** back chevron `‹` + a row of progress
  dots (blue = done) + a `Step N / M` counter on the right. 4 steps total.

▸ **My notes:**
```
(brand positioning, design rationale, anything you want to say up front)


```

---

## SLIDE 1 — Intro / Splash

- **Feel:** flashy-but-sleek cinematic open. Logo mark scales/springs in, wordmark
  rises, tagline fades, then the CTA. Dark & premium. Tap anywhere to fast-forward.
- **Layout:** centered logo mark + wordmark, tagline below, single button pinned bottom.
- **Colors:** navy-black bg, blue logo, white wordmark, muted-gray tagline.
- **Copy:**
  - Wordmark: **"ClearSlate"**
  - Tagline: **"The Card That Keeps Its Promises."**
  - Value prop: **"A debit card that enforces your own spending rules to kill your debt."** <- REMOVE THIS, NOT NEEDED
  - Button: **"Get started"**
ADD: A Cooler background, as in something thats a bunch of squares that ripples, should still be minimal but seem cool

▸ **My notes:**
```
one removal one addition look above
```

---

## SLIDE 2 — Connect your banks

*(3 states — show whichever fits the demo)*

- **Feel:** trust-forward, calm. This is the #1 fintech drop-off, so the copy is all
  about safety. Centered vertical layout.
- **Colors:** navy bg, white title, muted subtitle, a bordered "trust" card with
  **green** checkmarks, blue primary button, ghost escape-hatch link.

**State A — initial:**
  - Title: **"Connect your banks"**
  - Subtitle: **"We read your debt and spending to build your plan. Link every account you have — works with 12,000+ banks."**
  - Trust rows (green ✓): **"Read-only access — we can't move your money"** · **"We never see your bank password"** · **"Bank-level encryption · powered by Plaid"**
  - Primary button: **"Connect a bank"**
  - Ghost link: **"Can't connect? Enter your debt manually"**

**State B — after ≥1 bank linked:** big green **✓**, title **"{N} bank(s) connected"**,
subtitle **"Link all your accounts so we see the full picture — every card, loan, and
balance. The more you connect, the more we can catch."**, ghost **"+ Add another bank"**,
primary **"Continue to my plan"**.

**State C — manual entry:** Title **"Enter your debt"**, subtitle **"No problem — we'll
estimate your APR and you can connect a bank later."**, large `$` amount input
(placeholder `3,000`), button **"Continue"**, ghost **"Connect a bank instead"**.

▸ **My notes:**
```
change from the row of a bunch of stuff to just: Bank-level encryption, remove: - Ghost link: **"Can't connect? Enter your debt manually"**
```

---

## SLIDE 3 — Payoff goal (the one question we ask)

- **Feel:** focused, single decision. A big number readout + a drag slider. This is
  the *only* thing the app asks the user to set — everything else is estimated from Plaid.
- **Colors:** navy bg, blue eyebrow + blue date line, huge white number, faint tick labels.
- **Copy:**
  - Eyebrow: **"YOUR GOAL"**
  - Header: **"How fast do you want to be debt-free?"**
  - Sub: **"Drag to set your finish line. We'll show exactly what it takes — and your card helps you hit it."**
  - Big readout: e.g. **"3 years"** (8 months → 18 years range; default 36 months)
  - Date line (blue): **"Debt-free by {Month Year}"**
  - Slider ticks: **"8 months"** … **"18 years"**
  - Button: **"Continue"**

▸ **My notes:**
```
make it 1 month -> 20 years

```

---

## SLIDE 4 — The Facts ("gut punch" → hope)

Shown **one at a time** with swipe-dots; each lands a single number before the next.
Loading state cycles: *"Reading your last 12 months…" → "Categorizing your spending…"
→ "Computing what interest is costing you…" → "Building your payoff path…"*

- **Feel:** emotional funnel. Three loss-framed "facts" in danger framing, then a
  hopeful payoff chart. Huge 64px numbers, lots of negative space.
- **Colors:** navy bg, blue eyebrows, giant white numbers, muted support lines.

**Fact 1 — eyebrow "THE INTEREST":**
  - Big: **"$X /mo"** — **"is what your debt costs you in interest alone."**
  - Subtle: **"Estimated/Your blended {APR}% APR on $X of debt"**

**Fact 2 — eyebrow "WHERE IT GOES":**
  - Big: **"$X"** — **"went to {category} this month — your biggest category."**
  - Subtle: **"$X spent vs $X budget · $X over / on track"**

**Fact 3 — eyebrow "THE WASTE":**
  - Big: **"$X"** — **"in extra interest you don't need to pay — that's {18 tanks of gas}, gone for nothing."**
  - Subtle: **"Here's how we stop it ↓"**

**Fact 4 — the payoff path (eyebrow "YOUR PATH"):**
  - Header: **"Debt-free in {N} months"**
  - Sub: **"About $X/mo toward your balance gets you there. Your card's rules help free up the difference."**
  - **Payoff chart:** red **"Now"** line vs green **"ClearSlate"** line (green always
    wins), with **"You'd save $X in interest."** and axis labels **"$X today"** / **"$0 paid off"**.
  - Button: **"See my plan"**

▸ **My notes:**
```
(this is the emotional core — note which fact to dwell on, the loss→hope pivot)

the math is just wrong I swear like this person is not going to take 13 months to pay off 400 bucks of debt
```

---

## SLIDE 5 — Stop the bleeding (set the rules)

- **Feel:** the activation moment — turns a viewer into an owner. A scrollable list
  of category cards, each with an **Allow / Cap / Block** segmented control.
- **Colors:** navy bg, blue eyebrow; segmented control selected states color-coded:
  **Allow = green**, **Cap = blue**, **Block = red**. Spending breakdown bar up top
  (multi-color iOS-storage-style segments).
- **Copy:**
  - Eyebrow: **"STEP 1 · STOP THE BLEEDING"**
  - Title: **"Stop the bleeding"**
  - Subtitle: **"Allow, cap, or block the categories that drain you. Your card enforces it at checkout — automatically. Change any of this later."**
  - Categories: **Gambling** (Casinos, betting, lottery) · **Alcohol** (Bars, liquor stores)
    · **Fast food** (Restaurants, fast food, coffee) · **Entertainment** (Streaming, events,
    games) · **Shopping** (Retail, online, electronics)
  - Defaults pre-seeded (opt-out): **Gambling = Block**, **Fast food = Cap**.
  - Cap row: **"Monthly limit"** + `$___ /mo` input.
  - Button: **"Activate my rules"**
  - Footer: **"{N} categories limited · round-up on"**

▸ **My notes:**
```

when I try and cap alcahol on the a weird text box pops up and I cant type in it, the other ones work fine

remove the "round-up on" text from the bottom
```

---

## SLIDE 6 — You're all set (Welcome)

- **Feel:** second "flashy" beat / payoff of the commitment. Logo mark inside a blue
  ring springs in, text rises, CTA fades. Mirrors the intro. Relief + closure.
- **Colors:** navy bg, blue ring around blue logo, white title, muted subtitle.
- **Copy:**
  - Title: **"You're all set"**
  - Subtitle: **"{N} rules are live and enforcing on every purchase. This is where the debt stops growing."**
  - Button: **"Enter ClearSlate"**

▸ **My notes:**
```


```

---

## SLIDE 7 — Main app: CARD tab (home)

After onboarding, a 3-tab app (bottom bar: **💳 Card · ⚙️ Rules · 📈 Progress**,
active tab in blue).

- **Feel:** the home base. A premium virtual card up top, then this-month stats.
- **Colors:** navy bg; **card art is a blue→navy gradient** with gold chip, white
  "ClearSlate" brand, masked number `•••• •••• •••• 0427`, "CARDHOLDER / DEBIT".
  Interest stat shown in **red**; round-up pill **green ON / gray OFF**.
- **Copy:**
  - Eyebrow: **"YOUR CARD"** · Header: **"Welcome back"**
  - Stat tiles: **"Spent this month"** $X · **"Interest / mo"** $X (red)
  - Card: **"THIS MONTH'S SPENDING"** → **"$X of $X · $X over / on track"** + budget bar
  - Round-up card: **"Round-up"** + **"Spare change from every purchase is attacking your
    debt."** (on) / **"Turn this on in Rules to round up purchases toward your debt."** (off)
    + **ON/OFF** pill.

▸ **My notes:**
```


```

---

## SLIDE 8 — Main app: RULES tab (manage)

- **Feel:** same editor as onboarding (slide 5), now for ongoing edits — saves in
  place, no flow advance.
- **Copy:**
  - Eyebrow: **"YOUR CARD"** · Title: **"Rules in effect"**
  - Subtitle: **"Allow, cap, or block any category. Changes take effect on your next swipe."**
  - Button: **"Save changes"** → confirms with **"✓ Saved"**.

▸ **My notes:**
```


```

---

## SLIDE 9 — Main app: PROGRESS tab (debt payoff)

- **Feel:** the journey view. A big "debt remaining" hero number, the goal, and the
  same red-vs-green payoff chart.
- **Colors:** navy bg, elevated hero card, huge 44px white number, blue eyebrow, green
  "saved interest" highlight on chart.
- **Copy:**
  - Eyebrow: **"YOUR PROGRESS"** · Header: **"Debt payoff"**
  - Hero card: **"DEBT REMAINING"** → big **"$X"** → **"Blended {APR}% APR"**
  - Goal card: **"YOUR GOAL"** → **"Debt-free by {Month Year}"** → **"About $X/mo toward
    your balance gets you there — a {N}-month plan. Round-ups and caps help free up the
    difference."**
  - Payoff chart (Now vs ClearSlate).
  - Ghost button: **"Restart demo"**.
  - *Debt-free state:* **"$0"** + **"You're debt-free — keep the rules on to stay that way."**

▸ **My notes:**
```


```

---

## Appendix — color & component cheat-sheet (for designing slides)

| Token | Hex | Meaning |
|---|---|---|
| Background | `#0B1020` | deep navy-black base |
| Blue (accent) | `#3B82F6` | brand, primary CTA, Cap, active tab |
| Card surface | `#161D33` | panels, tiles |
| Green | `#22C55E` / `#34D399` | safe, on-track, Allow, round-up on |
| Red | `#EF4444` / `#F87171` | danger, loss, over-budget, Block |
| Text white | `#fff` | headers, numbers |
| Muted gray | `#9AA4BF` | body / subtitles |
| Faint | `#5B6488` | captions, ticks |

- **Recurring motifs:** uppercase blue eyebrow label → big bold header → muted
  subtitle → full-width blue button.
- **Emotional arc across the deck:** *promise (1) → trust (2) → ownership (3) →
  loss-then-hope (4) → commitment (5) → relief (6) → daily control (7–9).*

▸ **Overall deck notes:**
```


```
