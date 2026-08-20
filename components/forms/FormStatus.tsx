import { CheckCircle2, AlertCircle } from 'lucide-react'

export type Status = { type: 'success' | 'error'; message: string } | null

export function FormStatus({ status }: { status: Status }) {
  if (!status) return null

  const isSuccess = status.type === 'success'

  return (
    <div
      className={`form__status ${isSuccess ? 'form__status--success' : 'form__status--error'}`}
      role="status"
      aria-live="polite"
    >
      <span className="form__status-icon">
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </span>
      <span>{status.message}</span>
    </div>
  )
}
