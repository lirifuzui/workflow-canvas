# Workflow Canvas

**LLM drafts the plan. You rewire the graph. The canvas compiles back into a spec the model can confirm before it runs.**

Workflow Canvas is a small, canvas-first interface for **editable agent plans**. Instead of arguing with a chat about step order, branches, and human gates, you treat the plan like a logic diagram: move nodes, reconnect edges, renumber execution order — then hand a clean JSON intermediate representation (IR) back to the agent for confirmation.

> Chat is a bad UI for structure. Graphs are a bad UI for intent. This project sits in the middle: **intent in, structure out, structure edited, structure confirmed.**

---

## The idea

Modern LLMs and coding agents are good at proposing workflows and plans. They are much worse at the next step: **letting a human surgically change the structure** without rewriting a wall of prose.

The loop this project explores:

```text
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  LLM draft   │ ──► │  Visual canvas  │ ──► │  Compile to IR   │ ──► │ LLM confirm │
│  (nodes/edges)│     │  (you edit)     │     │  (JSON + order)  │     │ / execute   │
└──────────────┘     └─────────────────┘     └──────────────────┘     └─────────────┘
```

### Why this matters

| Approach | Strength | Weakness |
| --- | --- | --- |
| Pure chat plans | Fast to draft | Hard to rewire dependencies; order hides in paragraphs |
| Traditional automation builders (n8n-style) | Powerful execution | Usually **human-first**; agent is optional, not the author |
| Agent graph IDEs (LangGraph canvases, etc.) | Close to runtime | Heavy frameworks; confirmation often secondary to codegen |
| **Workflow Canvas** | Lightweight **plan IR** + visual edit + **confirm gate** | Demo today — not a full production orchestrator |

The distinctive emphasis here is not “yet another node editor.” It is the **bidirectional contract**:

1. The agent may **author** the first graph.
2. The human may **mutate** topology without chatting.
3. Layout (x/y) is **cosmetic**; `kind`, `goal`, and edges are the truth.
4. Before run, the system **compiles** the canvas into a versioned JSON spec + topological `order` / `step` numbers.
5. The agent (or a mock validator) **restates and approves** that spec — or demands fixes.

That “edit the diagram, then make the model swear it understood the diagram” loop is the product thesis.

---

## Features (demo)

