import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useLocale } from '../i18n/useLocale'
import type { NodeKind, RunStatus, WorkflowFlowNode } from '../types/workflow'

export type { WorkflowFlowNode }

const KIND_ACCENT: Record<NodeKind, string> = {
  start: '#1f6f5b',
  research: '#2c5aa0',
  think: '#8a5a17',
  tool: '#0f766e',
  branch: '#9a3412',
  human: '#9f1239',
  output: '#334155',
}

export function WorkflowNode({ data, selected }: NodeProps<WorkflowFlowNode>) {
  const { m } = useLocale()
  const accent = KIND_ACCENT[data.kind]
  const runStatus = (data.runStatus as RunStatus | undefined) ?? 'idle'
  const runLabel = runStatus === 'idle' ? '' : m.runStatus[runStatus]

  return (
    <div
      className={`wf-node ${selected ? 'is-selected' : ''} run-${runStatus}`}
      style={{ ['--accent' as string]: accent }}
    >
      <Handle type="target" position={Position.Left} className="wf-handle" id="in" />
      <div className="wf-node-top">
        {typeof data.step === 'number' ? <span className="wf-step">{data.step}</span> : null}
        <div className="wf-node-chip">{m.kinds[data.kind]}</div>
        {runLabel ? <span className={`wf-run-pill run-${runStatus}`}>{runLabel}</span> : null}
      </div>
      <div className="wf-node-label">{data.label}</div>
      <p className="wf-node-goal">{data.goal || m.emptyGoalPlaceholder}</p>
      <Handle type="source" position={Position.Right} className="wf-handle" id="out" />
    </div>
  )
}
