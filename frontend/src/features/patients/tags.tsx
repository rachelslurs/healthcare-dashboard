interface TagProps {
  items: string[]
  onRemove?: (index: number) => void
  color?: 'blue' | 'purple'
  itemLabel?: (item: string) => string
  className?: string
}

export default function Tags({ items, onRemove, color = 'blue', itemLabel, className }: TagProps) {
  if (items.length === 0) return null

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-700',
      hoverBg: 'hover:bg-blue-500/25',
      iconText: 'text-blue-700',
      focusOutline: 'focus:outline-blue-500',
    },
    purple: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-700',
      hoverBg: 'hover:bg-purple-500/25',
      iconText: 'text-purple-700',
      focusOutline: 'focus:outline-purple-500',
    },
  }

  const classes = colorClasses[color]
  const isClickable = !!onRemove
  const baseClasses = `inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 ${classes.bg} ${classes.text} ${isClickable ? `${classes.hoverBg} focus:outline-2 focus:outline-offset-2 ${classes.focusOutline} transition-all` : ''}`

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {items.map((item, index) => {
        const content = (
          <>
            <span>{item}</span>
            {isClickable && (
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-white ${classes.iconText} text-xs leading-none`}>
                ×
              </span>
            )}
          </>
        )

        if (isClickable) {
          return (
            <button
              key={index}
              type='button'
              onClick={() => onRemove!(index)}
              className={baseClasses}
              aria-label={itemLabel ? itemLabel(item) : `Remove ${item}`}
            >
              {content}
            </button>
          )
        }

        return (
          <span key={index} className={baseClasses}>
            {content}
          </span>
        )
      })}
    </div>
  )
}
