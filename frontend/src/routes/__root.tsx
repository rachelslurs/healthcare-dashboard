/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import globalsCss from '@/assets/styles/globals.css?url';

import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import ErrorBoundary from '@/components/errors/error-boundary'

export const rootRoute = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Healthcare Dashboard",
      },
    ],
    links: [
      // Preload critical fonts for performance
      {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/68dd4d10a3ceb8ade9103b41/68dd4d10a3ceb8ade9103b49_PPNeueMontreal-Regular.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/68dd4d10a3ceb8ade9103b41/68dd4d10a3ceb8ade9103b4a_PPNeueMontreal-Medium.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/68dd4d10a3ceb8ade9103b41/68de235a6b8aa7717210022c_RhetorikSerif-Regular.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "https://cdn.prod.website-files.com/68dd4d10a3ceb8ade9103b41/68de235a09e9b6e1b431c689_RhetorikSerif-Medium.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: globalsCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ErrorBoundary>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="bg-ascertain-background">
      <head>
        <HeadContent />
      </head>
      <body className="bg-ascertain-background text-ascertain-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
