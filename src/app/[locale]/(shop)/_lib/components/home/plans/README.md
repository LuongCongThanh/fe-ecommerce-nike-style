# Animation improvement plans — home components

Scope: `apps/storefront/src/app/[locale]/(shop)/_lib/components/home`
Last reconciled at commit: `30961c2`

## Plans

| #   | Title                                                                                                                           | Severity | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| 001 | [Fold TrustBadgeList into the Hero's staggered reveal](001-trustbadgelist-stagger.md)                                           | MEDIUM   | DONE   |
| 002 | [Add scroll-entrance reveal to the six static home sections](002-section-entrance-reveal.md)                                    | HIGH     | DONE   |
| 003 | [Crossfade NewsletterForm between form and success states](003-newsletterform-state-transition.md)                              | MEDIUM   | DONE   |
| 004 | [Sync HeroCarousel's entrance with the Hero text stagger](004-herocarousel-entrance-sync.md)                                    | MEDIUM   | DONE   |
| 005 | [Consolidate hand-typed easing/duration literals into a shared home motion constant](005-consolidate-ease-duration-literals.md) | LOW      | DONE   |
| 006 | [Use full transform string instead of the `y` shorthand in SectionHero's reveal variants](006-sectionhero-transform-string.md)  | LOW      | DONE   |

## Execution order

1. **002** first — biggest lever, fully independent (new `Reveal.tsx` primitive + 6 section edits, none of which touch `SectionHero.tsx` or `HeroCarousel.tsx`).
2. **003** — independent, single file (`NewsletterForm.tsx`), can run any time relative to the others.
3. **004** then **005**, in that order — both touch `SectionHero.tsx`/`HeroCarousel.tsx`'s easing literal. 005's Step 4 explicitly re-checks for a third occurrence introduced by 004, so running 004 first and 005 second keeps the consolidation complete. Running 005 before 004 also works (004 accounts for the constant already existing) but 004→005 is cleaner.
4. **006** — independent, single file (`SectionHero.tsx`'s `revealUp`/`reducedVariant`), no overlap with 004/005's lines. Can run anytime.

No plan blocks another from a build/typecheck standpoint; the ordering above is about keeping the easing-literal cleanup (005) complete rather than any hard dependency.

## Reconciliation note (commit `30961c2`)

## Reconciliation note (commit `30961c2`)

`feat(storefront): improve home page and add hero carousel` rewrote `SectionHero.tsx` (and 10 other files under `home/`) before plan 001 was executed as such. The rewrite happens to land exactly on plan 001's target — `TrustBadgeList` now renders as a staggered child (`SectionHero.tsx:81-83`) sharing `variants`/`childTransition` with its siblings. Marked **DONE**.

The two missed-opportunity findings below were re-verified against the current code and still stand. `HeroCarousel.tsx` is a new file introduced in this commit and was not covered by the original audit — see the new finding for it.

## Findings — all converted to plans this round

Every finding surfaced in this reconciliation was selected and turned into a plan (002-006 above). Nothing outstanding from this audit pass. Re-run `/improve-animations` against this directory later to catch drift or find new opportunities as the page continues to change.
