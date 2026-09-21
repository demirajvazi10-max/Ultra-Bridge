'use client'
// Ultra Bridge chat interface, designed to work equally well with and without a screen reader.
// Author: Demir Ajvazi
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import {Fragment, useCallback, useEffect, useRef, useState, type ReactNode} from 'react'

const SUGGESTIONS = [
  'What is the NVDA equivalent of JAWS Insert+F7?',
  'Which keys do different jobs in JAWS and NVDA?',
  'Which JAWS commands have no default NVDA equivalent?',
  'How do I read the whole page with NVDA on a laptop?',
  'I use JAWS. What should I learn first in NVDA?',
  'Which commands in your data are not fully verified?',
]

const transport = new DefaultChatTransport({api: '/api/chat'})

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, {type: 'text'}> => p.type === 'text')
    .map((p) => p.text)
    .join('')
    .trim()
}

type Lookup = {name: string; query?: string; count?: number; state: string}

function lookupsOf(message: UIMessage): Lookup[] {
  const out: Lookup[] = []
  for (const part of message.parts as any[]) {
    const isDynamic = part.type === 'dynamic-tool'
    const isStatic = typeof part.type === 'string' && part.type.startsWith('tool-')
    if (!isDynamic && !isStatic) continue
    const name: string = isDynamic ? part.toolName : part.type.slice(5)
    const input = part.input ?? {}
    let count: number | undefined
    const raw = extractText(part.output)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        count = parsed?.meta?.resultCount ?? (Array.isArray(parsed?.result) ? parsed.result.length : undefined)
      } catch {}
    }
    out.push({name, query: typeof input.query === 'string' ? input.query : input.paths ? `Read: ${(input.paths as string[]).join(', ')}` : undefined, count, state: part.state})
  }
  return out
}

function extractText(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = extractText(v)
      if (t) return t
    }
    return undefined
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (typeof o.text === 'string') return o.text
    // Only follow the keys that carry payloads. Never return the "type" label.
    for (const k of ['content', 'value', 'output', 'result']) {
      if (k in o) {
        const t = extractText(o[k])
        if (t) return t
      }
    }
  }
  return undefined
}

function friendlyError(message: string | undefined): string {
  if (!message) return 'Something went wrong. Please try again.'
  try {
    const parsed = JSON.parse(message)
    if (parsed?.error) return String(parsed.error)
  } catch {}
  return 'Something went wrong. Please try again.'
}

const URL_RE = /(https?:\/\/[^\s)]+)/g

function linkify(line: string): ReactNode[] {
  return line.split(URL_RE).map((chunk, i) =>
    /^https?:\/\//.test(chunk) ? (
      <a key={i} href={chunk} rel="noopener noreferrer" target="_blank">
        {chunk}
      </a>
    ) : (
      <Fragment key={i}>{chunk}</Fragment>
    ),
  )
}

function Prose({text}: {text: string}) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l))
        if (isList) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{linkify(l.replace(/^\s*[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {linkify(l)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}

export function Chat() {
  const {messages, sendMessage, setMessages, status, error, stop} = useChat({transport})
  const [input, setInput] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const previous = useRef(status)
  const busy = status === 'submitted' || status === 'streaming'

  const announce = useCallback((text: string) => {
    setAnnouncement('')
    window.setTimeout(() => setAnnouncement(text), 60)
  }, [])

  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant')

  useEffect(() => {
    const was = previous.current
    previous.current = status
    if (status === 'submitted' && was !== 'submitted') announce('Searching the command data.')
    if ((was === 'streaming' || was === 'submitted') && status === 'ready') {
      const answer = [...messages].reverse().find((m) => m.role === 'assistant')
      const text = answer ? textOf(answer) : ''
      announce(text ? `Answer. ${text}` : 'The lookup finished but there was no answer text.')
    }
    if (status === 'error') announce(friendlyError(error?.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function ask(text: string) {
    const question = text.trim()
    if (!question) return
    if (busy) {
      announce('Still working on the previous question. Please wait.')
      return
    }
    sendMessage({text: question})
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <>
      <section aria-labelledby="ask-heading" className="card">
        <h2 id="ask-heading">Ask about a command</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <label htmlFor="question">Your question about JAWS and NVDA keyboard commands</label>
          <div className="row">
            <input
              ref={inputRef}
              id="question"
              name="question"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              enterKeyHint="send"
              aria-describedby="question-hint"
              maxLength={800}
            />
            <button type="submit" aria-disabled={busy}>
              {busy ? 'Working' : 'Ask'}
            </button>
          </div>
          <p id="question-hint" className="hint">
            Press Enter to ask. The answer is announced when it is complete. You can ask in English or Serbian.
          </p>
        </form>
        <div className="row tools">
          <button type="button" className="secondary" onClick={() => lastAnswer && announce(`Answer. ${textOf(lastAnswer)}`)} disabled={!lastAnswer}>
            Read last answer again
          </button>
          {busy && (
            <button type="button" className="secondary" onClick={() => stop()}>
              Stop
            </button>
          )}
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setMessages([])
              announce('Conversation cleared.')
              inputRef.current?.focus()
            }}
            disabled={messages.length === 0 || busy}
          >
            Clear conversation
          </button>
        </div>
      </section>

      <section aria-labelledby="try-heading" className="card">
        <h2 id="try-heading">Try a question</h2>
        <ul className="suggestions">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button type="button" className="chip" onClick={() => ask(s)}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="conversation-heading" className="card">
        <h2 id="conversation-heading">Conversation</h2>
        <p className="visible-status" aria-hidden="true">
          {busy ? 'Searching the command data…' : ''}
        </p>
        {messages.length === 0 && <p>No questions yet. Ask above or pick one of the examples.</p>}
        <div className="log">
          {messages.map((m) => {
            const text = textOf(m)
            if (m.role === 'user') {
              return (
                <div key={m.id} className="turn question">
                  <h3>You asked</h3>
                  <p>{text}</p>
                </div>
              )
            }
            const lookups = lookupsOf(m)
            return (
              <div key={m.id} className="turn answer">
                <h3>Ultra Bridge answers</h3>
                {text ? <Prose text={text} /> : <p>Working on it.</p>}
                {lookups.length > 0 && (
                  <details>
                    <summary>How this was found ({lookups.length} {lookups.length === 1 ? 'lookup' : 'lookups'})</summary>
                    <ol>
                      {lookups.map((l, i) => (
                        <li key={i}>
                          <p>
                            <strong>{l.name}</strong>
                            {typeof l.count === 'number' ? `, ${l.count} ${l.count === 1 ? 'result' : 'results'}` : ''}
                          </p>
                          {l.query && (
                            <pre>
                              <code>{l.query}</code>
                            </pre>
                          )}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
            )
          })}
        </div>
        {status === 'error' && (
          <p role="alert" className="error">
            {friendlyError(error?.message)}
          </p>
        )}
      </section>

      {/* One polite live region. The full answer is announced once, when it is complete. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {announcement}
      </div>
    </>
  )
}
