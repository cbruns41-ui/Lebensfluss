interface MiniChartProps {
  data: number[]
  labels?: string[]
  color?: string
  height?: number
}

export function MiniChart({ data, labels, color = '#10b981', height = 80 }: MiniChartProps) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-500 min-h-[4px]"
            style={{ height: `${(val / max) * 100}%`, backgroundColor: color, opacity: val > 0 ? 1 : 0.2 }}
          />
          {labels?.[i] && <span className="text-[9px] text-faint">{labels[i]}</span>}
        </div>
      ))}
    </div>
  )
}