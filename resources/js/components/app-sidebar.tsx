import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Lightbulb, ClipboardCheck, FileCheck, Bell } from 'lucide-react';
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
import { useNotificationCount } from '@/hooks/use-notifications';
import { dashboard } from '@/routes';
import idea from '@/routes/idea';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#laravel',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props } = usePage();
    const auth = props.auth as any;
    const userRoles = auth?.user?.roles || auth?.roles || [];
    const initialCount = auth?.unread_notifications ?? 0;
    const { unreadCount } = useNotificationCount(initialCount);

    const mainNavItems: NavItem[] = [
        {
            title: 'DD Reviews',
            href: idea.ddReview.index(),
            icon: FileCheck,
            group: 'DD Review',
        },
        ...(userRoles.includes('deputy_director')
            ? [{
                title: 'DD Dashboard',
                href: idea.ddReview.dashboard(),
                icon: FileCheck,
                group: 'DD Review',
            }]
            : []),
        ...(userRoles.includes('idea_reviewer')
            ? [{
                title: 'Review Assignments',
                href: idea.ddReview.reviewer(),
                icon: ClipboardCheck,
                group: 'DD Review',
            }]
            : []),
        {
            title: 'SME Reviews',
            href: idea.smeReview.index(),
            icon: ClipboardCheck,
            group: 'SME Review',
        },
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            group: 'General',
        },
        {
            title: 'Ideas',
            href: idea.index(),
            icon: Lightbulb,
            group: 'General',
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: unreadCount,
            group: 'General',
        },
    ];

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