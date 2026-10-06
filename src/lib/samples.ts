import type { Edge } from '@xyflow/react'
import type { WorkflowFlowNode } from '../types/workflow'

export type SampleWorkflow = {
  title: string
  description: string
  nodes: WorkflowFlowNode[]
  edges: Edge[]
}

export const SAMPLE_WORKFLOWS: SampleWorkflow[] = [
  {
    title: 'Competitor Pricing Brief',
    description: 'Research competitors, normalize pricing signals, then draft a short brief for human review.',
    nodes: [
      {
        id: 'start',
        type: 'workflow',
        position: { x: 80, y: 180 },
        data: {
          kind: 'start',
          label: 'Start',
          goal: 'Accept product category and market region as inputs.',
        },
      },
      {
        id: 'research',
        type: 'workflow',
        position: { x: 320, y: 80 },
        data: {
          kind: 'research',
          label: 'Gather sources',
          goal: 'Collect public pricing pages and launch notes for top 5 competitors.',
        },
      },
      {
        id: 'normalize',
        type: 'workflow',
        position: { x: 320, y: 280 },
        data: {
          kind: 'tool',
          label: 'Normalize table',
          goal: 'Convert findings into a comparable table: plan, price, billing unit, caveats.',
        },
      },
      {
        id: 'draft',
        type: 'workflow',
        position: { x: 600, y: 180 },
        data: {
          kind: 'think',
          label: 'Draft brief',
          goal: 'Write a one-page brief with patterns, outliers, and open questions.',
        },
      },
      {
        id: 'review',
        type: 'workflow',
        position: { x: 860, y: 180 },
        data: {
          kind: 'human',
          label: 'Human review',
          goal: 'Pause for the user to approve tone and claims before delivery.',
        },
      },
      {
        id: 'output',
        type: 'workflow',
        position: { x: 1120, y: 180 },
        data: {
          kind: 'output',
          label: 'Deliver',
          goal: 'Return the approved brief as markdown.',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'research' },
      { id: 'e2', source: 'start', target: 'normalize' },
      { id: 'e3', source: 'research', target: 'draft' },
      { id: 'e4', source: 'normalize', target: 'draft' },
      { id: 'e5', source: 'draft', target: 'review' },
      { id: 'e6', source: 'review', target: 'output' },
    ],
  },
  {
    title: 'Bug Triage Loop',
    description: 'Reproduce a report, isolate likely cause, propose a fix path, and stop for approval.',
    nodes: [
      {
        id: 'start',
        type: 'workflow',
        position: { x: 60, y: 160 },
        data: { kind: 'start', label: 'Start', goal: 'Ingest bug report and reproduction notes.' },
      },
      {
        id: 'repro',
        type: 'workflow',
        position: { x: 300, y: 160 },
        data: { kind: 'tool', label: 'Reproduce', goal: 'Attempt reproduction and capture failing signal.' },
      },
      {
        id: 'branch',
        type: 'workflow',
        position: { x: 540, y: 160 },
        data: {
          kind: 'branch',
          label: 'Repro?',
          goal: 'Branch on whether the bug was reproduced.',
        },
      },
      {
        id: 'isolate',
        type: 'workflow',
        position: { x: 780, y: 40 },
        data: {
          kind: 'think',
          label: 'Isolate cause',
          goal: 'Narrow to the smallest failing component and cite evidence.',
        },
      },
      {
        id: 'ask',
        type: 'workflow',
        position: { x: 780, y: 280 },
        data: {
          kind: 'human',
          label: 'Ask for clues',
          goal: 'Request missing logs or environment details from the user.',
        },
      },
      {
        id: 'output',
        type: 'workflow',
        position: { x: 1040, y: 160 },
        data: {
          kind: 'output',
          label: 'Triage note',
          goal: 'Publish a triage note with next actions.',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'repro' },
      { id: 'e2', source: 'repro', target: 'branch' },
      { id: 'e3', source: 'branch', target: 'isolate', label: 'yes' },
      { id: 'e4', source: 'branch', target: 'ask', label: 'no' },
      { id: 'e5', source: 'isolate', target: 'output' },
      { id: 'e6', source: 'ask', target: 'output' },
    ],
  },
]
