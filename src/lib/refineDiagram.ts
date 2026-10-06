import type { Edge, Node } from '@xyflow/react'
import type { Messages } from '../i18n/messages'
import type { WorkflowNodeData } from '../types/workflow'
import { topologicalOrderIds } from './workflow'

const COL_GAP = 380
const ROW_GAP = 220
const ORIGIN_X = 40
const ORIGIN_Y = 60

export type RefineResult = {
  nodes: Node<WorkflowNodeData>[]
  edges: Edge[]
  summary: string
  revision: number
}

/**
 * Rebuild a clean engineering layout from the user's current topology.
 * Keeps ids / kinds / goals / edges; recomputes layered positions and step order.
 */
export function refineEngineeringDiagram(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  revision: number,
  m: Messages,
): RefineResult {
  const nextRevision = revision + 1
  const nodeIds = nodes.map((n) => n.id)
  const edgePairs = edges.map((e) => ({ from: e.source, to: e.target }))
  const order = topologicalOrderIds(nodeIds, edgePairs)
  const layerOf = computeLayers(nodeIds, edgePairs)

  const byLayer = new Map<number, string[]>()
  for (const id of order) {
    const layer = layerOf.get(id) ?? 0
    const list = byLayer.get(layer) ?? []
    list.push(id)
    byLayer.set(layer, list)
  }

  const positionOf = new Map<string, { x: number; y: number }>()
  const layers = [...byLayer.keys()].sort((a, b) => a - b)
  for (const layer of layers) {
    const ids = byLayer.get(layer) ?? []
    const totalHeight = (ids.length - 1) * ROW_GAP
    ids.forEach((id, index) => {
      positionOf.set(id, {
        x: ORIGIN_X + layer * COL_GAP,
        y: ORIGIN_Y + index * ROW_GAP - totalHeight / 2 + 200,
      })
    })
  }

  const orderLabels = order
    .map((id) => nodes.find((n) => n.id === id)?.data.label ?? id)
    .join(' → ')

  const refinedNodes: Node<WorkflowNodeData>[] = nodes.map((node) => {
    const step = order.indexOf(node.id) + 1
    const pos = positionOf.get(node.id) ?? node.position
    return {
      ...node,
      position: { x: Math.round(pos.x), y: Math.round(pos.y) },
      data: {
        ...node.data,
        step,
        runStatus: 'idle',
        goal: polishGoal(node.data.goal, node.data.kind, node.data.label, m),
      },
    }
  })

  return {
    nodes: refinedNodes,
    edges,
    summary: m.refineSummary(nextRevision, nodes.length, edges.length, orderLabels),
    revision: nextRevision,
  }
}

function computeLayers(
  nodeIds: string[],
  edges: Array<{ from: string; to: string }>,
): Map<string, number> {
  const preds = new Map(nodeIds.map((id) => [id, [] as string[]]))
  const succs = new Map(nodeIds.map((id) => [id, [] as string[]]))
  for (const edge of edges) {
    if (!preds.has(edge.to) || !succs.has(edge.from)) continue
    preds.get(edge.to)!.push(edge.from)
    succs.get(edge.from)!.push(edge.to)
  }

  const layer = new Map<string, number>()
  const indegree = new Map(nodeIds.map((id) => [id, preds.get(id)?.length ?? 0]))
  const queue = nodeIds.filter((id) => (indegree.get(id) ?? 0) === 0)
  for (const id of queue) layer.set(id, 0)

  while (queue.length) {
    const id = queue.shift()!
    const base = layer.get(id) ?? 0
    for (const next of succs.get(id) ?? []) {
      layer.set(next, Math.max(layer.get(next) ?? 0, base + 1))
      const nextDeg = (indegree.get(next) ?? 0) - 1
      indegree.set(next, nextDeg)
      if (nextDeg === 0) queue.push(next)
    }
  }

  for (const id of nodeIds) {
    if (!layer.has(id)) layer.set(id, 0)
  }
  return layer
}

function polishGoal(goal: string, kind: string, label: string, m: Messages): string {
  const trimmed = goal.trim()
  if (!trimmed) {
    const kindLabel = m.kinds[kind as keyof typeof m.kinds] ?? kind
    return `${m.defaultNodeGoal} (${kindLabel}: ${label})`
  }
  if (/[.!?。！？]$/.test(trimmed)) return trimmed
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(trimmed)) return `${trimmed}。`
  return `${trimmed}.`
}
