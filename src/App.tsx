import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SpecPanel } from './components/SpecPanel'
import { WorkflowNode } from './components/WorkflowNode'
import { SAMPLE_WORKFLOWS } from './lib/samples'
import { confirmWorkflow, graphToSpec } from './lib/workflow'
import type { ConfirmResult, NodeKind, WorkflowFlowNode, WorkflowNodeData } from './types/workflow'

const nodeTypes = { workflow: WorkflowNode }

const KIND_OPTIONS: NodeKind[] = [
  'start',
  'research',
  'think',
  'tool',
  'branch',
  'human',
  'output',
]

function CanvasApp() {
  const initial = SAMPLE_WORKFLOWS[0]
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const { fitView, screenToFlowPosition } = useReactFlow()

  const selected = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const spec = useMemo(
    () => graphToSpec(title, description, nodes as Node<WorkflowNodeData>[], edges),
    [title, description, nodes, edges],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => fitView({ padding: 0.18, duration: 400 }), 40)
    return () => window.clearTimeout(timer)
  }, [fitView])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
      setConfirm(null)
    },
    [setEdges],
  )

  const loadSample = (index: number) => {
    const sample = SAMPLE_WORKFLOWS[index]
    setTitle(sample.title)
    setDescription(sample.description)
    setNodes(sample.nodes)
    setEdges(sample.edges)
    setSelectedId(null)
    setConfirm(null)
    window.setTimeout(() => fitView({ padding: 0.18, duration: 500 }), 30)
  }

  const updateSelected = (patch: Partial<WorkflowNodeData>) => {
    if (!selectedId) return
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedId ? { ...node, data: { ...node.data, ...patch } } : node,
      ),
    )
    setConfirm(null)
  }

  const addNode = (kind: NodeKind = 'think') => {
    const id = `n_${Date.now().toString(36)}`
    const position = screenToFlowPosition({
      x: window.innerWidth * 0.42,
      y: window.innerHeight * 0.42,
    })
    const node: WorkflowFlowNode = {
      id,
      type: 'workflow',
      position,
      data: {
        kind,
        label: kind === 'human' ? 'Human gate' : kind[0].toUpperCase() + kind.slice(1),
        goal: 'Describe what this step should accomplish.',
      },
    }
    setNodes((current) => [...current, node])
    setSelectedId(id)
    setConfirm(null)
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setNodes((current) => current.filter((node) => node.id !== selectedId))
    setEdges((current) =>
      current.filter((edge) => edge.source !== selectedId && edge.target !== selectedId),
    )
    setSelectedId(null)
    setConfirm(null)
  }

  const handleConfirm = () => {
    setConfirm(confirmWorkflow(spec))
  }

  const copyPrompt = async () => {
    const result = confirm ?? confirmWorkflow(spec)
    setConfirm(result)
    await navigator.clipboard.writeText(result.llmPrompt)
    setToast('Confirmation prompt copied')
    window.setTimeout(() => setToast(null), 1800)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">Workflow Canvas</p>
            <p className="brand-tag">LLM drafts the graph. You edit it. Spec goes back for confirm.</p>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="btn btn-ghost" onClick={() => loadSample(0)}>
            Draft A
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => loadSample(1)}>
            Draft B
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => addNode('think')}>
            Add node
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </header>

      <div className="workspace">
        <section className="canvas-pane">
          <div className="meta-bar">
            <input
              className="title-input"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setConfirm(null)
              }}
              aria-label="Workflow title"
            />
            <input
              className="desc-input"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setConfirm(null)
              }}
              aria-label="Workflow description"
            />
          </div>

          <div className="canvas-stage">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                onNodesChange(changes)
                setConfirm(null)
              }}
              onEdgesChange={(changes) => {
                onEdgesChange(changes)
                setConfirm(null)
              }}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
              fitView
            >
              <Background gap={22} size={1} color="rgba(28, 39, 51, 0.08)" />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable />
            </ReactFlow>
          </div>

          <div className={`inspector ${selected ? 'is-open' : ''}`}>
            {selected ? (
              <>
                <div className="inspector-head">
                  <span>Edit node</span>
                  <button type="button" className="btn btn-danger" onClick={deleteSelected}>
                    Delete
                  </button>
                </div>
                <label>
                  Kind
                  <select
                    value={selected.data.kind}
                    onChange={(event) => updateSelected({ kind: event.target.value as NodeKind })}
                  >
                    {KIND_OPTIONS.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Label
                  <input
                    value={selected.data.label}
                    onChange={(event) => updateSelected({ label: event.target.value })}
                  />
                </label>
                <label>
                  Goal
                  <textarea
                    rows={4}
                    value={selected.data.goal}
                    onChange={(event) => updateSelected({ goal: event.target.value })}
                  />
                </label>
                <p className="inspector-hint">Drag handles to reconnect. Layout is visual only — semantics live in JSON.</p>
              </>
            ) : (
              <p className="inspector-empty">Select a node to edit its goal, or drag between handles to rewire the plan.</p>
            )}
          </div>
        </section>

        <SpecPanel
          spec={spec}
          confirm={confirm}
          onConfirm={handleConfirm}
          onCopyPrompt={copyPrompt}
        />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasApp />
    </ReactFlowProvider>
  )
}
