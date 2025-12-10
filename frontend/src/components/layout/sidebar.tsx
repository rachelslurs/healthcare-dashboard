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
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
} from '@heroicons/react/16/solid'
import {
  ChartBarIcon,
  ChevronUpIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'

export default function Sidebar() {
  const handleShareFeedback = () => {
    console.log('Share feedback clicked')
  }

  const handleSignOut = () => {
    console.log('Sign out clicked')
  }

  return (
    <SidebarComponent>
      <SidebarHeader>
        <SidebarHeading className="text-xl">Ascertain</SidebarHeading>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/">
            <ChartBarIcon />
            <SidebarLabel>Activity</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/patients">
            <UserGroupIcon />
            <SidebarLabel>Patients</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarSection>
          <Dropdown>
            <DropdownButton as={SidebarItem}>
              <span className="flex min-w-0 items-center gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">Rachel</span>
                  <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                    rachel@example.com
                  </span>
                </span>
              </span>
              <ChevronUpIcon />
            </DropdownButton>
            <DropdownMenu className="min-w-64" anchor="top start">
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
