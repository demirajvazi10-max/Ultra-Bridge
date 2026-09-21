// Chooses the language model(s) from environment variables.
// Every provider whose key is set joins a fallback chain, so a rate limit on one model does
// not stop the demo. Each model has its own free quota, so several models per provider help.
// Author: Demir Ajvazi
import {anthropic} from '@ai-sdk/anthropic'
import {cerebras} from '@ai-sdk/cerebras'
import {google} from '@ai-sdk/google'
import {groq} from '@ai-sdk/groq'
import type {LanguageModelV3} from '@ai-sdk/provider'
import type {LanguageModel} from 'ai'
import {ConfigError} from './agent'
import {createFallbackModel} from './fallback-model'
import {log} from './log'
import {createOfflineModel} from './offline-model'

type Entry = {label: string; make: () => LanguageModelV3}

const list = (value: string | undefined, fallback: string): string[] =>
  (value || fallback).split(',').map((s) => s.trim()).filter(Boolean)

// Free tier quotas are per model. The Flash-Lite models allow far more requests per day than
// the full Flash model, so they come first and the full model is the last Gemini resort.
const GEMINI_DEFAULT = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash'
const GROQ_DEFAULT = 'openai/gpt-oss-120b,llama-3.3-70b-versatile,openai/gpt-oss-20b'

function providers(env: NodeJS.ProcessEnv): Record<string, Entry[]> {
  const gemini = env.GEMINI_MODEL ? [env.GEMINI_MODEL, ...list(env.GEMINI_MODELS, GEMINI_DEFAULT)] : list(env.GEMINI_MODELS, GEMINI_DEFAULT)
  return {
    anthropic: env.ANTHROPIC_API_KEY ? [{label: `anthropic:${env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'}`, make: () => anthropic(env.ANTHROPIC_MODEL || 'claude-sonnet-4-6') as LanguageModelV3}] : [],
    google: env.GOOGLE_GENERATIVE_AI_API_KEY
      ? [...new Set(gemini)].map((id) => ({label: `google:${id}`, make: () => google(id) as LanguageModelV3}))
      : [],
    groq: env.GROQ_API_KEY
      ? [...new Set(list(env.GROQ_MODELS || env.GROQ_MODEL, GROQ_DEFAULT))].map((id) => ({label: `groq:${id}`, make: () => groq(id) as LanguageModelV3}))
      : [],
    cerebras: env.CEREBRAS_API_KEY
      ? [{label: `cerebras:${env.CEREBRAS_MODEL || 'gpt-oss-120b'}`, make: () => cerebras(env.CEREBRAS_MODEL || 'gpt-oss-120b') as LanguageModelV3}]
      : [],
  }
}

export function pickModel(env: NodeJS.ProcessEnv = process.env): {model: LanguageModel; label: string} {
  if (env.ULTRA_MODEL === 'offline') return {model: createOfflineModel(), label: 'offline scripted demo'}

  // Default provider order: Anthropic, Gemini, Groq, Cerebras. ULTRA_MODEL_ORDER=google,groq overrides it.
  const all = providers(env)
  const order = list(env.ULTRA_MODEL_ORDER, 'anthropic,google,groq,cerebras')
  const entries = order.flatMap((name) => all[name] ?? [])

  if (entries.length === 0) {
    throw new ConfigError('Set at least one of GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY or ANTHROPIC_API_KEY, or ULTRA_MODEL=offline.')
  }
  if (entries.length === 1) return {model: entries[0].make(), label: entries[0].label}

  const models = entries.map((e) => e.make())
  const byModel = new Map(models.map((m, i) => [m, entries[i].label]))
  const model = createFallbackModel(models, {
    firstOutputTimeoutMs: Number(env.MODEL_TIMEOUT_SECONDS ?? 25) * 1000,
    onFallback: (failed, error, next) => {
      const e = error as {message?: unknown; statusCode?: number; responseBody?: string}
      const detail = typeof e?.responseBody === 'string' ? ` | ${e.responseBody.replace(/\s+/g, ' ').slice(0, 200)}` : ''
      const reason = `${e?.statusCode ? `status ${e.statusCode}, ` : ''}${String(e?.message ?? error).slice(0, 140)}${detail}`
      log.warn(`[ultra-bridge] ${byModel.get(failed)} failed (${reason}). ${next ? `Trying ${byModel.get(next)}.` : 'No more models.'}`)
    },
  })
  return {model, label: entries.map((e) => e.label).join(' > ')}
}
