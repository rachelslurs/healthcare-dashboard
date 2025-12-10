import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../ui/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../ui/navbar'
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
  UserIcon,
} from '@heroicons/react/16/solid'

export default function Header() {
  const handleShareFeedback = () => {
    console.log('Share feedback clicked')
  }

  const handleSignOut = () => {
    console.log('Sign out clicked')
  }

  return (
    <Navbar>
      <NavbarSpacer />
      <NavbarSection>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <UserIcon />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom end">
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
      </NavbarSection>
    </Navbar>
  )
}
