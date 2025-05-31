import * as React from 'react';
import { Command, Users, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NavMain } from '@/components/nav-main';
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
import { ROUTES } from '@/config/auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { firstName, lastName, email } = useAuthStore();

  const data = React.useMemo(
    () => ({
      user: {
        firstName,
        lastName,
        email: email,
        avatar: '/avatars/shadcn.jpg',
      },
      navMain: [
        {
          title: t('sidebar.dashboard'),
          url: ROUTES.DASHBOARD,
          icon: Command,
          isActive: false,
          items: [],
        },
        {
          title: t('sidebar.userManagement'),
          url: ROUTES.LIST_USERS,
          icon: Users,
          isActive: false,
          items: [],
        },
        {
          title: t('sidebar.adminManagement'),
          url: ROUTES.ADMIN_USERS,
          icon: Shield,
          isActive: false,
          items: [],
        },
        {
          title: t('sidebar.roleManagement'),
          url: '/roles',
          icon: Shield,
          isActive: false,
          items: [],
        },
      ],
      navSecondary: [],
      projects: [],
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
