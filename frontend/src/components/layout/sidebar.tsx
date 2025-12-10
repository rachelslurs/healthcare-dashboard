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
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarHeading,
} from '../ui/sidebar'

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
      <SidebarHeader>
        <img
          src='/ascertain.png'
          alt='Ascertain'
          className='h-6 w-auto max-w-full object-contain'
        />
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
      <SidebarFooter>
        <SidebarSection>
          <Dropdown>
            <DropdownButton as={SidebarItem}>
              <span className='flex min-w-0 items-center gap-3'>
                <span className='min-w-0'>
                  <span className='block truncate text-sm/5 font-medium text-ascertain-foreground'>Rachel</span>
                  <span className='block truncate text-xs/5 font-normal text-neutral-600'>
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
