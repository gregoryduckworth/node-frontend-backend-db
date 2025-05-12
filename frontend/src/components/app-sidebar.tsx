import * as React from 'react';
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { COMPANY } from '@/config/settings';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { firstName, lastName, email } = useAuthStore();

  const data = React.useMemo(
    () => ({
      user: {
        firstName,
        lastName,
        email: email || 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
      },
      navMain: [
        {
          title: t('sidebar.playground'),
          url: '#',
          icon: SquareTerminal,
          isActive: true,
          items: [
            {
              title: t('sidebar.dashboard'),
              url: 'dashboard',
            },
            {
              title: t('sidebar.history'),
              url: '#',
            },
            {
              title: t('sidebar.starred'),
              url: '#',
            },
            {
              title: t('sidebar.settings'),
              url: '#',
            },
          ],
        },
        {
          title: t('sidebar.models'),
          url: '#',
          icon: Bot,
          items: [
            {
              title: t('sidebar.genesis'),
              url: '#',
            },
            {
              title: t('sidebar.explorer'),
              url: '#',
            },
            {
              title: t('sidebar.quantum'),
              url: '#',
            },
          ],
        },
        {
          title: t('sidebar.documentation'),
          url: '#',
          icon: BookOpen,
          items: [
            {
              title: t('sidebar.introduction'),
              url: '#',
            },
            {
              title: t('sidebar.getStarted'),
              url: '#',
            },
            {
              title: t('sidebar.tutorials'),
              url: '#',
            },
            {
              title: t('sidebar.changelog'),
              url: '#',
            },
          ],
        },
        {
          title: t('sidebar.settings'),
          url: '#',
          icon: Settings2,
          items: [
            {
              title: t('sidebar.general'),
              url: '#',
            },
            {
              title: t('sidebar.team'),
              url: '#',
            },
            {
              title: t('sidebar.billing'),
              url: '#',
            },
            {
              title: t('sidebar.limits'),
              url: '#',
            },
          ],
        },
      ],
      navSecondary: [
        {
          title: t('sidebar.support'),
          url: '#',
          icon: LifeBuoy,
        },
        {
          title: t('sidebar.feedback'),
          url: '#',
          icon: Send,
        },
      ],
      projects: [
        {
          name: t('sidebar.projects.designEngineering'),
          url: '#',
          icon: Frame,
        },
        {
          name: t('sidebar.projects.salesMarketing'),
          url: '#',
          icon: PieChart,
        },
        {
          name: t('sidebar.projects.travel'),
          url: '#',
          icon: Map,
        },
      ],
    }),
    [t, firstName, lastName, email],
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{COMPANY.NAME}</span>
                  <span className="truncate text-xs">{COMPANY.TYPE}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
