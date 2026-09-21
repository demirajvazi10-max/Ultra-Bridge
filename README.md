# Ultra Bridge

Ultra Bridge helps screen reader users find, compare and translate keyboard commands between **JAWS** and **NVDA**. It is an agent that answers from a structured Sanity dataset through Sanity Context MCP, and it states how well each command has been verified.

Part of the Ultra suite of accessible software by Demir Ajvazi. Built for the DEV Sanity Challenge (Path One).

## Why structured content is required

Ask a plain text search "what is the NVDA equivalent of JAWS Insert+F7" and you will get a page that mentions both. Ask it "which keys exist in both screen readers but do different jobs" and it cannot answer at all.

Ultra Bridge models the problem instead of storing text:

- An **action** is a task such as "show a list of all links". It knows nothing about any screen reader.
- A **command** is the keys one screen reader uses for one action, in one keyboard layout, with a verification level and its sources.
- Equivalents are found through the shared action. Nothing is hard coded pair by pair.

That makes these questions answerable with one query each:

| Question | What the query does |
| --- | --- |
| What is the NVDA equivalent of JAWS Insert+F7? | Follows the command to its action and back to the NVDA command. |
| Which keys do different jobs in JAWS and NVDA? | Finds commands with the same keys but different actions. The data shows R, A, Q, S, D and O. |
| Which JAWS commands have no default NVDA equivalent? | Set difference over actions. |
| Which commands are not fully verified? | Filters on the verification field. |

The queries are in `web/lib/prompt.ts`. They were run against the real dataset before being written down.

## Two Sanity Context modes

- **GROQ mode** serves the structured dataset: screen readers, sources, actions, commands, concepts, differences and guides.
- **Knowledge Base mode** serves prose: six guides such as "Browse mode and focus mode for JAWS users". These are imported from `seed/guides/*.md`.

The agent connects to both, drops the duplicate `initial_context` tool, and inlines each initial context into its system prompt, as the Sanity documentation recommends. If the Knowledge Base is unavailable, the agent carries on with the structured data only.

## Trust is part of the data

Every command has a `verification` value:

- `tested-by-author`: the keys were pressed on a real system.
- `cross-checked`: two or more sources agree.
- `first-party`: one document from Freedom Scientific or NV Access.
- `third-party`: one page from someone else, such as Deque University or Penn State.
- `recalled`: not confirmed in a fetched source. The agent is told to say so and to point to input help.

Sources are documents too, so every answer can cite titles and URLs. Where sources disagree, the disagreement is recorded on the command (for example the JAWS Find keys and the JAWS radio button key).

Run `node seed/print-unverified.mjs` to list everything that still needs a hands-on check. `VERIFY.md` is the checklist.

## Accessibility

The interface is built to work equally well with and without a screen reader.

- Skip link, one `h1`, section headings, and a heading for every question and answer, so H navigation works.
- One polite live region. The full answer is announced once, when it is complete, instead of being read piece by piece while it streams.
- A button to read the last answer again.
- Focus stays in the question box after asking.
- The GROQ queries behind an answer are available in a details element.
- Light and dark colour schemes, visible focus, no horizontal scrolling at 360 px.

The end-to-end test runs axe-core in both colour schemes.

## Try it in two minutes, with no accounts

```
cd web
npm install
copy .env.offline.example .env.local
npm run mock
```

Open a second terminal:

```
cd web
npm run dev
```

Open http://localhost:3000. The mock server answers real GROQ queries over `seed/seed.ndjson` using `groq-js`. The offline model only understands the example questions on the page. It exists so the whole stack can be tested without keys.

## Run it against real Sanity

See `SETUP.md`.

## Tests

```
cd web
npm run test:agent
npm run test:e2e
```

`test:agent` connects the real agent code to the mock Context server and checks that each question produces a `groq_query` call and an answer containing the expected data. `test:e2e` builds nothing itself, so run `npm run build` first. It starts the app, drives it in Chromium, checks announcements, focus, the details view, error handling and rate limiting, and runs axe-core.

## Layout

```
seed/      data.mjs is the source of truth. build-seed.mjs validates references and writes seed.ndjson and guides/.
studio/    Sanity Studio with the schema (seven document types).
web/       Next.js app: /api/chat, the agent, the prompt, the interface, and the local mock server.
```

## Data sources and attribution

Key names are facts taken from public documentation and cross-checked as described above. Descriptions and guides are written in original words. Sources: Freedom Scientific JAWS keystrokes and hotkeys pages, the NVDA User Guide and the NVDA wiki page "Switching from JAWS to NVDA" by NV Access, Deque University, and Penn State Accessibility. Ultra Bridge is not affiliated with or endorsed by Freedom Scientific, NV Access, Deque or Penn State. JAWS and NVDA are trademarks of their owners.

## Limits

- JAWS and NVDA only, and mostly reading, speech and web browsing commands.
- Command names change between versions. The data was checked against documentation available in September 2026.
- A public demo uses a language model and a rate limit protects it.

## Licence

MIT. See LICENSE.
