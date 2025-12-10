/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import globalsCss from '@/assets/styles/globals.css?url';

import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

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
    links: [{ rel: "stylesheet", href: globalsCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="bg-white lg:bg-zinc-100">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
