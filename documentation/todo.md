# TODO — Remaining Work

> Things we could still work on, roughly in order of demo value. Core (Phases 1–4 + 4.5) is done; these strengthen the demo and harden the build.

## Polish / Demo Strength

1. **Live admin → breakdown reactivity** — Confirm that dragging a weight slider in the admin panel while on the OTP screen updates the risk breakdown and tier in real time. This is the killer "it's a real engine, not a guess" moment.

2. **Intervention screen verbosity** — Make the red takeover land hard: dramatic full-attention styling, verbose dynamic warning, and a "Why am I seeing this?" explainer line (per `project-narrative.md` §8).

3. **"You may have avoided a scam" exit screen** — Stretch goal: backing out of an Intervention routes to a positive outcome screen instead of `/success`. Closes the story arc and ties to the "reduced OTP sharing" impact.

## Robustness

4. **Run the risk engine tests** — Run `src/lib/riskEngine.test.mjs` and confirm the three demo scenarios still score into their correct tiers (A → stealth, B → caution, C → intervention) after all the config changes.

5. **End-to-end click-through** — Manually walk all three scenarios (A/B/C) from form → processing → OTP → success to catch anything broken before the demo.

## Story

6. **README** — A short "what this is / how to run / demo script" so judges and teammates understand it instantly.
