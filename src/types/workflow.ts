import type { Node } from '@xyflow/react'

export type NodeKind =
  | 'start'
  | 'research'
  | 'think'
  | 'tool'
  | 'branch'
  | 'human'
  | 'output'

export type RunStatus = 'idle' | 'pending' | 'running' | 'done' | 'error'

export type WorkflowNodeData = {
  label: string
  kind: NodeKind
  goal: string
  notes?: string
  /** Topological step number shown on the canvas (1-based). */
  step?: number
  /** Live execution state when Order is pressed. */
  runStatus?: RunStatus
  [key: string]: unknown
}

export type WorkflowFlowNode = Node<WorkflowNodeData, 'workflow'>

export type WorkflowSpec = {
  version: 1
  id: string
  title: string
  description: string
  /** Execution order derived from graph topology (node ids). */
  order: string[]
  nodes: Array<{
    id: string
    kind: NodeKind
    label: string
    goal: string
    notes?: string
    step: number
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    from: string
    to: string
    label?: string
  }>
}

export type ValidationIssue = {
  level: 'error' | 'warning'
  message: string
  nodeId?: string
}

export type ConfirmResult = {
  status: 'approved' | 'needs_fix'
  summary: string
  issues: ValidationIssue[]
  llmPrompt: string
}
