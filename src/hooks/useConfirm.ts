import { useState, useCallback } from 'react'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
}

export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => setOpts(options), [])
  const cancel = useCallback(() => setOpts(null), [])

  return { confirm, cancel, opts }
}