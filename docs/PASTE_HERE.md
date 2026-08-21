# Paste Project Details Here

> Paste your project text below the marker. Once you do, I'll split it into
> relevant md files (architecture, features, data model, stack, etc.) and
> update CLAUDE.md with the durable decisions.

---
<!-- PASTE BELOW THIS LINE -->


Main:
A debit card where you set your own spending rules during onboarding — and the card enforces them. Block gambling, cap fast food, auto-route cashback to debt principal. We enforce. The mission, get people out of debt.

Okay so basically I want to give them some way to connect all their accounts with a few simple button clicks

That should take max one minute, while on the backend I am waiting for that I want to ask them questions such as their spending goals, what they think their budget for a month should be etc.

I have the data so I should generate a few statistic that emphasizes how they are paying money they don’t need to pay, for example with someone $3000 in debt: With a 26.99% APR, you may incur roughly $67 per month in interest charges alone, and take 4-5 years to pay off and end up paying $700 dollars more than necessary, thats over 18 tanks of gas. But display that in a nice little UI on pretty little plots

Okay now we show them show them something like this and find the step they are on, say if you follow all the steps you can reach complete financial freedom, and then we go to the step they are on. BUSINESS IDEA #1 Every time they level up a step we give them a prize, gamify the whole experience, make it actually feel likey they are being recognized for it, this is sustainable if the prize is small enough, maybe we can partner with a company for gift cards or something

They understand the premise of the steps, now we ask for their budget for the month, say they enter $1800, now we go to last month and show a big bar like the IOS memory bar that has different colors with red being rent (64%), blue being fast food, etc. So now we ask them some questions about their spending and what they would like us to enforce for the upcoming month.


Example Rule: "Cap fast food at $100/month. Decline transactions after."
Example Rule: "Block all gambling merchant category codes completely."
Example Rule: "Round up all purchases and auto-route the spare change to the highest-interest debt."



The 5 step plan
Stop the bleeding, create an extra income of $200 a month
Save $500 for emergency fund
Debt Snowball method
Save 3-6 months of expenses
Invest



Persona + Core ideas:
The fucking core:


Okay so I want my users to be able to get out of the fucking shitty ass debt they put themselves in and then are kept in.


People with low impulse control typically (in my mind) - I need to do interviews for this
They spend money online
Basically where the money spending is frictionless and they get that ohhhhh I want this shiny fucking object they buy it. This is the type of person you imagine in the movie trying to snag a rich husband bc they have 19 credit cards worth of debt. 

We target this person by limiting spending through friction in the same way the anti-phone anti-porn shit provides friction

Anti-phone approach creates friction, such as making them approve or type in a code, shit like this with screen time limits is a simple mild inconvience like the fucking insta lock shit we all know thats just to make people feel in control I want to put people actually in control

However this does prestent a friction option, making them preapprove a purchase for certain things, like making you go into it and press fast-food 10 minutes in advance so when you see the mcD’s you dont go bc u dont want to wait 10 mins, we could also make people go into the app. Counterpoint yes this provides friction but people would probably get frustrated with this I reccomend the ltter option
Im going to puruse the more hardcore option-the actual no porn no alchaol no drugs shit like complete fucking cold turkey. Automatically deny purchases. Like yes your card will decline thats embarrising af, the key is making it so this doesn’t actually happen bc no one uses a product like this if they get embarrassed when their friends are buying fast food and they can’t.

What my ideas for this option are is basically they get a bunch of categories when theyre doing their setup potentially or customizations this may be a later option. I will make it such that they can click on everything like Fast Food, Entertainment, Gambiling, etc. And then they have the choice to completely ban it (No getting money from this card for gambiling) or set a limit (40 bucks a month on red-40 slop)
The card will notify them when they approach said limit and will not let them go over. Also circles with friends to keep them accountable and modes works for this too + challenges

Restricted purchase
Challenges
Accountability circles

The second type of person didn’t do much wrong they just have some debt from student loands or etc and struggle to see the progress in paying them


