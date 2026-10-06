# Workflow Canvas

Editable agent workflows: an LLM drafts a plan as a graph, you rewire nodes and edges like a logic diagram, then the canvas compiles back into a JSON spec the model can confirm before running.

## Why

Chat is bad at structural edits. A canvas makes order, branches, and human gates visible — then compiles to a single source of truth for the agent.

## Demo features

- Load sample LLM drafts
- Drag nodes, edit goals, reconnect edges
- Live compile to versioned JSON
- Static validation (cycles, empty goals, unreachable nodes)
- Mock LLM confirmation + copyable real prompt

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Spec shape

```json
{
  "version": 1,
  "id": "competitor-pricing-brief",
  "title": "Competitor Pricing Brief",
  "description": "...",
  "nodes": [
    {
      "id": "research",
      "kind": "research",
      "label": "Gather sources",
      "goal": "Collect public pricing pages...",
      "position": { "x": 320, "y": 80 }
    }
  ],
  "edges": [{ "id": "e1", "from": "start", "to": "research" }]
}
```

Positions are layout-only. Semantics are `kind`, `goal`, and edges.

## Cursor

This repo includes a Cursor rule under `.cursor/rules/` so agents treat the compiled JSON as the workflow IR when helping you edit or execute plans.

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Local demo server         |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Serve the production build |

## License

MIT
