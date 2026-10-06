import type { Edge } from '@xyflow/react'
import type { Locale } from '../i18n/locale'
import type { WorkflowFlowNode } from '../types/workflow'

export type InitialWorkflow = {
  title: string
  description: string
  nodes: WorkflowFlowNode[]
  edges: Edge[]
}

const edges: Edge[] = [
  { id: 'e1', source: 'start', target: 'research' },
  { id: 'e2', source: 'start', target: 'normalize' },
  { id: 'e3', source: 'research', target: 'draft' },
  { id: 'e4', source: 'normalize', target: 'draft' },
  { id: 'e5', source: 'draft', target: 'review' },
  { id: 'e6', source: 'review', target: 'output' },
]

function build(
  title: string,
  description: string,
  texts: Array<{ id: string; kind: WorkflowFlowNode['data']['kind']; label: string; goal: string; x: number; y: number }>,
): InitialWorkflow {
  return {
    title,
    description,
    edges,
    nodes: texts.map((item) => ({
      id: item.id,
      type: 'workflow' as const,
      position: { x: item.x, y: item.y },
      data: { kind: item.kind, label: item.label, goal: item.goal },
    })),
  }
}

const en = build(
  'Competitor Pricing Brief',
  'Research competitors, normalize pricing signals, then draft a short brief for human review.',
  [
    { id: 'start', kind: 'start', label: 'Start', goal: 'Accept product category and market region as inputs.', x: 40, y: 220 },
    { id: 'research', kind: 'research', label: 'Gather sources', goal: 'Collect public pricing pages and launch notes for top 5 competitors.', x: 380, y: 40 },
    { id: 'normalize', kind: 'tool', label: 'Normalize table', goal: 'Convert findings into a comparable table: plan, price, billing unit, caveats.', x: 380, y: 360 },
    { id: 'draft', kind: 'think', label: 'Draft brief', goal: 'Write a one-page brief with patterns, outliers, and open questions.', x: 760, y: 220 },
    { id: 'review', kind: 'human', label: 'Human review', goal: 'Pause for the user to approve tone and claims before delivery.', x: 1140, y: 220 },
    { id: 'output', kind: 'output', label: 'Deliver', goal: 'Return the approved brief as markdown.', x: 1520, y: 220 },
  ],
)

const zh = build(
  '竞品定价简报',
  '调研竞品、整理定价信号，并起草一份供人工审阅的简报。',
  [
    { id: 'start', kind: 'start', label: '开始', goal: '接收产品品类与目标市场作为输入。', x: 40, y: 220 },
    { id: 'research', kind: 'research', label: '收集来源', goal: '收集前 5 名竞品的公开定价页与发布说明。', x: 380, y: 40 },
    { id: 'normalize', kind: 'tool', label: '规范化表格', goal: '整理为可对比表格：方案、价格、计费单位、注意事项。', x: 380, y: 360 },
    { id: 'draft', kind: 'think', label: '起草简报', goal: '撰写一页简报，覆盖共性、异常点与待确认问题。', x: 760, y: 220 },
    { id: 'review', kind: 'human', label: '人工审阅', goal: '暂停，等待用户确认语气与表述后再交付。', x: 1140, y: 220 },
    { id: 'output', kind: 'output', label: '交付', goal: '以 Markdown 返回已批准的简报。', x: 1520, y: 220 },
  ],
)

const ja = build(
  '競合価格ブリーフ',
  '競合を調査し価格シグナルを整理したうえで、人の確認用に短いブリーフを作成します。',
  [
    { id: 'start', kind: 'start', label: '開始', goal: '製品カテゴリと対象市場を入力として受け取る。', x: 40, y: 220 },
    { id: 'research', kind: 'research', label: '情報収集', goal: '上位5社の公開価格ページと発表ノートを集める。', x: 380, y: 40 },
    { id: 'normalize', kind: 'tool', label: '表に正規化', goal: 'プラン・価格・課金単位・注意点の比較表に整形する。', x: 380, y: 360 },
    { id: 'draft', kind: 'think', label: 'ブリーフ作成', goal: '傾向・外れ値・未解決点を含む1ページのブリーフを書く。', x: 760, y: 220 },
    { id: 'review', kind: 'human', label: '人の確認', goal: 'トーンと主張の承認を待つため一時停止する。', x: 1140, y: 220 },
    { id: 'output', kind: 'output', label: '納品', goal: '承認済みブリーフを Markdown で返す。', x: 1520, y: 220 },
  ],
)

export const INITIAL_WORKFLOWS: Record<Locale, InitialWorkflow> = { en, zh, ja }

/** @deprecated use INITIAL_WORKFLOWS[locale] */
export const INITIAL_WORKFLOW = INITIAL_WORKFLOWS.en
