// src/components/ui/loading-spinner.tsx
import { type HTMLAttributes } from "react"
import clsx from 'clsx'

interface LoadingBrandProps extends HTMLAttributes<SVGElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

function LoadingBrand({
  size = "md",
  className,
  ...props
}: LoadingBrandProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 348.75 374.999991"
      className={clsx(sizeClasses[size], className)}
      {...props}
    >
      {/* Top part */}
      <path
        fill="currentColor"
        className="animate-gradient-color origin-center transform-origin-center"
        d="M 6.75 34.355469 L 6.75 67.363281 L 64.933594 106.136719 C 96.9375 127.460938 127.476562 146.894531 132.804688 149.324219 C 155.285156 159.566406 153.144531 159.375 251.925781 160.019531 L 342.210938 160.609375 L 342.210938 104.261719 L 261.660156 104.261719 C 173.796875 104.261719 171.074219 104.027344 150.40625 94.691406 C 145.109375 92.296875 111.523438 70.859375 75.769531 47.050781 C 40.015625 23.242188 9.859375 3.21875 8.757812 2.554688 C 7.175781 1.605469 6.75 8.375 6.75 34.355469"
      />
      {/* Bottom part */}
      <path
        fill="currentColor"
        className="animate-gradient-color origin-center transform-origin-center"
        d="M 155.21875 217.394531 C 132.1875 223.621094 130.796875 224.421875 53.652344 276.003906 L 6.839844 307.300781 L 6.796875 340.679688 L 6.75 374.058594 L 72.3125 330 C 141.511719 283.492188 146.988281 280.191406 164.851562 274.214844 C 175.964844 270.496094 176.988281 270.449219 259.148438 269.941406 L 342.210938 269.421875 L 342.210938 215.011719 L 252.726562 215.117188 C 182.832031 215.199219 161.488281 215.699219 155.21875 217.394531"
      />
    </svg>
  )
}

export default LoadingBrand