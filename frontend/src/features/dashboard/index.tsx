import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AUShowcase } from '@/components/au-showcase'

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main className="p-0">
        <AUShowcase />
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Scholarships',
    href: '/scholarships',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Applications',
    href: '/applications',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Documents',
    href: '/documents',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Support',
    href: '/help-center',
    isActive: false,
    disabled: false,
  },
]
