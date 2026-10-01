# SDD ledger — plan: docs/superpowers/plans/2026-09-29-cms-steps-1-2.md
Spec: docs/superpowers/specs/2026-09-29-cms-design.md (read). Branch: cms. Merge base with main: 209ddac.

## Pre-flight scan
| Tasks | Produces / consumes | Finding |
|---|---|---|
| T1 self | compare-output tests vs code | agree (ads regex, prose, diffPage keys checked by hand) |
| T2 self | codec tests vs code | agree on hand-trace (strong w/ trailing colon -> HTML tags; small title -> width; cta/table -> raw) ; marked `<br>` form is version-dependent, plan step 5 covers |
| T3 self | images tests vs repo | keys used exist in images.json |
| T1->T5 | compare tool ignores style/title attrs | OK: dropped img title + max-width changes are not compared (accepted in spec summary to user) |
| T2->T4 | blocksToMarkdown ctx = resolver (fileForKey) | agree |
| T2/T3->T5 | markdownToBlocks ctx = resolver (resolve,keyForFile) | agree |
| T4->T5 | file formats vs loaders | agree. migrate re-run in T5 step 7 happens after configs switch to content loaders: still works (regex .source round-trips) |
| T5 self | image-only `p` blocks become `figure` after round trip -> paragraph count for auto-ad placement may shift -> `ads` diff | RISK, carried into T5 dispatch |
| T5 self | build rewrites docs/*.csv (derive() changes videos/affiliate columns) | carry: commit regenerated docs CSVs |
| T5->T6 | loadEvents appended to load.mjs; build img() resolves /img paths | agree |
| T5->T7 | PRODUCTS from content for admin options; check.mjs walk | agree |
| T7 self | admin test runs full build twice | slow but valid |
| T8 self | `git push -u origin cms` | see ruling |
| Global | sdd workspace not git-ignored | fixed: .superpowers/ added to .gitignore (controller bookkeeping commit) |

Ruling: Task 8 does NOT push; pushing the cms branch is left to the user at finish — side effect outside the worktree; user was told the branch is unpushed — costs one extra confirmation if wrong.
Ruling: models — T1,T3,T4,T6,T8 haiku (plan has full code); T2,T7 sonnet; T5 opus (zero-diff debugging); reviewers sonnet; final review opus — cost if wrong: a fix round.

Task 1: review — spec ❌ (test script is `node --test tests/**/*.test.mjs`, brief says `node --test tests/`). Verified: brief's form FAILS on Node 24 (directory arg no longer recursed); unquoted glob is shell-dependent.
Ruling: test script becomes `node --test` (no args; built-in discovery finds *.test.mjs on Node 20–24, verified 3/3 locally) — plan text is wrong for Node ≥22 — cost if wrong: one-line change. Later briefs that say `node --test tests/` mean `npm test`.
Task 1: minor (deferred): compare-output tests cover only title/prose/links in diffPage; detail() prints blank for order-only diffs; CLI lacks arg check; comparison only covers <main>.
Task 1: fix round 1/5 (1 addressed, 0 open — test script; commits 69b4ed5..5e7c3b6)
Task 1: ⚠️ items resolved by controller: .baseline/dist exists; branch is cms; src untouched vs main.
Task 1: complete (commits a566829..5e7c3b6, review clean)
Ruling: commit trailers use each agent's own harness attribution line (Fable fallback) — accurate authorship — cost if wrong: mixed trailers in history.

Task 2: review — spec ❌, 3 Important (plan-mandated code), found by corpus round-trip of 3,514 blocks: (1) `<strong><br></strong>` corrupts (19 blocks); (2) image-only `p` becomes `figure` (75 blocks); (3) `class="btn"` lost on links inside `p` (17 blocks).
Ruling: (1) fix — real corruption. (3) fix — serialise btn links as inline HTML `<a href class="btn">`; buy buttons must stay buttons. Cost if wrong: 17 paragraphs show inline HTML in the editor.
Ruling: (2) ACCEPT as deliberate normalisation — an image-only paragraph becomes a figure; Markdown/the CMS editor cannot express the difference and a marker would put raw HTML in front of Paul for 75 images. Cost if wrong: 75 blocks render as <figure> not <p> (small ones float right), and auto-ad paragraph counts may shift on some pages; Task 5's comparison will surface any `ads` diffs for a further ruling. Codec test must pin this behaviour.
Ruling: also fix minor "small hint distorts height" now (real visual distortion, 5 images). 
Task 2: minor (deferred): unresolvable images dropped silently (matches old build); ' and " entity-encoded by marked (render-identical); br whitespace/heading br; link kind inferred from URL; /blog/x/#frag → external; adjacent ul merge; front-matter edge cases (empty block, BOM, non-object); coverage gaps (ol, product, ad, asset links, em).
Task 2: fix round 1/5 (4 addressed, 0 open; commits 7c042d2..81bc349)
Task 2: minor (deferred): block-final <br> leaves a stray backslash (`<br>`-only block → literal "\"); no corpus block affected per implementer.
Task 2: complete (commits 5e7c3b6..81bc349, review clean)

Task 3: review — spec ✅, approved; 1 Important: resolver caches misses/sizes permanently (stale if long-lived).
Ruling: resolver is created once per build process (no watcher/dev server in this project), so the cache is correct; fix = document that lifetime in a comment, not mtime keying — cost if wrong: stale sizes if someone later adds a watcher. Also fixing now: Object.hasOwn for key lookups; temp-file test for the CMS-upload path (file on disk, not in images.json).
Task 3: minor (deferred): path not confined to public/img; webpSize reads whole file; no tests for corrupt/truncated/animated files.
Task 3: fix round 1/5 (3 addressed, 0 open; commits 331ad7f..98f02a6)
Task 3: complete (commits 81bc349..98f02a6, review clean)
Ruling: Task 4 implementer added .json filter to build.mjs content readdir (plan gap: .md files beside .json broke the old build) — accept; Task 5 replaces those lines anyway — cost if wrong: none.
Task 4: review — spec ✅, approved, no Critical/Important. ⚠️ resolved by controller: Task 5 loaders derive images/videos/affiliateLinks (plan's derive()), compile match with 'i' (plan's loadTopics/loadProducts), and topicOf handles 'detecting' explicitly.
Task 4: minor (deferred): no content/topics/detecting.json (3 posts use fallback topic; not selectable in CMS dropdown); products without image store img:""; two posts' dead covers dropped silently (already 404 on live site); migration logs no warnings for unresolved refs.
Task 4: complete (commits 98f02a6..4ed8c00, review clean)
Ruling: accept 1 ads-only difference (blog/review-minelab-equinox-15-inch-coil: 2 → 1 auto in-article ad placeholders) as a consequence of the image-only-paragraph → figure normalisation — cost if wrong: one auto-ad position on one short post; sidebar slot 5406186549 unaffected.
Task 5: review — spec ✅, approved, no Critical/Important. Reviewer reproduced: 269 compared, 1 differing (ruled ads exception); 1886 Crawfords links all tracked; byte-diff shows head/header/footer identical on every page; inside <main> only accepted categories (img max-width, p→figure, ad placeholder position on ~15 pages, whitespace at tag edges, <br> in 4 headings becomes a space).
Task 5: minor (deferred): seo-inventory.csv videos column omits heroVideo; single trailing backslash in hand-written Markdown becomes <br>; literalQuotes decodes &#39; inside tags; unknown product key renders nothing silently (no warning, no test for raw/product cases); load.test fixtures leak temp dirs; ROOT/settings read duplicated in both config modules; commit subject says "identical" with 1 ruled difference; README and tools/assets.cjs still mention deleted JSON files.
Task 5: complete (commits 4ed8c00..5fcd8ce, review clean)
Task 6: review — spec ✅, approved, no Critical/Important. ⚠️ resolved: branch is cms; implementer's zero-event compare shows only the ruled exception (reviewer of Task 5 reproduced the same baseline result independently).
Task 6: minor (deferred): event link scheme not restricted to http(s)/mailto; description truncated after escaping (can cut an entity); fmtDate has no timeZone (date-only fields could show a day early west of UTC); events missing name/start dropped silently; mid-file import in load.test.mjs.
Task 6: complete (commits 5fcd8ce..b5c03e8, review clean)

Task 7: review — spec ✅; 1 Important: shared concurrency group `pages` with cancel-in-progress lets a cms push or cron cancel an in-flight main deploy. Controller verified admin sign-in screen loads, no console errors.
Ruling: fix concurrency with per-ref group; also fix now two cheap minors with failure potential: unguarded `v.playlists.map` (CMS may omit empty list → build crash) and unanchored/host-limited tracking check regex. Cost if wrong: none.
Task 7: minor (deferred): no automated test that check.mjs exits 1 on an untracked link; youtube stats sub-fields lack labels; `topic: detecting` not in topics collection (relation shows unmatched; may clear on save, falls back by regex); admin.test depends on SITE_URL/CNAME being unset; product label unescaped in admin preview; datetime format round-trip in Sveltia UI unverified; local dev server serves config.yml as octet-stream; 217 content images have empty alt (warning).
Task 7: fix round 1/5 (3 addressed, 0 open; commits 4d39fb1..fed6a9e)
Task 7: complete (commits b5c03e8..fed6a9e, review clean)
Task 8: review — spec ✅; reviewer raised commit-trailer mismatch (Haiku vs Fable) — already ruled (each agent uses its own harness attribution line); not a defect. Not pushed (origin/cms does not exist).
Task 8: complete (commits fed6a9e..4d0251f, review clean)

Final review (opus): Ready with fixes. 2 Important: (F1) new post/page without description fails check and blocks every deploy; (F2) bodies open in rich-text mode, save round-trip untested, escaped inline HTML would lose buy buttons. Minors triaged; fix wave list in final-findings.md (F1–F10).
Ruling: F2 — default the body editor to raw Markdown mode until the rich-text save round trip is verified in launch step 4 — protects buy buttons and tables — cost if wrong: Paul's first view is Markdown text, not WYSIWYG, until we flip it back.
Ruling: F3 — unresolved images / unknown product keys fail the build (exit 1) rather than warn — a silent vanishing image or buy box is worse than a blocked deploy; live site stays on last good version — cost if wrong: a bad upload blocks publishing until fixed.
Ruling: not in fix wave: SRI on Sveltia script, gfm tables, default JSON-LD image, events on hard-coded page, topics/detecting.json, remaining deferred minors — surfaced to user at finish.
Open question for user (reviewer): admin config targets branch main, so trial edits (launch step 4) need either the merge first or a temporary branch: cms config.
Final fix wave: F1–F10 all ADDRESSED (commits 4d0251f..3523720); scoped re-review: no new Critical/Important. 38/38 tests; check clean; comparison = the one ruled exception.
Final: minor (deferred): new page without SEO description shows body excerpt as lede (duplicate text); events `today` uses UTC not Europe/London; unresolved post cover / event image not reported as content problem; build exit-1 path has no automated test.
