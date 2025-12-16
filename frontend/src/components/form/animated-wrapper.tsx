import * as Headless from '@headlessui/react'
import type React from 'react'

export interface AnimatedWrapperProps {
  show: boolean
  children: React.ReactNode
  maxHeight?: string
}

function AnimatedWrapper({
  show,
  children,
  maxHeight = 'max-h-[100px]',
}: AnimatedWrapperProps) {
  return (
    <Headless.Transition
      show={show}
      enter='transition-all duration-500 ease-out'
      enterFrom='max-h-0 translate-y-0 opacity-0'
      enterTo={`${maxHeight} translate-y-minus-full opacity-100`}
      leave='transition-all duration-300 ease-in'
      leaveFrom={`${maxHeight} translate-y-minus-full opacity-100`}
      leaveTo='max-h-0 translate-y-0 opacity-0'
    >
      <div className='overflow-hidden will-change-[max-height,transform]'>{children}</div>
    </Headless.Transition>
  )
}


export default AnimatedWrapper