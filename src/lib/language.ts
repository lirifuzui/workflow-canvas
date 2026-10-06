import type { Locale } from '../i18n/locale'

const CJK = /[\u3400-\u9fff]/
const HIRAGANA = /[\u3040-\u309f]/
const KATAKANA = /[\u30a0-\u30ff]/
const HANGUL = /[\uac00-\ud7af]/

/**
 * Infer UI / diagram language from free text (title, goals, chat).
 * Prefers Japanese when kana is present, Chinese when Han is present without kana.
 */
export function detectLocaleFromText(...parts: Array<string | undefined | null>): Locale | null {
  const text = parts.filter(Boolean).join('\n')
  if (!text.trim()) return null

  let han = 0
  let kana = 0
  let hangul = 0
  let latin = 0

  for (const ch of text) {
    if (HIRAGANA.test(ch) || KATAKANA.test(ch)) kana += 1
    else if (HANGUL.test(ch)) hangul += 1
    else if (CJK.test(ch)) han += 1
    else if (/[A-Za-z]/.test(ch)) latin += 1
  }

  if (kana >= 2 || (kana >= 1 && han >= 1)) return 'ja'
  if (han >= 2) return 'zh'
  if (hangul >= 2) return 'zh' // fallback UI; content can still be Korean in nodes
  if (latin >= 8 && han === 0 && kana === 0) return 'en'
  return null
}

/** Short contract agents should follow when emitting a workflow JSON for the canvas. */
export const AGENT_DRAFT_CONTRACT = `
When drafting or updating a Workflow Canvas plan from conversation:
1. Use the SAME language as the user (中文 / 日本語 / English / mixed). Never default the whole diagram to English if the user writes Chinese or Japanese.
2. title, description, every node.label, every node.goal, and edge labels must match that language.
3. kind stays in the English enum: start | research | think | tool | branch | human | output.
4. Emit JSON matching version 1 (nodes, edges, optional order). Positions may be omitted; the canvas can layout on Confirm.
`.trim()
