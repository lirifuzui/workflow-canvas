import type { Node } from '@xyflow/react'

export type NodeKind =
  | 'start'
  | 'research'
  | 'think'
  | 'tool'
  | 'branch'
  | 'human'
  | 'output'

export type WorkflowNodeData = {
  label: string
  kind: NodeKind
  goal: string
  notes?: string
  [key: string]: unknown
}

export type WorkflowFlowNode = Node<WorkflowNodeData, 'workflow'>

export type WorkflowSpec = {
  version: 1
  id: string
  title: string
  description: string
  nodes: Array<{
    id: string
    kind: NodeKind
    label: string
    goal: string
    notes?: string
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
