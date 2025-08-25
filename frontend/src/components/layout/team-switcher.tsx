import * as React from 'react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='hover:bg-transparent cursor-default p-3 h-auto'
        >
          <div className='flex aspect-square size-10 items-center justify-center'>
            <img 
              src="/images/au-logo.jpg" 
              alt="Africa University" 
              className='size-10 object-contain'
            />
          </div>
          <div className='grid flex-1 text-left leading-tight'>
            <span className='truncate font-bold text-white text-base'>
              {activeTeam.name}
            </span>
            <span className='truncate text-xs text-white/80'>{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
