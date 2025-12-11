import clsx from 'clsx'

export function DescriptionList({ className, ...props }: React.ComponentPropsWithoutRef<'dl'>) {
  return (
    <dl
      {...props}
      className={clsx(
        className,
        'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6 sm:items-center'
      )}
    />
  )
}

export function DescriptionTerm({ className, ...props }: React.ComponentPropsWithoutRef<'dt'>) {
  return (
    <dt
      {...props}
      className={clsx(
        className,
        'col-start-1 border-t border-neutral-950/5 py-1.5 text-base/6 text-neutral-500 first:border-none sm:border-t sm:border-neutral-950/5 sm:py-1.5 sm:text-sm/6 sm:col-start-1'
      )}
    />
  )
}

export function DescriptionDetails({ className, ...props }: React.ComponentPropsWithoutRef<'dd'>) {
  return (
    <dd
      {...props}
      className={clsx(
        className,
        'py-1.5 text-base/6 text-neutral-950 sm:border-t sm:border-neutral-950/5 sm:py-1.5 sm:text-sm/6 sm:nth-2:border-none sm:col-start-2 min-w-0 max-w-full overflow-hidden'
      )}
    />
  )
}
