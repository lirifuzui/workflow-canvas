import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WorkflowNode } from './components/WorkflowNode'
import { useLocale } from './i18n/useLocale'
import { DOC_MAP_REDUCE_PLANS } from './lib/docMapReducePlan'
import { detectLocaleFromText } from './lib/language'
import { refineEngineeringDiagram } from './lib/refineDiagram'
import { INITIAL_WORKFLOWS } from './lib/samples'
import { confirmWorkflow, graphToSpec, topologicalOrderIds } from './lib/workflow'
import type { ConfirmResult, NodeKind, RunStatus, WorkflowFlowNode, WorkflowNodeData } from './types/workflow'
import type { Locale } from './i18n/locale'

const nodeTypes = { workflow: WorkflowNode }

function resolveInitialWorkflow(locale: Locale) {
  const plan = new URLSearchParams(window.location.search).get('plan')
  if (plan === 'map-reduce' || plan === 'uxopian' || plan === 'uvp') {
    return DOC_MAP_REDUCE_PLANS[locale]
  }
  return INITIAL_WORKFLOWS[locale]
}

const KIND_OPTIONS: NodeKind[] = [
  'start',
  'research',
  'think',
  'tool',
  'branch',
  'human',
  'output',
]

const defaultEdgeOptions: Partial<Edge> = {
  type: 'smoothstep',
  animated: true,
  reconnectable: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: '#1f6f5b',
  },
  style: { stroke: '#1f6f5b', strokeWidth: 2.25 },
}

function withEdgeDefaults(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...defaultEdgeOptions,
    ...edge,
    markerEnd: edge.markerEnd ?? defaultEdgeOptions.markerEnd,
    style: { ...defaultEdgeOptions.style, ...edge.style },
  }))
}

