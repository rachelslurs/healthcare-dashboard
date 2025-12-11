import { useLocation } from '@tanstack/react-router'
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
} from '@heroicons/react/16/solid'
import {
  ChartBarIcon,
  ChevronUpIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'

import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../ui/dropdown'
import {
  Sidebar as SidebarComponent,
  SidebarBody,
  SidebarFooter,
  SidebarHeading,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarHeadingItem,
} from '../ui/sidebar'
import LoadingBrand from '../feedback/loading-brand'

export default function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname

  const handleShareFeedback = () => {
    console.log('Share feedback clicked')
  }

  const handleSignOut = () => {
    console.log('Sign out clicked')
  }

  return (
    <SidebarComponent>
      <SidebarHeader className='border-none px-2 py-2.5'>
        <SidebarHeading className='flex items-center my-4'>
          <img
            src='/logo.png'
            alt=''
            className='h-5 w-auto object-contain'
            aria-hidden='true'
            data-slot='icon'
          />
        </SidebarHeading>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href='/' current={pathname === '/'}>
            <ChartBarIcon />
            <SidebarLabel>Activities</SidebarLabel>
          </SidebarItem>
          <SidebarItem href='/patients' current={pathname === '/patients' || pathname.startsWith('/patients/')}>
            <UserGroupIcon />
            <SidebarLabel>Patients</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter className='border-none'>
        <SidebarSection>
          <Dropdown>
            <DropdownButton as={SidebarItem}>
              <span className='flex min-w-0 items-center gap-3'>
                <span className='min-w-0'>
                  <span className='block truncate text-sm/5 font-medium '>Rachel</span>
                  <span className='block truncate text-xs/5 font-normal'>
                    rachel@example.com
                  </span>
                </span>
              </span>
              <ChevronUpIcon />
            </DropdownButton>
            <DropdownMenu className='min-w-64' anchor='top start'>
              <DropdownItem onClick={handleShareFeedback}>
                <LightBulbIcon />
                <DropdownLabel>Share feedback</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleSignOut}>
                <ArrowRightStartOnRectangleIcon />
                <DropdownLabel>Sign out</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </SidebarSection>
      </SidebarFooter>
    </SidebarComponent>
  )
}
