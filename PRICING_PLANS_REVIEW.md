# GymSpot Pricing Plans — Review & Opinion

> My assessment of the plans in `GymSpot Pricing Plans.pdf`, updated for the
> **single GymSpot AI** model and the planned **Notifications** feature, plus
> whether the pricing fits the **Egyptian market**. The `/plans` page has been
> updated to reflect this opinion (real EGP pricing + a launch discount).

---

## 1. The plans (as implemented on `/plans`)

| Tier | Gym (launch) | Coach (launch) | GymSpot AI |
|------|--------------|----------------|------------|
| **Warm Up** (Free) | 0 EGP | 0 EGP | ❌ Not included |
| **Power Set** (Pro) | ~~700~~ **500 EGP** / mo | ~~400~~ **300 EGP** / mo | 10 smart searches / day |
| **Beast Mode** (Premium) | ~~1400~~ **1000 EGP** / mo | ~~800~~ **600 EGP** / mo | 50 smart searches / day |

The **launch discount** is my recommendation in action: the regular price is shown
struck-through, the launch price (the PDF price) is what the user pays today. This captures
market share now while signalling the "real" value, so prices can settle up later without
feeling like a hike.

**Gym tiers** scale on: profile images (5 → 15 → 50), job postings (1–2 → 10 → unlimited),
applicant visibility (first 10 → full → full), profile edits (3 → 10 → unlimited), and GymSpot AI.
**Coach tiers** scale on: transformation photos (5 → 15 → 50), certifications (2–3 → 10 → unlimited),
job applications (5–10 → unlimited → unlimited), profile edits (3 → 10 → unlimited), and GymSpot AI.
Chat is included on every tier.

---

## 2. The single GymSpot AI — the right simplification ✅

Collapsing "Public AI + GymSpot AI" into **one GymSpot AI** is a good decision. One assistant is
easier to explain, easier to price, and easier to build. Crucially, it's now framed as the thing
that's actually unique to you: **smart, in-platform search and recommendations over GymSpot data.**

What it does, in plain terms:
- **For gyms:** "Find me the best coaches for a CrossFit role", "Who are the strongest applicants
  on this job post?", "Which post format is performing best so I can model it?"
- **For coaches:** "Which gyms/jobs best match my certifications?", "How do I improve my profile to
  rank higher?"

This is far more defensible than a generic chatbot — a general LLM can't rank *your* coaches or
*your* applicants. Keep the AI **strictly scoped to GymSpot data and actions**; don't let it drift
into being a generic fitness Q&A bot (that invites comparison with free tools and burns tokens for
no differentiation).

### Tiering it by **daily smart-search quota** is correct
- Pro: **10 / day**, Premium: **50 / day** — concrete, enforceable, and protects your margin.
- Track usage server-side and show a "X/10 left today" counter so the limit drives upgrades
  instead of silently frustrating users.
- Because every AI call has a real USD cost while you bill in EGP, these hard caps are what keep
  the feature profitable if the pound weakens. **Enforce them on the server, not just the UI.**

---

## 3. What the model gets right 👍

- **Free tier as the funnel.** "Warm Up" lets gyms and coaches join and feel the product before
  paying — essential for a two-sided marketplace where you need supply present first.
- **Clear value ladder.** Each tier unlocks the obvious next thing (more reach, all applicants,
  more AI). Users instantly understand *why* to upgrade.
- **Themed naming** (Warm Up / Power Set / Beast Mode) fits the brand and is memorable.
- **Coaches priced below gyms** (300/600 vs 500/1000) correctly reflects individual vs. business budget.
- **AI gated to paid tiers** — your most expensive feature should never sit on free.

---

## 4. Concerns & suggestions

### a) Make the "first 10 applicants" limit a *visible* wall
This is the strongest reason a free gym upgrades. Show the locked applicants as blurred/counted
("+7 more applicants — upgrade to view"), don't just hide them. A visible-but-locked wall converts
far better than an invisible cap.

### b) Notifications: wire them into the upgrade story
Since notifications are coming, use them to reinforce the plan limits, not just as neutral utility:
- Free gym: "5 new applicants are waiting — upgrade to view them all."
- Coach: "A gym viewed your profile" / "A new job matches your certifications."
- GymSpot AI: "Your daily AI searches reset — 10 ready to use."
- Premium gets real-time push; Free/Pro get a batched digest.

### c) Consider annual billing
A "2 months free on annual" (e.g. gym Pro 5,000 EGP/yr instead of 6,000) improves cash flow and
retention a lot for very little effort.

### d) Reconsider the free-tier profile-edit cap
Capping edits to 3/month can feel punitive (fixing a typo "wastes" an edit) and rarely drives
upgrades. Consider dropping it from free or making it generous (e.g. 10).

---

## 5. Is the pricing good for the Egyptian market? 💰

**Yes — well-judged and affordable, arguably slightly low, which is ideal for a launch.**

Context (~48–50 EGP/USD in 2025–2026):

| Plan | EGP/mo | ≈ USD/mo |
|------|--------|----------|
| Gym Pro | 500 | ~$10 |
| Gym Premium | 1000 | ~$20 |
| Coach Pro | 300 | ~$6 |
| Coach Premium | 600 | ~$12 |

- **Gyms:** A gym pays rent, equipment, and several salaries. 500–1000 EGP/month for a recruitment +
  marketing channel with AI is a rounding error in that budget. If it produces even one hire or a few
  members, it pays for itself many times over. Comfortably affordable.
- **Coaches (the price-sensitive side):** A trainer in Egypt charges ~100–400 EGP per session, so
  **Coach Pro (300) ≈ one session**, Premium (600) ≈ two. Reasonable *if* the platform brings them
  clients/jobs. Keep the free tier genuinely useful so coaches earn a first result before the paywall
  bites; if conversion is slow, test a ~150 EGP intro tier.

**Framing note:** these are *business/professional tools*, so judge them against ROI, not personal
salary. By that measure they're priced sensibly. Once you have proven hires, gym Premium could move
toward ~1,500 EGP without resistance — which is exactly what the struck-through "regular" price on the
page pre-frames.

**The one real risk** is AI cost (USD) vs. revenue (EGP). The daily search caps (§2) are your
margin protection — keep them enforced and revisit the numbers if usage or FX shifts.

---

## 6. Recommended priorities

1. **Enforce GymSpot AI daily caps server-side** before exposing the feature.
2. **Build the "locked applicants" wall** — your #1 conversion lever.
3. **Wire notifications into the upgrade story**, not just neutral alerts.
4. **Keep GymSpot AI scoped to GymSpot data/actions** — that's the moat.
5. **Add annual billing** with a 2-months-free discount.
6. **Reconsider the free-tier profile-edit cap** (likely more friction than revenue).

---

## 7. Status of the `/plans` page

✅ **Updated to match this opinion:**
- Tiers renamed to **Warm Up / Power Set / Beast Mode**, with a **Free** tier.
- Currency switched to **EGP**; real prices with a **launch discount** (struck-through regular price
  + "Save X%" badge on paid tiers).
- Feature lists rewritten from the PDF (images, job postings/applications, applicants/certifications,
  profile edits, chat) with the **single GymSpot AI** line and its daily quota per tier.
- Added a **"Powered by GymSpot AI"** explainer banner describing the smart-search use cases.
- Both **English and Arabic** translations updated; page is public for everyone.

Still open (need your numbers/decisions): annual billing prices, final AI daily limits, and whether
to keep the free-tier edit cap. Say the word and I'll wire those in.

---

*This is my opinion as a recommendation, not a final business decision — validate pricing against
real conversion data after launch.*
