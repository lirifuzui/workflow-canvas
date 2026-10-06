import type { Edge } from '@xyflow/react'
import type { Locale } from '../i18n/locale'
import type { WorkflowFlowNode } from '../types/workflow'

export type DemoWorkflow = {
  title: string
  description: string
  sourceNote: string
  nodes: WorkflowFlowNode[]
  edges: Edge[]
}

const edges: Edge[] = [
  { id: 'e1', source: 'start', target: 'retrieve' },
  { id: 'e2', source: 'start', target: 'chunk' },
  { id: 'e3', source: 'retrieve', target: 'chunk' },
  { id: 'e4', source: 'chunk', target: 'sum_a', label: 'fan-out' },
  { id: 'e5', source: 'chunk', target: 'sum_b', label: 'fan-out' },
  { id: 'e6', source: 'chunk', target: 'sum_c', label: 'fan-out' },
  { id: 'e7', source: 'chunk', target: 'sum_n', label: 'fan-out' },
  { id: 'e8', source: 'sum_a', target: 'combine' },
  { id: 'e9', source: 'sum_b', target: 'combine' },
  { id: 'e10', source: 'sum_c', target: 'combine' },
  { id: 'e11', source: 'sum_n', target: 'combine' },
  { id: 'e12', source: 'combine', target: 'quality' },
  { id: 'e13', source: 'quality', target: 'review', label: 'pass' },
  { id: 'e14', source: 'quality', target: 'rewrite', label: 'fail' },
  { id: 'e15', source: 'rewrite', target: 'review' },
  { id: 'e16', source: 'review', target: 'publish' },
]

type NodeText = {
  id: string
  kind: WorkflowFlowNode['data']['kind']
  label: string
  goal: string
  x: number
  y: number
}

function build(
  title: string,
  description: string,
  sourceNote: string,
  texts: NodeText[],
  edgeLabels?: Partial<Record<string, string>>,
): DemoWorkflow {
  return {
    title,
    description,
    sourceNote,
    nodes: texts.map((item) => ({
      id: item.id,
      type: 'workflow' as const,
      position: { x: item.x, y: item.y },
      data: { kind: item.kind, label: item.label, goal: item.goal },
    })),
    edges: edges.map((edge) => ({
      ...edge,
      label: edgeLabels?.[edge.id] ?? edge.label,
    })),
  }
}

const layout: Array<Pick<NodeText, 'id' | 'kind' | 'x' | 'y'>> = [
  { id: 'start', kind: 'start', x: 40, y: 420 },
  { id: 'retrieve', kind: 'tool', x: 400, y: 200 },
  { id: 'chunk', kind: 'tool', x: 400, y: 520 },
  { id: 'sum_a', kind: 'research', x: 820, y: 40 },
  { id: 'sum_b', kind: 'research', x: 820, y: 280 },
  { id: 'sum_c', kind: 'research', x: 820, y: 520 },
  { id: 'sum_n', kind: 'research', x: 820, y: 760 },
  { id: 'combine', kind: 'think', x: 1240, y: 360 },
  { id: 'quality', kind: 'branch', x: 1240, y: 640 },
  { id: 'rewrite', kind: 'think', x: 1620, y: 760 },
  { id: 'review', kind: 'human', x: 1620, y: 360 },
  { id: 'publish', kind: 'output', x: 2000, y: 360 },
]

function withLayout(parts: Array<{ id: string; label: string; goal: string }>): NodeText[] {
  return parts.map((part) => {
    const base = layout.find((item) => item.id === part.id)!
    return { ...base, label: part.label, goal: part.goal }
  })
}

const en = build(
  'Document Map-Reduce Brief',
  'Uxopian-style agentic plan: split a long document, fan-out chunk summaries in parallel, reduce into one brief, then human-approve before delivery.',
  'Derived from Uxopian AI Agentic Plans map-reduce example (chunk → summarize-chunks fan-out → combine), expanded for demo.',
  withLayout([
    { id: 'start', label: 'Ingest document', goal: 'Accept document id / content plus audience and length constraints as plan inputs.' },
    { id: 'retrieve', label: 'Fetch source', goal: 'Load the full document text and metadata from the content store (direct tool).' },
    { id: 'chunk', label: 'Chunk document', goal: 'Split content into ordered chunks[]; publish under output key chunks (no LLM).' },
    { id: 'sum_a', label: 'Summarize chunk A', goal: 'Fan-out worker: summarize item[0] with evidence quotes; cheap model OK.' },
    { id: 'sum_b', label: 'Summarize chunk B', goal: 'Fan-out worker: summarize item[1] with evidence quotes; run in parallel with A/C.' },
    { id: 'sum_c', label: 'Summarize chunk C', goal: 'Fan-out worker: summarize item[2]; max parallel elements ≈ 8 in production.' },
    { id: 'sum_n', label: 'Summarize chunk N…', goal: 'Represents remaining fan-out slots; node output becomes chunkSummaries[].' },
    { id: 'combine', label: 'Combine brief', goal: 'Reduce chunkSummaries into one coherent brief; use a stronger model for this step.' },
    { id: 'quality', label: 'Quality gate', goal: 'Check coverage, contradictions, and missing citations. Branch on pass / rewrite.' },
    { id: 'rewrite', label: 'Targeted rewrite', goal: 'If gate fails: rewrite only failing sections using flagged chunkSummaries.' },
    { id: 'review', label: 'Human review', goal: 'Pause for reviewer to accept / reject / correct claims (Uxopian HITL pattern).' },
    { id: 'publish', label: 'Deliver brief', goal: 'Publish approved markdown brief and execution trace (tokens, node statuses).' },
  ]),
)

