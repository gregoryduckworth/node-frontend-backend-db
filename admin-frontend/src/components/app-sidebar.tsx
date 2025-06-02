import * as React from 'react';
import { Command, Users, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
import { PERMISSIONS } from '@/config/permissions';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { firstName, lastName, email, permissions } = useAuthStore();

  const data = React.useMemo(() => {
    const hasPermission = (required?: string[]) => {
      if (!required || required.length === 0) return true;
      return required.some((perm) => permissions.includes(perm));
    };
    return {
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
          requiredPermissions: [PERMISSIONS.VIEW_USERS],
        },
        {
          title: t('sidebar.adminManagement'),
          url: ROUTES.ADMIN_USERS,
          icon: Shield,
          isActive: false,
          items: [],
          requiredPermissions: [PERMISSIONS.MANAGE_ADMINS],
        },
        {
          title: t('sidebar.roleManagement'),
          url: '/roles',
          icon: Shield,
          isActive: false,
          items: [],
          requiredPermissions: [PERMISSIONS.MANAGE_ROLES],
        },
      ].filter((item) => hasPermission(item.requiredPermissions)),
      navSecondary: [],
      projects: [],
    };
  }, [t, firstName, lastName, email, permissions]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={ROUTES.DASHBOARD}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{COMPANY.NAME}</span>
                  <span className="truncate text-xs">{COMPANY.TYPE}</span>
                </div>
              </Link>
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
