import { Outlet } from '@tanstack/react-router'

import { SidebarLayout } from '../ui/sidebar-layout'

import Header from './header'
import Sidebar from './sidebar'

export default function MainLayout() {
  return (
    <SidebarLayout navbar={<Header />} sidebar={<Sidebar />}>
      <Outlet />
    </SidebarLayout>
  )
}