const zh = build(
  '文档 Map-Reduce 简报',
  'Uxopian 风格的 Agentic Plan：切分长文档、并行摘要各块、归并成简报，人工审核后再交付。',
  '改编自 Uxopian AI Agentic Plans 的 map-reduce 示例（chunk → 并行 summarize → combine），并扩展质量门与人工审核。',
  withLayout([
    { id: 'start', label: '接入文档', goal: '接收文档 ID/正文，以及受众与篇幅约束作为计划输入。' },
    { id: 'retrieve', label: '拉取原文', goal: '从内容库加载完整正文与元数据（直连工具，不调用 LLM）。' },
    { id: 'chunk', label: '文档分块', goal: '将正文切成有序 chunks[]，写入输出键 chunks。' },
    { id: 'sum_a', label: '摘要块 A', goal: '扇出工人：总结 item[0] 并附证据摘录；可用低成本模型。' },
    { id: 'sum_b', label: '摘要块 B', goal: '扇出工人：总结 item[1]，与 A/C 并行。' },
    { id: 'sum_c', label: '摘要块 C', goal: '扇出工人：总结 item[2]；生产环境最大并行约 8。' },
    { id: 'sum_n', label: '摘要块 N…', goal: '表示其余扇出槽位；节点输出汇总为 chunkSummaries[]。' },
    { id: 'combine', label: '合并简报', goal: '将 chunkSummaries 归并为连贯简报；此步可用更强模型。' },
    { id: 'quality', label: '质量门', goal: '检查覆盖度、矛盾与缺引用；按通过/重写分支。' },
    { id: 'rewrite', label: '定向改写', goal: '若质量门失败：仅改写失败段落。' },
    { id: 'review', label: '人工审阅', goal: '暂停，供审阅人接受/拒绝/就地修正（HITL）。' },
    { id: 'publish', label: '交付简报', goal: '发布已批准的 Markdown 简报与执行轨迹。' },
  ]),
  {
    e4: '扇出',
    e5: '扇出',
    e6: '扇出',
    e7: '扇出',
    e13: '通过',
    e14: '失败',
  },
)

const ja = build(
  'ドキュメント Map-Reduce ブリーフ',
  'Uxopian 風のエージェント計画: 長文を分割し、チャンク要約を並列実行してから統合し、人の確認後に納品します。',
  'Uxopian AI Agentic Plans の map-reduce 例（chunk → 並列 summarize → combine）を拡張したデモです。',
  withLayout([
    { id: 'start', label: '文書を取り込む', goal: '文書 ID / 本文と、読者・長さの制約を入力として受け取る。' },
    { id: 'retrieve', label: '原文を取得', goal: 'コンテンツストアから全文とメタデータを読み込む（直接ツール）。' },
    { id: 'chunk', label: 'チャンク分割', goal: '本文を順序付き chunks[] に分割し、出力キー chunks に載せる。' },
    { id: 'sum_a', label: 'チャンク A 要約', goal: 'ファンアウト: item[0] を根拠引用つきで要約。安価モデル可。' },
    { id: 'sum_b', label: 'チャンク B 要約', goal: 'ファンアウト: item[1] を要約。A/C と並列。' },
    { id: 'sum_c', label: 'チャンク C 要約', goal: 'ファンアウト: item[2] を要約。本番は最大並列≈8。' },
    { id: 'sum_n', label: 'チャンク N…', goal: '残りのファンアウト枠。出力は chunkSummaries[]。' },
    { id: 'combine', label: 'ブリーフ統合', goal: 'chunkSummaries を一つのブリーフに還元。この段は強いモデル可。' },
    { id: 'quality', label: '品質ゲート', goal: '網羅性・矛盾・引用欠けを検査。pass / rewrite で分岐。' },
    { id: 'rewrite', label: '部分書き換え', goal: 'ゲート失敗時、指摘箇所だけ書き直す。' },
    { id: 'review', label: '人の確認', goal: '主張の承認/却下/修正のため一時停止（HITL）。' },
    { id: 'publish', label: 'ブリーフ納品', goal: '承認済み Markdown と実行トレースを公開する。' },
  ]),
  {
    e4: '並列',
    e5: '並列',
    e6: '並列',
    e7: '並列',
    e13: '合格',
    e14: '不合格',
  },
)

export const DOC_MAP_REDUCE_PLANS: Record<Locale, DemoWorkflow> = { en, zh, ja }

/** @deprecated use DOC_MAP_REDUCE_PLANS[locale] */
export const DOC_MAP_REDUCE_PLAN = DOC_MAP_REDUCE_PLANS.en
