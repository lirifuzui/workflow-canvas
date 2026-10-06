import type { Edge, Node } from '@xyflow/react'
import type { Messages } from '../i18n/messages'
import type { ValidationIssue, WorkflowNodeData, WorkflowSpec } from '../types/workflow'

export function graphToSpec(
  title: string,
  description: string,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): WorkflowSpec {
  const order = topologicalOrderIds(
    nodes.map((n) => n.id),
    edges.map((e) => ({ from: e.source, to: e.target })),
  )
  const stepOf = new Map(order.map((id, index) => [id, index + 1]))

  return {
    version: 1,
    id: slugify(title) || 'untitled-workflow',
    title,
    description,
    order,
    nodes: [...nodes]
      .sort((a, b) => (stepOf.get(a.id) ?? 0) - (stepOf.get(b.id) ?? 0))
      .map((node) => ({
        id: node.id,
        kind: node.data.kind,
        label: node.data.label,
        goal: node.data.goal,
        notes: node.data.notes || undefined,
        step: stepOf.get(node.id) ?? 0,
        position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
      })),
    edges: edges.map((edge) => ({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
    })),
  }
}

export function validateSpec(spec: WorkflowSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const ids = new Set(spec.nodes.map((n) => n.id))
  const starts = spec.nodes.filter((n) => n.kind === 'start')
  const outputs = spec.nodes.filter((n) => n.kind === 'output')

  if (starts.length === 0) {
    issues.push({ level: 'error', message: 'Missing a start node.' })
  } else if (starts.length > 1) {
    issues.push({ level: 'warning', message: 'Multiple start nodes found.' })
  }

  if (outputs.length === 0) {
    issues.push({ level: 'warning', message: 'No output node — the agent may not know when to stop.' })
  }

  for (const node of spec.nodes) {
    if (!node.goal.trim()) {
      issues.push({
        level: 'error',
        message: `Node "${node.label}" has an empty goal.`,
        nodeId: node.id,
      })
    }
  }

  for (const edge of spec.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      issues.push({
        level: 'error',
        message: `Edge ${edge.id} references a missing node.`,
      })
    }
    if (edge.from === edge.to) {
      issues.push({
        level: 'error',
        message: `Self-loop on node ${edge.from}.`,
        nodeId: edge.from,
      })
    }
  }

  const adjacency = new Map<string, string[]>()
  for (const node of spec.nodes) adjacency.set(node.id, [])
  for (const edge of spec.edges) {
    adjacency.get(edge.from)?.push(edge.to)
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  let hasCycle = false

  const dfs = (id: string) => {
    if (visiting.has(id)) {
      hasCycle = true
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of adjacency.get(id) ?? []) dfs(next)
    visiting.delete(id)
    visited.add(id)
  }

  for (const node of spec.nodes) dfs(node.id)
  if (hasCycle) {
    issues.push({ level: 'error', message: 'Cycle detected — workflows must be a DAG.' })
  }

  const reachable = new Set<string>()
  const queue = starts.map((s) => s.id)
  while (queue.length) {
    const id = queue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    for (const next of adjacency.get(id) ?? []) queue.push(next)
  }

  for (const node of spec.nodes) {
    if (starts.some((s) => s.id === node.id)) continue
    if (!reachable.has(node.id)) {
      issues.push({
        level: 'warning',
        message: `Node "${node.label}" is unreachable from start.`,
        nodeId: node.id,
      })
    }
  }

  return issues
}

export function specToPrompt(
  spec: WorkflowSpec,
  issues: ValidationIssue[],
  m: Messages,
): string {
  const issueBlock =
    issues.length === 0
      ? m.promptStaticOk
      : `${m.promptStaticHeader}\n${issues.map((i) => `- [${i.level}] ${i.message}`).join('\n')}`

  return [
    m.promptIntro,
    'Treat the JSON below as the single source of truth. Do not invent extra steps.',
    m.promptReplyRules,
    m.promptLanguage,
    '',
    issueBlock,
    '',
    '```json',
    JSON.stringify(spec, null, 2),
    '```',
  ].join('\n')
}

export function confirmWorkflow(
  spec: WorkflowSpec,
  m: Messages,
): {
  status: 'approved' | 'needs_fix'
  summary: string
  issues: ValidationIssue[]
  llmPrompt: string
} {
  const issues = validateSpec(spec)
  const errors = issues.filter((i) => i.level === 'error')
  const warnings = issues.filter((i) => i.level === 'warning')
  const steps = topologicalLabels(spec)

  const summary =
    errors.length > 0
      ? m.confirmBlocked(errors.length)
      : m.confirmReady(
          spec.title,
          spec.nodes.length,
          steps.join(' → '),
          spec.description.trim(),
          warnings.length,
        )

  return {
    status: errors.length > 0 ? 'needs_fix' : 'approved',
    summary,
    issues,
    llmPrompt: specToPrompt(spec, issues, m),
  }
}

export function topologicalOrderIds(
  nodeIds: string[],
  edges: Array<{ from: string; to: string }>,
): string[] {
  const indegree = new Map(nodeIds.map((id) => [id, 0]))
  const adj = new Map(nodeIds.map((id) => [id, [] as string[]]))
  for (const edge of edges) {
    if (!indegree.has(edge.from) || !indegree.has(edge.to)) continue
    adj.get(edge.from)?.push(edge.to)
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1)
  }

  const queue = nodeIds.filter((id) => (indegree.get(id) ?? 0) === 0)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const next of adj.get(id) ?? []) {
      const nextDeg = (indegree.get(next) ?? 0) - 1
      indegree.set(next, nextDeg)
      if (nextDeg === 0) queue.push(next)
    }
  }

  if (order.length !== nodeIds.length) {
    for (const id of nodeIds) {
      if (!order.includes(id)) order.push(id)
    }
  }
  return order
}

function topologicalLabels(spec: WorkflowSpec): string[] {
  const order = topologicalOrderIds(
    spec.nodes.map((n) => n.id),
    spec.edges.map((e) => ({ from: e.from, to: e.to })),
  )
  return order.map((id) => spec.nodes.find((n) => n.id === id)?.label ?? id)
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
