import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, ClipboardList, Inbox, LayoutGrid, Lightbulb, ScrollText, Send, Shield, Trophy, User, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import { dashboard, leaderboard } from '@/routes';
import ideas from '@/routes/ideas';
import points from '@/routes/points';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#laravel',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const permissions = user?.permissions ?? [];

    const hasPointsAccess = permissions.includes('points.view');
    const hasAuditAccess = permissions.includes('audit.view');
    const hasAssignPermission = permissions.includes('idea.assign_officer');
    const hasClassifyPermission = permissions.includes('idea.classify');
    const hasRoleManage = permissions.includes('role.manage');
    const hasUserManage = permissions.includes('user.manage');
    const generalItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            group: 'General',
        },
        {
            title: 'Ideas',
            href: ideas.index(),
            icon: Lightbulb,
            group: 'General',
        },
        {
            title: 'Leaderboard',
            href: leaderboard(),
            icon: Trophy,
            group: 'General',
        },
    ];

    const allChangesItems: NavItem[] = [
        {
            title: 'Request Outbox',
            href: ideas.changes.mine(),
            icon: Send,
            group: 'Change',
        },
        {
            title: 'Request Inbox',
            href: ideas.changes.pending(),
            icon: Inbox,
            group: 'Change',
        },
    ];

    const collaborationItems: NavItem[] = [
        {
            title: 'Request Inbox',
            href: ideas.collaborations.inbox(),
            icon: Inbox,
            group: 'Collaboration',
        },
        {
            title: 'Request Outbox',
            href: ideas.collaborations.outbox(),
            icon: Send,
            group: 'Collaboration',
        },
    ];

    const reviewItems: NavItem[] = [];

    if (hasAssignPermission) {
        reviewItems.push({
            title: 'Assign Officer',
            href: ideas.review().url + '?tab=assign-officer',
            icon: ClipboardList as LucideIcon,
            group: 'Review',
        });
    }

    if (hasClassifyPermission) {
        reviewItems.push({
            title: 'My Queue',
            href: ideas.review().url + '?tab=my-queue',
            icon: ClipboardCheck as LucideIcon,
            group: 'Review',
        });
    }

    if (hasPointsAccess) {
        reviewItems.push({
            title: 'Points',
            href: points.index(),
            icon: Zap as LucideIcon,
            group: 'Review',
        });
    }

    if (hasAuditAccess) {
        reviewItems.push({
            title: 'Audit Log',
            href: '/audit',
            icon: ScrollText as LucideIcon,
            group: 'Review',
        });
    }

    if (hasRoleManage) {
        reviewItems.push({
            title: 'Role Management',
            href: roles.index(),
            icon: Shield as LucideIcon,
            group: 'Review',
        });
    }

    if (hasUserManage) {
        reviewItems.push({
            title: 'User Management',
            href: users.index(),
            icon: User as LucideIcon,
            group: 'Review',
        });
    }

    const mainNavItems = [...generalItems, ...allChangesItems, ...collaborationItems, ...reviewItems];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
