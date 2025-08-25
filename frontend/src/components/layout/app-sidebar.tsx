import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' variant='sidebar' className="au-sidebar" {...props}>
      <SidebarHeader className="au-sidebar-header">
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className="au-sidebar-content">
        {sidebarData.navGroups.map((group, index) => (
          <div key={group.title}>
            <div className="au-nav-section-header">
              {group.title}
            </div>
            <NavGroup {...group} />
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter className="au-sidebar-footer">
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