#1 Thing is make them feel like they are in control and making progress towards their debt. Lets look into some physcology for this.

Some ideas I like:
Round purchases up to the dollar above and put that money against the debt
An X a day towards debt, for example they have a little scroll bar with a bunch of things starting at (maybe these should be useless objects, but something to vizualize this would be good) starting at object X eg a pen and moving up to object X + 10 eg. a latte.
Modes, such as Monk mode, debt attack mode, etc. look into other ideas tab 2 for this
Name their debt — make them literally name it ("my Vegas mistake," "my Amazon phase"). Personifying it makes abandoning the fight feel like losing to a named enemy
Plaid-powered debt tracker — connect all their accounts. If you can see their other credit card balances growing while ClearSlate is paying down debt, you can show them the contradiction. "Your ClearSlate balance dropped $200 this month. Your Discover balance grew $340." That's a mirror they can't ignore
Lock their other cards in a "vault" — not literally, but have them photograph their other cards and "lock" them in the app. To use one they have to go into the app, find it, and "unlock" it. Pure friction. No different than putting your credit cards in a block of ice in the freezer (actual advice Dave Ramsey gives)



The 5 step plan
Stop the bleeding, create an extra income of $200 a month
Save $500 for emergency fund
Debt Snowball method
Save 3-6 months of expenses
Invest

Big part make sure there is an accountibility partner


Timeline:
Phase 0 — Infrastructure & legal (Weeks 1–6)
Register LLC — File your LLC online (Delaware recommended for startups). Same-day or next-day approval. You need this before any fintech partner will talk to you. — LLC Aquired in Texas, name is: ClearSlate LLC filed at the address 13201 Coleto Creek Trail under Ryan Deelstra
Get EIN from IRS — File Form SS-4 online at irs.gov — free, instant. Required for business bank accounts, BaaS applications, and tax filings. — This step is complete, EIN is: 42-2819082
Open business bank account — Mercury or Relay are startup-friendly, no minimums, free ACH. Do this immediately after EIN — you need it for BaaS applications.
Apply to Unit (BaaS) — Submit LLC docs, EIN, and a product description at unit.co. Takes 2–4 weeks. This gates everything — apply on week 1, not week 3. — $0 to apply; ~$0.25–0.50 per active account/month once live - Sandbox complete
Apply to Marqeta (card issuing) — Submit simultaneously with Unit at marqeta.com. They'll want your BaaS partner info — list Unit as intended partner. Approval takes 1–3 weeks. — $0 to apply; ~$0.006–0.01 per authorization once live + interchange share
Apply to Plaid — Sign up at plaid.com/docs. Faster than BaaS — usually 1–3 days. Get sandbox keys immediately and start building against them. — $0 in sandbox; ~$0.30–0.50 per connected account/month once live - Done
Draft Privacy Policy & Terms of Service — Must explicitly cover Plaid data use, how transaction data is stored, and user rights to delete data. Use a lawyer or a tool like Termly as a base, then customize. — $0 with Termly templates; $500–2,000 if using a lawyer - Done
Set up Reg E dispute flow — Federal law requires you handle disputed card transactions within specific timeframes. Unit provides a template — read it, customize your internal process, document it. — $0 - Done
Run sandbox KYC test — Use Unit's sandbox to simulate a user onboarding through KYC. Confirm you can create a customer, hit identity verification, and get a compliant account created. — $0 - Done
Run sandbox card + ACH test — Issue a virtual card in Marqeta sandbox, simulate a transaction, then run a test ACH transfer through Unit. Confirm the full money flow works end-to-end before building UI on top. — $0

