import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeKind, WorkflowFlowNode } from '../types/workflow'

export type { WorkflowFlowNode }

const KIND_META: Record<NodeKind, { chip: string; accent: string }> = {
  start: { chip: 'Start', accent: '#1f6f5b' },
  research: { chip: 'Research', accent: '#2c5aa0' },
  think: { chip: 'Think', accent: '#8a5a17' },
  tool: { chip: 'Tool', accent: '#0f766e' },
  branch: { chip: 'Branch', accent: '#9a3412' },
  human: { chip: 'Human', accent: '#9f1239' },
  output: { chip: 'Output', accent: '#334155' },
}

export function WorkflowNode({ data, selected }: NodeProps<WorkflowFlowNode>) {
  const meta = KIND_META[data.kind]

  return (
    <div className={`wf-node ${selected ? 'is-selected' : ''}`} style={{ ['--accent' as string]: meta.accent }}>
      <Handle type="target" position={Position.Left} className="wf-handle" />
      <div className="wf-node-chip">{meta.chip}</div>
      <div className="wf-node-label">{data.label}</div>
      <p className="wf-node-goal">{data.goal || 'Add a goal…'}</p>
      <Handle type="source" position={Position.Right} className="wf-handle" />
    </div>
  )
}
