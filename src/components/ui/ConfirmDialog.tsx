import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Löschen', onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm glass rounded-2xl p-6 slide-up">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Abbrechen</Button>
          <Button variant="danger" className="flex-1" onClick={() => { onConfirm(); onCancel() }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}