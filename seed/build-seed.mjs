// Expands data.mjs into Sanity NDJSON documents, validates references, and writes guide markdown files.
// Author: Demir Ajvazi
import {writeFileSync, mkdirSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {screenReaders, sources, actions, concepts, differences, guides, VERIFICATION} from './data.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const docs = []
const ids = new Set()
const errors = []

const ref = (type, id) => ({_type: 'reference', _ref: `${type}-${id}`})
let keyCounter = 0
const key = () => `k${(++keyCounter).toString(36)}`
const slug = (id) => ({_type: 'slug', current: id})

function add(doc) {
  if (ids.has(doc._id)) errors.push(`Duplicate _id ${doc._id}`)
  ids.add(doc._id)
  docs.push(doc)
}

const readerIds = new Set(screenReaders.map((r) => r.id))
const sourceIds = new Set(sources.map((s) => s.id))
const actionIds = new Set(actions.map((a) => a.id))
const conceptIds = new Set(concepts.map((c) => c.id))
const readerName = Object.fromEntries(screenReaders.map((r) => [r.id, r.name]))
const LAYOUTS = new Set(['desktop', 'laptop', 'both'])

for (const r of screenReaders) {
  add({_id: `screenReader-${r.id}`, _type: 'screenReader', name: r.name, slug: slug(r.id), vendor: r.vendor, licence: r.licence, modifierKeys: r.modifierKeys, homepage: r.homepage})
}
for (const s of sources) {
  add({_id: `source-${s.id}`, _type: 'source', title: s.title, publisher: s.publisher, firstParty: s.firstParty, url: s.url})
}

const stats = {commands: 0, byVerification: {}, byReader: {}}
for (const a of actions) {
  add({
    _id: `action-${a.id}`,
    _type: 'action',
    title: a.title,
    slug: slug(a.id),
    category: a.category,
    description: a.description,
    phrases: a.phrases,
  })
  for (const reader of ['jaws', 'nvda']) {
    for (const entry of a[reader] ?? []) {
      const [layout, keys, ver, srcs, note = '', context = 'anywhere'] = entry
      if (!LAYOUTS.has(layout)) errors.push(`${a.id}/${reader}: bad layout ${layout}`)
      if (!VERIFICATION[ver]) errors.push(`${a.id}/${reader}: bad verification ${ver}`)
      for (const sid of srcs) if (!sourceIds.has(sid)) errors.push(`${a.id}/${reader}: unknown source ${sid}`)
      if (ver === 'R' && srcs.length) errors.push(`${a.id}/${reader}: recalled command should not list sources`)
      if (ver !== 'R' && ver !== 'V' && srcs.length === 0) errors.push(`${a.id}/${reader}: non-recalled command needs a source`)
      const layoutLabel = layout === 'both' ? 'both layouts' : `${layout} layout`
      add({
        _id: `command-${reader}-${a.id}-${layout}`,
        _type: 'command',
        label: `${readerName[reader]}: ${a.title} (${layoutLabel}): ${keys}`,
        screenReader: ref('screenReader', reader),
        action: ref('action', a.id),
        keys,
        layout,
        context,
        note,
        verification: VERIFICATION[ver],
        sources: srcs.map((sid) => ({...ref('source', sid), _key: key()})),
      })
      stats.commands++
      stats.byVerification[VERIFICATION[ver]] = (stats.byVerification[VERIFICATION[ver]] ?? 0) + 1
      stats.byReader[reader] = (stats.byReader[reader] ?? 0) + 1
    }
  }
}

for (const c of concepts) {
  for (const [rid] of c.terms) if (!readerIds.has(rid)) errors.push(`concept ${c.id}: unknown reader ${rid}`)
  for (const aid of c.relatedActions) if (!actionIds.has(aid)) errors.push(`concept ${c.id}: unknown action ${aid}`)
  for (const sid of c.sources) if (!sourceIds.has(sid)) errors.push(`concept ${c.id}: unknown source ${sid}`)
  add({
    _id: `concept-${c.id}`,
    _type: 'concept',
    title: c.title,
    slug: slug(c.id),
    definition: c.definition,
    terms: c.terms.map(([rid, term, note]) => ({_key: key(), _type: 'term', screenReader: ref('screenReader', rid), term, note: note ?? ''})),
    relatedActions: c.relatedActions.map((aid) => ({...ref('action', aid), _key: key()})),
    sources: c.sources.map((sid) => ({...ref('source', sid), _key: key()})),
  })
}

for (const d of differences) {
  for (const rid of d.readers) if (!readerIds.has(rid)) errors.push(`difference ${d.id}: unknown reader ${rid}`)
  for (const aid of d.actions) if (!actionIds.has(aid)) errors.push(`difference ${d.id}: unknown action ${aid}`)
  add({
    _id: `difference-${d.id}`,
    _type: 'difference',
    title: d.title,
    slug: slug(d.id),
    severity: d.severity,
    summary: d.summary,
    workaround: d.workaround,
    readers: d.readers.map((rid) => ({...ref('screenReader', rid), _key: key()})),
    affectedActions: d.actions.map((aid) => ({...ref('action', aid), _key: key()})),
  })
}

mkdirSync(join(here, 'guides'), {recursive: true})
for (const g of guides) {
  for (const aid of g.relatedActions) if (!actionIds.has(aid)) errors.push(`guide ${g.id}: unknown action ${aid}`)
  for (const cid of g.relatedConcepts) if (!conceptIds.has(cid)) errors.push(`guide ${g.id}: unknown concept ${cid}`)
  add({
    _id: `guide-${g.id}`,
    _type: 'guide',
    title: g.title,
    slug: slug(g.id),
    audience: g.audience,
    summary: g.summary,
    body: g.body,
    relatedActions: g.relatedActions.map((aid) => ({...ref('action', aid), _key: key()})),
    relatedConcepts: g.relatedConcepts.map((cid) => ({...ref('concept', cid), _key: key()})),
  })
  writeFileSync(join(here, 'guides', `${g.id}.md`), g.body)
}

// Reference integrity: every _ref in every document must resolve.
for (const d of docs) {
  const walk = (v, path) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
    else if (v && typeof v === 'object') {
      if (v._type === 'reference' && !ids.has(v._ref)) errors.push(`${d._id}${path}: dangling ref ${v._ref}`)
      for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`)
    }
  }
  walk(d, '')
}

if (errors.length) {
  console.error(`FAILED with ${errors.length} error(s):\n` + errors.map((e) => ' - ' + e).join('\n'))
  process.exit(1)
}

writeFileSync(join(here, 'seed.ndjson'), docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
const byType = docs.reduce((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {})
console.log('OK', JSON.stringify({total: docs.length, byType, stats}, null, 2))
