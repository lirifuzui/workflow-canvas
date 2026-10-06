import type { Locale } from './locale'
import type { NodeKind, RunStatus } from '../types/workflow'

export type Messages = {
  brandTag: string
  brandTagRevision: (n: number) => string
  addNode: string
  copyPrompt: string
  confirm: string
  order: string
  stop: string
  workflowTitle: string
  workflowDescription: string
  orderStrip: string
  editNode: string
  editConnection: string
  delete: string
  kind: string
  label: string
  goal: string
  from: string
  to: string
  edgeLabel: string
  edgeLabelPlaceholder: string
  dismiss: string
  newDiagram: string
  needsFix: string
  approved: string
  toastCopied: string
  toastFixBeforeConfirm: string
  toastFixBeforeOrder: string
  toastOrderComplete: string
  emptyGoalPlaceholder: string
  defaultNodeGoal: string
  humanGateLabel: string
  refineSummary: (revision: number, nodeCount: number, edgeCount: number, order: string) => string
  confirmBlocked: (errorCount: number) => string
  confirmReady: (title: string, nodeCount: number, order: string, intent: string, warnings: number) => string
  promptIntro: string
  promptReplyRules: string
  promptLanguage: string
  promptStaticOk: string
  promptStaticHeader: string
  kinds: Record<NodeKind, string>
  runStatus: Record<Exclude<RunStatus, 'idle'>, string>
}

const en: Messages = {
  brandTag: 'Edit the graph. Confirm redraws the plan; Order runs it now.',
  brandTagRevision: (n) => ` · v${n}`,
  addNode: 'Add node',
  copyPrompt: 'Copy prompt',
  confirm: 'Confirm',
  order: 'Order',
  stop: 'Stop',
  workflowTitle: 'Workflow title',
  workflowDescription: 'Workflow description',
  orderStrip: 'Order',
  editNode: 'Edit node',
  editConnection: 'Edit connection',
  delete: 'Delete',
  kind: 'Kind',
  label: 'Label',
  goal: 'Goal',
  from: 'From',
  to: 'To',
  edgeLabel: 'Edge label',
  edgeLabelPlaceholder: 'optional, e.g. yes / no',
  dismiss: 'Dismiss',
  newDiagram: 'New diagram',
  needsFix: 'Needs fix',
  approved: 'Approved',
  toastCopied: 'Spec prompt copied',
  toastFixBeforeConfirm: 'Fix errors before confirming a new diagram',
  toastFixBeforeOrder: 'Cannot order — fix graph errors first',
  toastOrderComplete: 'Order complete',
  emptyGoalPlaceholder: 'Add a goal…',
  defaultNodeGoal: 'Describe what this step should accomplish.',
  humanGateLabel: 'Human gate',
  refineSummary: (revision, nodeCount, edgeCount, order) =>
    `Revised engineering diagram v${revision} from your edits. Kept ${nodeCount} nodes and ${edgeCount} links. Re-laid out in order: ${order}.`,
  confirmBlocked: (errorCount) =>
    `I cannot approve this workflow yet. Fix ${errorCount} error(s) first, then ask again.`,
  confirmReady: (title, nodeCount, order, intent, warnings) =>
    [
      `Plan "${title}" is ready.`,
      `I will run ${nodeCount} steps in this order: ${order}.`,
      intent ? `Intent: ${intent}` : null,
      warnings
        ? `There are ${warnings} warning(s) you may want to review, but nothing blocking.`
        : 'No structural issues found.',
    ]
      .filter(Boolean)
      .join(' '),
  promptIntro: 'You are confirming an editable agent workflow before execution.',
  promptReplyRules:
    'Reply with: (1) a short plain-language restatement of the plan, (2) APPROVED or NEEDS_FIX, (3) any minimal fixes.',
  promptLanguage:
    'Respond AND draft diagram text in the same language as the conversation / workflow title/goals (Chinese, Japanese, English, or mixed). Never force the whole engineering diagram into English.',
  promptStaticOk: 'Static validation: no issues.',
  promptStaticHeader: 'Static validation:',
  kinds: {
    start: 'Start',
    research: 'Research',
    think: 'Think',
    tool: 'Tool',
    branch: 'Branch',
    human: 'Human',
    output: 'Output',
  },
  runStatus: {
    pending: 'Queued',
    running: 'Running',
    done: 'Done',
    error: 'Error',
  },
}

