import type React from 'react'

interface FormPageLayoutProps {
  header: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
  maxWidth?: string
}

export default function FormPageLayout({
  header,
  children,
  footer,
  maxWidth = 'max-w-4xl',
}: FormPageLayoutProps) {
  return (
    <div className={`${maxWidth} mx-auto flex h-full min-h-0 flex-col`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 -mx-4 lg:-mx-10 px-4 lg:px-10 py-4 mb-6">
        {header}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-8 pb-6">
          {children}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-zinc-200 -mx-4 lg:-mx-10 px-4 lg:px-10 py-4 mt-6">
        {footer}
      </div>
    </div>
  )
}

