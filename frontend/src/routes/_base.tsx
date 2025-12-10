import { Outlet, createFileRoute } from '@tanstack/react-router'
import MainLayout from '../components/layout/MainLayout'

export const Route = createFileRoute('/_base')({
  component: BaseLayout,
})

function BaseLayout() {
  return <MainLayout />
}