function CanvasApp() {
  const { locale, setLocale, m } = useLocale()
  const initial = useMemo(() => resolveInitialWorkflow(locale), [])
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(withEdgeDefaults(initial.edges))
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmResult | null>(null)
  const [refineNote, setRefineNote] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [ordering, setOrdering] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const sourceNote =
    'sourceNote' in initial && typeof initial.sourceNote === 'string' ? initial.sourceNote : null
  const { fitView, screenToFlowPosition } = useReactFlow()
  const orderTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (orderTimerRef.current) window.clearTimeout(orderTimerRef.current)
    }
  }, [])

  // UI language follows diagram/conversation text — no manual switcher.
  useEffect(() => {
    const guessed = detectLocaleFromText(
      title,
      description,
      ...nodes.map((node) => `${node.data.label}\n${node.data.goal}`),
    )
    if (guessed && guessed !== locale) {
      setLocale(guessed)
    }
  }, [title, description, nodes, locale, setLocale])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  )

  const orderIds = useMemo(
    () =>
      topologicalOrderIds(
        nodes.map((n) => n.id),
        edges.map((e) => ({ from: e.source, to: e.target })),
      ),
    [nodes, edges],
  )

  const stepMap = useMemo(() => {
    const map = new Map<string, number>()
    orderIds.forEach((id, index) => map.set(id, index + 1))
    return map
  }, [orderIds])

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, step: stepMap.get(node.id) },
      })),
    [nodes, stepMap],
  )

  const orderLabels = useMemo(
    () =>
      orderIds.map((id) => {
        const node = nodes.find((n) => n.id === id)
        const step = stepMap.get(id)
        return { id, step, label: node?.data.label ?? id }
      }),
    [orderIds, nodes, stepMap],
  )

  const spec = useMemo(
    () => graphToSpec(title, description, nodes as Node<WorkflowNodeData>[], edges),
    [title, description, nodes, edges],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => fitView({ padding: 0.28, duration: 400 }), 40)
    return () => window.clearTimeout(timer)
  }, [fitView])

  const bump = () => {
    setConfirm(null)
    setRefineNote(null)
  }

  const setRunStatuses = (statuses: Map<string, RunStatus> | 'clear') => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: {
          ...node.data,
          runStatus: statuses === 'clear' ? 'idle' : (statuses.get(node.id) ?? 'idle'),
        },
      })),
    )
  }

  const stopOrdering = () => {
    if (orderTimerRef.current) {
      window.clearTimeout(orderTimerRef.current)
      orderTimerRef.current = null
    }
    setOrdering(false)
  }

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            ...defaultEdgeOptions,
            id: `e_${connection.source}_${connection.target}_${Date.now().toString(36)}`,
          },
          eds,
        ),
      )
      bump()
    },
    [setEdges],
  )

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds))
      bump()
    },
    [setEdges],
  )

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const source = 'source' in connection ? connection.source : null
    const target = 'target' in connection ? connection.target : null
    return Boolean(source && target && source !== target)
  }, [])

  const updateSelected = (patch: Partial<WorkflowNodeData>) => {
    if (!selectedNodeId) return
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId ? { ...node, data: { ...node.data, ...patch } } : node,
      ),
    )
    bump()
  }

  const updateSelectedEdge = (patch: Partial<Pick<Edge, 'source' | 'target' | 'label'>>) => {
    if (!selectedEdgeId) return
    setEdges((current) =>
      current.map((edge) => (edge.id === selectedEdgeId ? { ...edge, ...patch } : edge)),
    )
    bump()
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
        label: kind === 'human' ? m.humanGateLabel : m.kinds[kind],
        goal: m.defaultNodeGoal,
      },
    }
    setNodes((current) => [...current, node])
    setSelectedNodeId(id)
    setSelectedEdgeId(null)
    bump()
  }

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId))
    setEdges((current) =>
      current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId),
    )
    setSelectedNodeId(null)
    bump()
  }

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return
    setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId))
    setSelectedEdgeId(null)
    bump()
  }

  const handleConfirm = () => {
    stopOrdering()
    setRunStatuses('clear')
    const checked = confirmWorkflow(spec, m)
    const issues = checked.issues.filter((i) => i.level === 'error')
    if (issues.length > 0) {
      setRefineNote(null)
      setConfirm(checked)
      setToast(m.toastFixBeforeConfirm)
      window.setTimeout(() => setToast(null), 2000)
      return
    }

    const refined = refineEngineeringDiagram(nodes, edges, revision, m)
    setRevision(refined.revision)
    setNodes(refined.nodes as WorkflowFlowNode[])
    setEdges(withEdgeDefaults(refined.edges))
    setConfirm(null)
    setRefineNote(refined.summary)
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    window.setTimeout(() => fitView({ padding: 0.28, duration: 500 }), 40)
  }

  const handleOrder = () => {
    stopOrdering()
    setConfirm(null)
    setRefineNote(null)

    const checked = confirmWorkflow(spec, m)
    const issues = checked.issues.filter((i) => i.level === 'error')
    if (issues.length > 0) {
      setConfirm(checked)
      setToast(m.toastFixBeforeOrder)
      window.setTimeout(() => setToast(null), 2000)
      return
    }

    const sequence = [...orderIds]
    const statusMap = new Map<string, RunStatus>(sequence.map((id) => [id, 'pending']))
    setRunStatuses(statusMap)
    setOrdering(true)

    let index = 0
    const tick = () => {
      if (index > 0) {
        statusMap.set(sequence[index - 1], 'done')
      }
      if (index >= sequence.length) {
        setRunStatuses(new Map(statusMap))
        setOrdering(false)
        orderTimerRef.current = null
        setToast(m.toastOrderComplete)
        window.setTimeout(() => setToast(null), 1800)
        return
      }
      statusMap.set(sequence[index], 'running')
      setRunStatuses(new Map(statusMap))
      setSelectedNodeId(sequence[index])
      setSelectedEdgeId(null)
      index += 1
      orderTimerRef.current = window.setTimeout(tick, 900)
    }
    tick()
  }

  const copyPrompt = async () => {
    const result = confirmWorkflow(spec, m)
    await navigator.clipboard.writeText(result.llmPrompt)
    setToast(m.toastCopied)
    window.setTimeout(() => setToast(null), 1800)
  }

  const editing = Boolean(selectedNode || selectedEdge)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">Workflow Canvas</p>
            <p className="brand-tag">
              {m.brandTag}
              {revision > 0 ? m.brandTagRevision(revision) : ''}
            </p>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="btn btn-secondary" onClick={() => addNode('think')}>
            {m.addNode}
          </button>
          <button type="button" className="btn btn-ghost" onClick={copyPrompt}>
            {m.copyPrompt}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={ordering}>
            {m.confirm}
          </button>
          <button
            type="button"
            className="btn btn-order"
            onClick={ordering ? stopOrdering : handleOrder}
          >
            {ordering ? m.stop : m.order}
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
                bump()
              }}
              aria-label={m.workflowTitle}
            />
            <input
              className="desc-input"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                bump()
              }}
              aria-label={m.workflowDescription}
            />
            {sourceNote ? <p className="source-note">{sourceNote}</p> : null}
            <div className="order-bar" aria-label={m.orderStrip}>
              <span className="order-kicker">{m.orderStrip}</span>
              <div className="order-steps">
                {orderLabels.map((item, index) => (
                  <span key={item.id} className="order-chip">
                    {index > 0 ? (
                      <span className="order-arrow" aria-hidden>
                        →
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={`order-pill ${selectedNodeId === item.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedNodeId(item.id)
                        setSelectedEdgeId(null)
                      }}
                    >
                      <strong>{item.step}</strong> {item.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="canvas-stage">
            <ReactFlow
              nodes={displayNodes}
              edges={edges}
              onNodesChange={(changes) => {
                onNodesChange(changes)
                bump()
              }}
              onEdgesChange={(changes) => {
                onEdgesChange(changes)
                bump()
              }}
              onConnect={onConnect}
              onReconnect={onReconnect}
              isValidConnection={isValidConnection}
              edgesReconnectable
              reconnectRadius={28}
              connectionMode={ConnectionMode.Loose}
              connectionRadius={36}
              defaultEdgeOptions={defaultEdgeOptions}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id)
                setSelectedEdgeId(null)
              }}
              onEdgeClick={(_, edge) => {
                setSelectedEdgeId(edge.id)
                setSelectedNodeId(null)
              }}
              onPaneClick={() => {
                setSelectedNodeId(null)
                setSelectedEdgeId(null)
              }}
              deleteKeyCode={['Backspace', 'Delete']}
              fitView
            >
              <Background gap={22} size={1} color="rgba(28, 39, 51, 0.08)" />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable />
            </ReactFlow>

            {refineNote && (
              <div className="confirm-banner status-approved">
                <div className="confirm-banner-head">
                  <span className="confirm-status">{m.newDiagram}</span>
                  <button
                    type="button"
                    className="btn btn-ghost confirm-dismiss"
                    onClick={() => setRefineNote(null)}
                  >
                    {m.dismiss}
                  </button>
                </div>
                <p>{refineNote}</p>
              </div>
            )}

            {confirm && (
              <div className={`confirm-banner status-${confirm.status}`}>
                <div className="confirm-banner-head">
                  <span className="confirm-status">
                    {confirm.status === 'approved' ? m.approved : m.needsFix}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost confirm-dismiss"
                    onClick={() => setConfirm(null)}
                  >
                    {m.dismiss}
                  </button>
                </div>
                <p>{confirm.summary}</p>
                {confirm.issues.length > 0 && (
                  <ul className="issue-list">
                    {confirm.issues.map((issue, index) => (
                      <li key={`${issue.message}-${index}`} className={`issue-${issue.level}`}>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {editing && (
            <div className="inspector is-open">
              {selectedNode ? (
                <>
                  <div className="inspector-head">
                    <span>
                      {m.editNode}
                      {stepMap.has(selectedNode.id) ? ` · ${stepMap.get(selectedNode.id)}` : ''}
                    </span>
                    <button type="button" className="btn btn-danger" onClick={deleteSelectedNode}>
                      {m.delete}
                    </button>
                  </div>
                  <label>
                    {m.kind}
                    <select
                      value={selectedNode.data.kind}
                      onChange={(event) => updateSelected({ kind: event.target.value as NodeKind })}
                    >
                      {KIND_OPTIONS.map((kind) => (
                        <option key={kind} value={kind}>
                          {m.kinds[kind]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {m.label}
                    <input
                      value={selectedNode.data.label}
                      onChange={(event) => updateSelected({ label: event.target.value })}
                    />
                  </label>
                  <label>
                    {m.goal}
                    <textarea
                      rows={3}
                      value={selectedNode.data.goal}
                      onChange={(event) => updateSelected({ goal: event.target.value })}
                    />
                  </label>
                </>
              ) : selectedEdge ? (
                <>
                  <div className="inspector-head">
                    <span>{m.editConnection}</span>
                    <button type="button" className="btn btn-danger" onClick={deleteSelectedEdge}>
                      {m.delete}
                    </button>
                  </div>
                  <label>
                    {m.from}
                    <select
                      value={selectedEdge.source}
                      onChange={(event) => updateSelectedEdge({ source: event.target.value })}
                    >
                      {nodes.map((node) => (
                        <option
                          key={node.id}
                          value={node.id}
                          disabled={node.id === selectedEdge.target}
                        >
                          {(stepMap.get(node.id) ?? '?') + '. ' + node.data.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {m.to}
                    <select
                      value={selectedEdge.target}
                      onChange={(event) => updateSelectedEdge({ target: event.target.value })}
                    >
                      {nodes.map((node) => (
                        <option
                          key={node.id}
                          value={node.id}
                          disabled={node.id === selectedEdge.source}
                        >
                          {(stepMap.get(node.id) ?? '?') + '. ' + node.data.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {m.edgeLabel}
                    <input
                      value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
                      placeholder={m.edgeLabelPlaceholder}
                      onChange={(event) =>
                        updateSelectedEdge({ label: event.target.value || undefined })
                      }
                    />
                  </label>
                </>
              ) : null}
            </div>
          )}
        </section>
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
