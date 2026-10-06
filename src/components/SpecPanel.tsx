import { useMemo } from 'react'
import type { ConfirmResult, WorkflowSpec } from '../types/workflow'

type Props = {
  spec: WorkflowSpec
  confirm: ConfirmResult | null
  onConfirm: () => void
  onCopyPrompt: () => void
}

export function SpecPanel({ spec, confirm, onConfirm, onCopyPrompt }: Props) {
  const json = useMemo(() => JSON.stringify(spec, null, 2), [spec])

  return (
    <aside className="side-panel">
      <div className="side-block">
        <div className="side-kicker">Compiled spec</div>
        <p className="side-copy">
          The canvas compiles into this JSON. An LLM should treat it as the source of truth.
        </p>
        <pre className="spec-json">{json}</pre>
      </div>

      <div className="side-block">
        <div className="side-kicker">LLM confirm</div>
        <div className="side-actions">
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Confirm with mock LLM
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCopyPrompt}>
            Copy real prompt
          </button>
        </div>

        {confirm && (
          <div className={`confirm-card status-${confirm.status}`}>
            <div className="confirm-status">
              {confirm.status === 'approved' ? 'Approved' : 'Needs fix'}
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
    </aside>
  )
}