Phase 1 — Onboarding & data (Weeks 4–10)
Set up backend stack — Node.js or Python (FastAPI) + Postgres for persistent data + Redis for caching user rules. Deploy on Railway or Render to keep ops overhead near zero early on. — $0 on free tiers; ~$5–20/mo once live
Integrate Plaid Link SDK — Drop Plaid's Link component into your frontend. It handles the bank-select UI, OAuth flows, and returns a public_token you exchange for an access_token server-side. — $0 in sandbox
Build account connection screen — One screen: bank logo grid + "Connect your bank" CTA. Tap launches Plaid Link. Should take the user under 60 seconds. Show a loading state while Plaid fetches data
Build parallel questionnaire UI — While Plaid is fetching in the background, show 3–4 questions: total debt, monthly budget estimate, top financial goal (pay off debt / build savings / stop overspending). Store answers immediately.
Fetch 12 months of transactions via Plaid — Use the /transactions/get endpoint. Request 12 months lookback. Store raw transaction data in Postgres — you'll need it for categorization and insight generation. — $0 in sandbox; counted within per-account fee once live
Build transaction categorization layer — Map each Plaid transaction's category and merchant name to your internal buckets (rent, fast food, gas, subscriptions, etc.). Plaid provides categories — augment with your own MCC mappings.
Build APR cost calculator — Take user-entered debt amount + APR → compute monthly interest charge, total payoff timeline, and total excess paid. Formula: monthly_interest = balance × (APR/12). Store result for display.
Build real-world framing engine — Convert dollar amounts into relatable units. Output: "X tanks of gas", "Y months of Netflix", "Z Chipotle burritos". Hardcode 5–6 unit types with current prices.
Build insight card UI — Three cards shown after onboarding: (1) monthly interest cost, (2) biggest overspend category vs their stated budget, (3) real-world framing of the excess. Make them visually striking — this is the emotional hook.
Build payoff timeline chart — Line chart: two curves — "current trajectory" vs "with our rules active". Show months to payoff and total interest paid under each scenario. Use Chart.js or Recharts.
QA full onboarding end-to-end — Connect a real bank account in sandbox, run through every screen, confirm questionnaire data saves, Plaid data lands in Postgres, and all insight cards render correctly with real numbers.

Phase 2 — Rules engine & card (Weeks 8–16)
Design rules data model — Postgres table: user_id, rule_type (cap/block/roundup), mcc_codes (array), limit_amount, spent_amount, reset_date, is_active. Index on user_id + is_active for fast webhook lookups.
Build rules builder UI — spend cap — Screen: pick a category → set dollar limit → toggle on. On save, write rule to DB and invalidate Redis cache for this user.
Build rules builder UI — hard block — Screen: select MCC categories to permanently block (gambling, adult content, etc.) → toggle on. Store as rule_type='block'.
Build rules builder UI — save X — Screen: select an object X you want to save every day, commi tat type every day iff they have passed stage 1'.
Build rules builder UI — round-up — Screen: toggle on/off → select destination account from user's connected accounts via Plaid. Store destination account ID. Explain that change accumulates and transfers nightly. — $0
Build budget bar UI — iOS memory bar pattern. Divide user's monthly budget into colored segments by category, proportional to spend. Update in real-time as transactions come in via Plaid webhooks. — $0
Build MCC block list checker — Function: takes an MCC code → checks user's active block rules → returns boolean. Must run in <5ms. Load user's blocked MCCs into Redis on rule creation; read from Redis only in the webhook path. — $0 on Upstash free tier; ~$0.20/100k requests beyond that
Build velocity tracker — Redis counter per (user_id, category, billing_month). On each approved transaction, increment by transaction amount. On cap rule check: compare counter to limit. Reset counters on billing month rollover. — Included in Redis costs above
Build Marqeta JIT funding webhook — POST endpoint that receives Marqeta's authorization request. Must respond in <150ms (or whatever most cards do). Logic: (1) get user rules from Redis, (2) check MCC block list, (3) check velocity vs cap, (4) return approve/decline JSON. — $0 to build; per-authorization fees apply once live (see task 5)
Load-test the JIT webhook — Use k6 or Artillery to simulate 500 concurrent auth requests. Confirm p99 response time stays under 150ms. If it doesn't, the bottleneck is almost certainly a DB call that should be a Redis read. — $0 on k6 free tier
Build round-up accumulator service — On each approved transaction: compute spare change (ceil(amount) - amount), add to user's pending_roundup balance in Postgres. Log every transaction's contribution for audit trail. — $0
Build nightly ACH batch job — Cron job at 2am: for each user with pending_roundup > $1.00, initiate ACH transfer to their destination account via Unit. Mark transferred amount, reset pending balance. Send push notification on transfer. — ~$0.25–1.00 per ACH transfer depending on Unit pricing tier – BIG RED FLAG HERE why would I pay $1.01 and only get $.01 towards debt thats stupid af maybe do it at the end of the month
Build decline push notification — When webhook returns decline: enqueue a push notification explaining which rule fired and why. "Fast food cap reached ($100/mo). Transaction of $12.40 at McDonald's was declined." — $0 via Expo or Firebase
Build real card issuance flow — User completes KYC via Unit → Unit creates a verified customer → Marqeta issues a virtual card tied to that customer → show card details in-app. Physical card issuance comes in a later sprint. — $0 for virtual; ~$3–5 per physical card once you add that
QA full card enforcement flow — Issue a real card in production sandbox. Set a rule. Attempt a transaction that should be declined. Confirm: webhook fires, decline returned, push notification delivered, velocity counter updated correctly. — $0

