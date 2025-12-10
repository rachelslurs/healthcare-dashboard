import * as Headless from '@headlessui/react'
import { Link as TanStackLink } from '@tanstack/react-router'
import React, { forwardRef } from 'react'

/**
 * Link component that integrates TanStack Router with Catalyst UI.
 * 
 * For internal routes, use the `href` prop and it will be converted to TanStack Router's `to` prop.
 * For external links (http://, https://, mailto:, tel:), it will use a regular anchor tag.
 * 
 * @see https://catalyst.tailwindui.com/docs#client-side-router-integration
 * @see https://tanstack.com/router/latest/docs/framework/react/guide/link-options
 */
export const Link = forwardRef(function Link(
  props: { href: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, ...restProps } = props

  // Check if it's an external link
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')

  if (isExternal) {
    // Use regular anchor tag for external links
    return (
      <Headless.DataInteractive>
        <a {...restProps} href={href} ref={ref} />
      </Headless.DataInteractive>
    )
  }

  // Use TanStack Router Link for internal routes
  // Type assertion needed because TanStack Router's `to` prop is strictly typed
  // but we're accepting dynamic href strings from Catalyst components
  // Using 'as string' is safe here since we validate the href is internal at runtime
  // and TanStack Router's 'to' prop accepts string route paths
  return (
    <Headless.DataInteractive>
      <TanStackLink
        {...restProps}
        to={href as string}
        ref={ref}
      />
    </Headless.DataInteractive>
  )
})