- **Visual graph editing** on [React Flow](https://reactflow.dev/)
- **Node kinds**: `start` · `research` · `think` · `tool` · `branch` · `human` · `output`
- **Rewire freely**: drag handles to connect; click an edge to change From/To; drag edge endpoints to reconnect; `Delete` / `Backspace` to remove
- **Execution order**: numbered badges on nodes + an Order strip derived from topology
- **Confirm**: rebuild a clean engineering diagram from your edits (layered layout + step order)
- **Order** (red): skip confirm and animate execution along the topological order
- **Copy prompt**: clipboard export of the compiled JSON for a real LLM
- **Cursor rule**: `.cursor/rules/workflow-canvas.mdc` teaches agents to treat the JSON as IR
- **Multilingual**: No language picker. UI chrome follows the diagram/conversation language (中文 / 日本語 / English). Agents must draft title, labels, and goals in the user’s language — never English-by-default.

### Complex sample plan

A Uxopian-style document **map-reduce** plan (chunk → parallel summarize → combine → quality gate → human review) ships as a second demo:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
# open http://127.0.0.1:5174/?plan=map-reduce
```

Query aliases: `?plan=uxopian` · `?plan=uvp`

Inspired by the public Agentic Plans pattern in [Uxopian AI docs](https://doc.uxopian.com/docs/uxopian-ai/admin/managing_plans/) (fan-out summarize + reduce), expanded with quality/HITL gates for this demo.

---

## Quick start

```bash
git clone https://github.com/lirifuzui/workflow-canvas.git
cd workflow-canvas
npm install
npm run dev
```

Open the URL Vite prints (default `http://127.0.0.1:5173`).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local demo |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |

---

## Compiled spec (IR)

The canvas is a view. The **JSON spec** is the source of truth you would send to an agent.

```json
{
  "version": 1,
  "id": "document-map-reduce-brief",
  "title": "Document Map-Reduce Brief",
  "description": "Split, fan-out summarize, reduce, review, deliver.",
  "order": ["start", "retrieve", "chunk", "sum_a", "sum_b", "combine", "quality", "review", "publish"],
  "nodes": [
    {
      "id": "chunk",
      "kind": "tool",
      "label": "Chunk document",
      "goal": "Split content into ordered chunks[]; publish under output key chunks.",
      "step": 3,
      "position": { "x": 400, "y": 520 }
    }
  ],
  "edges": [
    { "id": "e4", "from": "chunk", "to": "sum_a", "label": "fan-out" }
  ]
}
```

### Semantics vs layout

| Field | Role |
| --- | --- |
| `kind`, `label`, `goal` | What the step means |
| `edges` (+ optional `label`) | Dependencies / branches |
| `order` / `step` | Derived execution sequence (topological) |
| `position` | Human layout only — agents must not invent steps from coordinates |

### Static checks before confirm

- Missing / multiple start nodes  
- Empty goals  
- Self-loops and cycles (DAG required in this demo)  
- Unreachable nodes  
- Missing output (warning)

---

## How to use it with an agent

1. Ask an agent to draft a plan **as this JSON schema** (or start from the built-in sample).
2. Open Workflow Canvas and edit the graph until the Order strip matches your intent.
3. Click **Confirm** to regenerate a clean engineering layout from your edits, or **Order** to run immediately.
4. Use **Copy prompt** when you want a real LLM to review the compiled JSON.

Suggested agent instruction (also encoded in the repo Cursor rule):

> Treat the compiled workflow JSON as the single source of truth. Do not invent steps from node positions. After human edits, restate the plan from JSON and reply APPROVED or NEEDS_FIX with minimal patches. **Respond in the same language as the workflow title/goals (Chinese, Japanese, English, or mixed)—do not force English.**

---

## Project layout

```text
src/
  App.tsx                 # Canvas shell, connect/reconnect, confirm banner
  components/
    WorkflowNode.tsx      # Node chrome + step badge
  lib/
    samples.ts            # Default starter workflow
    docMapReducePlan.ts   # Complex map-reduce demo (?plan=map-reduce)
    workflow.ts           # Compile, validate, topological order, confirm prompt
  types/workflow.ts       # Spec + node types
.cursor/rules/
  workflow-canvas.mdc     # Agent guidance for this IR
```

Stack: **Vite · React 19 · TypeScript · @xyflow/react**

---

## Design principles

1. **IR over screenshots** — What the model sees must be structured, not a picture of the canvas.
2. **Human owns topology** — Reordering and rewiring should not require another 20-message chat.
3. **Confirm is mandatory theater that becomes real** — Restate the plan in plain language against the JSON before tools run.
4. **Stay thin** — Prefer a small plan editor over a full automation platform until the loop is proven.

---

## Status & roadmap

This repository is an **interaction prototype**, not a production orchestrator.

Possible next steps:

- [ ] Stream a live LLM draft into the canvas (SSE / agent tool result)
- [ ] Diff-based updates so regenerations do not wipe human edits
- [ ] Import/export of saved plans; shareable links
- [ ] Real executor adapters (queues, tools, HITL webhooks)
- [ ] Soften DAG rules for intentional retry loops with explicit loop nodes
- [ ] Collaborative multiplayer editing

---

## Related work

Visual agent/workflow builders exist in several forms (automation canvases, LangGraph composers, enterprise agentic-plan UIs, codegen-from-graph tools). Workflow Canvas is intentionally narrower: a **plan IR + confirm loop** for the moment between “the agent proposed steps” and “the agent is allowed to act.”

If you are building a full runtime, you may still want this interaction layer in front of it.

---

## Contributing

Issues and PRs welcome. Keep the IR schema versioned (`version: 1`) and prefer small, reviewable changes that preserve the edit → compile → confirm loop.

---

## License

MIT © Workflow Canvas contributors
