import { Outlet } from '@tanstack/react-router'
import { SidebarLayout } from '../ui/sidebar-layout'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <SidebarLayout navbar={<Header />} sidebar={<Sidebar />}>
      <Outlet />
    </SidebarLayout>
  )
}