Phase 3 — Gamification & progress (Weeks 14–20)
Design step data model — Postgres: steps table (step_id, name, description, criteria_type, criteria_value). user_steps table (user_id, step_id, completed_at). Define all 6 steps and their completion criteria now. — $0
Build step evaluation engine — Service that runs on every meaningful event (transaction approved, balance updated, rule saved). Checks: does this event satisfy any incomplete step for this user? If yes, mark step complete and trigger the celebration screen. — $0
Build step ladder UI — Full-screen progress view. All 6 steps as a vertical ladder — completed steps checked green, current step highlighted, future steps grayed out. Show what the user needs to do to reach the next step. — $0
Build level-up screen — Full-screen celebration on step completion. Confetti animation, step name and a short message recognizing what the user accomplished. Should feel like a genuine moment of recognition, not a transaction. — $0
Build step progress push notifications — At 50% and 80% completion of each step's criteria, send a push: "You're $40 away from reaching Step 3. Keep going." Time these for evenings — higher open rates. — $0 via Expo or Firebase
Build loading screen advice surface — On each step screen, surface one piece of relevant advice or success
Recruit beta users and soft launch — Find 50 users via UT Austin personal finance club, Reddit r/personalfinance, Twitter. Instrument everything with Mixpanel or PostHog. Track: step completion rate, 7-day retention, card usage frequency, rules created per user. — $0 on Mixpanel/PostHog free tiers; Plaid costs ~$15–25 for 50 connected accounts
Analyze beta data and iterate — After 2 weeks of beta: which steps do users stall on? Which rules do they set most? Are declines causing churn or engagement? Use this to reprioritize before scaling. — $0

Build, Ship Code, Talk to Users

Onboarding:
ONBOARDING.

Introduction here with fancy graphics, make it so they don’t lose interest in the information step (2) < 1 minute


 We need their information: KEY – Should be super duper easy we wan’t 0 work on the user end < 3 minutes
Current debt
Spending history
Look into how to get these numbers.
Question step, the goal of this is to get the userinvested in the app, they’re already set on reducing debt maybe introduce feautres – this only needs to be until we can get the information IDK how long this takes or if we can do this beforehand that would be nice < 1 minute
Show Graphs < 15 seconds
Show the X step plan, go to the current step we’re at, if they want they can scroll through steps. 15-Inf seconds
Now we circle back to 3,    let them do their settings and discover the app. Entire experience is set up 15-Inf seconds
Boom, they are now completley onboarded


API:
this stuff is all the API keys, should be an env folder


Anti Other Card

So the two ideas I have are:

A vault: we get the info from Plaid, so we see they have a purchase on a card thats not ours

If so what are the accountability options
