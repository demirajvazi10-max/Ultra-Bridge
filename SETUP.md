# Setup against real Sanity

Everything below uses cmd. Most steps are commands. Three steps need the Sanity website once (marked WEB). Replace the placeholders in angle brackets.

## 0. What you need

- Node.js 22 or newer (`node -v`).
- A Sanity account (sign in with GitHub) and an organization.
- One language model key: an Anthropic API key, or a Gemini API key.

## 1. Studio, project, schema and data

```
cd studio
npm install
npx sanity login
npx sanity organizations list
npx sanity init --bare
```

`init --bare` creates the project and prints the project ID and dataset name. Then, in the same cmd window:

```
set SANITY_STUDIO_PROJECT_ID=<PROJECT_ID>
set SANITY_STUDIO_DATASET=production
npx sanity schemas deploy
npx sanity datasets import ..\seed\seed.ndjson -d production --replace
```

The schema deploy is required. Context reads the deployed schema to explain the dataset to the agent.

Check the import:

```
npx sanity documents query "count(*[_type=='command'])"
```

It should print 120 (or the current number in `seed/build-seed.mjs` output).

## 2. Knowledge Base (guides)

Knowledge Bases are in beta. An organization admin may need to enable them on the Labs page (WEB).

```
npx sanity context create --title "Ultra Bridge guides" --description "Explanations for people moving between JAWS and NVDA screen readers"
```

Note the ID it prints (it starts with kb). Then:

```
set KB=<KB_ID>
for %f in (..\seed\guides\*.md) do npx sanity context imports create %KB% --file %f
npx sanity context build %KB% --watch
```

In a batch file use `%%f` instead of `%f`.

## 3. Context endpoint and token (WEB)

In the Sanity Dashboard for your organization:

1. Turn on Context on the Apps page if it is not on yet.
2. In the Context app, create an MCP endpoint named `ultra-bridge` with the `ultra-bridge` dataset as its source (GROQ mode).
3. In Manage, API, Tokens, create an organization token with the Context Viewer role. Copy it once. Never commit it.

The endpoint URL looks like this:

```
https://api.sanity.io/v1/context/organizations/<ORG_ID>/mcp/ultra-bridge
```

The Knowledge Base is served through the same endpoint with two query parameters:

```
https://api.sanity.io/v1/context/organizations/<ORG_ID>/mcp/ultra-bridge?mode=knowledge_base&knowledgeBases=<KB_ID>
```

If the second URL does not return the Knowledge Base tools, create a second endpoint that has only the Knowledge Base as its source and use that URL instead.

## 4. Web app

```
cd ..\web
npm install
copy .env.example .env.local
```

Edit `.env.local`:

- `SANITY_CONTEXT_MCP_URL` the first URL above.
- `SANITY_CONTEXT_KB_MCP_URL` the second URL above (optional).
- `SANITY_ORGANIZATION_TOKEN` the token.
- `ANTHROPIC_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`.

Then:

```
npm run dev
```

Open http://localhost:3000 and ask "What is the NVDA equivalent of JAWS Insert+F7?". Open "How this was found" to see the GROQ query.

Check what the app can see, without secrets: http://localhost:3000/api/health

## 5. Deploy

```
npm run build
npx vercel
```

Add the same environment variables in the Vercel project settings and redeploy with `npx vercel --prod`. Keep `RATE_LIMIT_PER_MINUTE` low on a public demo, because visitors spend your model quota.

## Updating data

Edit `seed/data.mjs`, then:

```
node seed\build-seed.mjs
cd studio
npx sanity datasets import ..\seed\seed.ndjson -d production --replace
```

Rebuild the Knowledge Base after changing guides: `npx sanity context refresh %KB%` then `npx sanity context build %KB% --watch`.
