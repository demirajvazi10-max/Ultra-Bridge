<!--
DRAFT for the DEV post. Publish with the tag #sanitychallenge.
Replace every [PLACEHOLDER]. Delete the optional paragraph if you prefer. Numbers were true when this was written; rerun
`node seed/build-seed.mjs` and update them if the data changes.
Title suggestion: Ultra Bridge: an agent that only works because JAWS and NVDA commands are structured
-->

## What I Built

Ultra Bridge is an agent for screen reader users. You ask it things like "What is the NVDA equivalent of JAWS Insert+F7?" or "Which keys do different jobs in JAWS and NVDA?", and it answers from a Sanity dataset through Sanity Context MCP. Each answer says how well the commands are verified.

[OPTIONAL, edit or delete: I built it because I rely on a screen reader myself, and moving between JAWS and NVDA means relearning keys that look the same but are not. Ultra Bridge is part of the Ultra suite of accessible software I am building.]

The reason it needs structured content: a keyword search can find a page that mentions both screen readers, but it cannot tell you which keys collide. In Ultra Bridge an **action** ("show a list of all links") is separate from a **command** (the keys one screen reader uses for that action). Equivalents are found through the action, so relationship questions become one query.

This query lists every single letter key that exists in both screen readers but does a different job:

```groq
*[_type=="command" && screenReader->slug.current=="jaws" && context=="browse-mode"]{
  keys,
  "jawsAction": action->title,
  "nvdaMeansSomethingElse": *[_type=="command" && screenReader->slug.current=="nvda" && keys==^.keys && action._ref != ^.action._ref]{"action": action->title}
}[count(nvdaMeansSomethingElse)>0]
```

Against the seed data it returns six keys. R is "region" in JAWS and "radio button" in NVDA. Q is "main content" in JAWS and "block quote" in NVDA. A, O, S and D collide too. That is exactly the kind of thing that costs a person time when they switch.

## Demo

[DEMO_URL]

The page has example questions you can press. Open "How this was found" under any answer to see the GROQ query the agent ran.

## Code

[REPO_URL]

## How I Used Sanity

**Schema.** Seven document types: `screenReader`, `source`, `action`, `command`, `concept`, `difference` and `guide`. At the time of writing the dataset has 229 documents: 60 actions, 127 commands, 13 concepts, 12 differences, 7 guides and 8 sources.

**Trust as data.** Every command has a `verification` field (`tested-by-author`, `cross-checked`, `first-party`, `third-party`, `recalled`) and references to `source` documents. The system prompt tells the agent to say so when it uses a weaker command and to point to input help (Insert+1 in JAWS, NVDA+1 in NVDA). When two sources disagree, the disagreement is written on the command instead of hidden.

**Sanity Context, two modes.**

- GROQ mode serves the structured dataset. The agent fetches `/initial-context` over HTTP, puts it in its system prompt, and uses `groq_query` and `schema_explorer`.
- Knowledge Base mode serves six guides written in prose, for questions like "what should I learn first?". The Knowledge Base is created and built from the CLI (`sanity context create`, `imports create`, `build --watch`).

The two `initial_context` tools have the same name, so the agent drops both and inlines their content. If the Knowledge Base is unavailable, the agent falls back to structured data only.

**What I learned.**

- One endpoint serves one source type, so the structured data and the Knowledge Base need separate access paths.
- GROQ `match` is tokenised text matching, so I use equality for keys that contain `+`.
- The Sanity CLI covers almost everything: project, schema deploy, dataset import, tokens and the Knowledge Base. That mattered because I work from the command line.
- Because Sanity's API was not reachable from where I built the first version, I wrote a small local server that speaks the Context MCP tool names and evaluates real GROQ with `groq-js`. It let me test the agent, the prompt queries and the whole interface offline, and it ships in the repo so anyone can try the project without accounts.

**Accessibility.** The interface has a skip link, real headings for every question and answer, one polite live region that announces the full answer once when it is complete, a "read last answer again" button, and stable focus in the question box. An end-to-end test drives it in Chromium and runs axe-core in light and dark colour schemes.

## Sanity Project Details

Project ID: [PROJECT_ID]
Dataset: production ([public or private, say which])

## Agent Session

[Optional: embed a session transcript and press Make Public first.]