const zh: Messages = {
  brandTag: '编辑画布。Confirm 按你的修改重出工程图；Order 直接按序执行。',
  brandTagRevision: (n) => ` · v${n}`,
  addNode: '添加节点',
  copyPrompt: '复制提示词',
  confirm: '确认',
  order: '执行',
  stop: '停止',
  workflowTitle: '工作流标题',
  workflowDescription: '工作流描述',
  orderStrip: '顺序',
  editNode: '编辑节点',
  editConnection: '编辑连线',
  delete: '删除',
  kind: '类型',
  label: '名称',
  goal: '目标',
  from: '从',
  to: '到',
  edgeLabel: '连线标签',
  edgeLabelPlaceholder: '可选，例如 是 / 否',
  dismiss: '关闭',
  newDiagram: '新工程图',
  needsFix: '需要修复',
  approved: '已通过',
  toastCopied: '提示词已复制',
  toastFixBeforeConfirm: '请先修复错误，再确认新工程图',
  toastFixBeforeOrder: '无法执行 — 请先修复图结构错误',
  toastOrderComplete: '执行完成',
  emptyGoalPlaceholder: '添加目标…',
  defaultNodeGoal: '描述这一步要完成什么。',
  humanGateLabel: '人工确认',
  refineSummary: (revision, nodeCount, edgeCount, order) =>
    `已根据你的修改生成工程图 v${revision}。保留 ${nodeCount} 个节点、${edgeCount} 条连线。新布局顺序：${order}。`,
  confirmBlocked: (errorCount) => `暂时无法通过。请先修复 ${errorCount} 个错误后再试。`,
  confirmReady: (title, nodeCount, order, intent, warnings) =>
    [
      `计划「${title}」已就绪。`,
      `将按此顺序执行 ${nodeCount} 步：${order}。`,
      intent ? `意图：${intent}` : null,
      warnings ? `另有 ${warnings} 条警告可酌情处理，但不阻塞执行。` : '未发现结构性问题。',
    ]
      .filter(Boolean)
      .join(''),
  promptIntro: '你正在确认一份可编辑的 Agent 工作流，确认后再执行。',
  promptReplyRules: '请回复：(1) 用简明语言复述计划，(2) APPROVED 或 NEEDS_FIX，(3) 如需修改只给最小改动。',
  promptLanguage: '请用与对话/工作流标题目标相同的语言回复，并直接用该语言配置工程图文案（标题、节点名、目标、连线标签）。不要把整张图强制改成英文。',
  promptStaticOk: '静态校验：无问题。',
  promptStaticHeader: '静态校验：',
  kinds: {
    start: '开始',
    research: '调研',
    think: '思考',
    tool: '工具',
    branch: '分支',
    human: '人工',
    output: '输出',
  },
  runStatus: {
    pending: '排队',
    running: '执行中',
    done: '完成',
    error: '错误',
  },
}

const ja: Messages = {
  brandTag: 'グラフを編集。Confirm は図面を再生成、Order は確認なしで実行します。',
  brandTagRevision: (n) => ` · v${n}`,
  addNode: 'ノード追加',
  copyPrompt: 'プロンプトをコピー',
  confirm: '確認',
  order: '実行',
  stop: '停止',
  workflowTitle: 'ワークフロー名',
  workflowDescription: '説明',
  orderStrip: '順序',
  editNode: 'ノード編集',
  editConnection: '接続編集',
  delete: '削除',
  kind: '種類',
  label: 'ラベル',
  goal: '目的',
  from: 'From',
  to: 'To',
  edgeLabel: 'エッジラベル',
  edgeLabelPlaceholder: '任意（例: yes / no）',
  dismiss: '閉じる',
  newDiagram: '新しい図面',
  needsFix: '要修正',
  approved: '承認',
  toastCopied: 'プロンプトをコピーしました',
  toastFixBeforeConfirm: 'エラーを直してから Confirm してください',
  toastFixBeforeOrder: '実行できません — 先にグラフのエラーを修正してください',
  toastOrderComplete: '実行完了',
  emptyGoalPlaceholder: '目的を追加…',
  defaultNodeGoal: 'このステップで達成することを書いてください。',
  humanGateLabel: '人の確認',
  refineSummary: (revision, nodeCount, edgeCount, order) =>
    `編集内容に基づき図面 v${revision} を生成しました。ノード ${nodeCount}、接続 ${edgeCount} を維持。順序: ${order}。`,
  confirmBlocked: (errorCount) =>
    `まだ承認できません。先に ${errorCount} 件のエラーを修正してください。`,
  confirmReady: (title, nodeCount, order, intent, warnings) =>
    [
      `プラン「${title}」の準備ができました。`,
      `${nodeCount} ステップをこの順で実行します: ${order}。`,
      intent ? `意図: ${intent}` : null,
      warnings
        ? `警告が ${warnings} 件ありますが、実行は妨げません。`
        : '構造上の問題はありません。',
    ]
      .filter(Boolean)
      .join(''),
  promptIntro: '実行前に、編集可能なエージェントワークフローを確認してください。',
  promptReplyRules:
    '返信内容: (1) 計画の短い言い直し、(2) APPROVED または NEEDS_FIX、(3) 必要な最小限の修正。',
  promptLanguage:
    '会話・ワークフローのタイトル/目的と同じ言語で返答し、図面の文言（タイトル、ノード名、目的、エッジラベル）もその言語で直接書いてください。全体を英語に強制しないでください。',
  promptStaticOk: '静的検証: 問題なし。',
  promptStaticHeader: '静的検証:',
  kinds: {
    start: '開始',
    research: '調査',
    think: '思考',
    tool: 'ツール',
    branch: '分岐',
    human: '人',
    output: '出力',
  },
  runStatus: {
    pending: '待機',
    running: '実行中',
    done: '完了',
    error: 'エラー',
  },
}

export const MESSAGES: Record<Locale, Messages> = { en, zh, ja }

export function t(locale: Locale): Messages {
  return MESSAGES[locale] ?? en
}
