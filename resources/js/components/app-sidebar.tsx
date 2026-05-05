import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Lightbulb, ClipboardCheck, ClipboardList, FileCheck, Bell, Lock, Users, CheckCircle, BarChart3 } from 'lucide-react';
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
    const userPermissions = auth?.user?.permissions || auth?.permissions || [];
    const initialCount = auth?.unread_notifications ?? 0;
    const { unreadCount } = useNotificationCount(initialCount);

    const canViewDDReview = userPermissions.includes('view dd_review');
    const canViewDDAnalytics = userPermissions.includes('view dd_analytics');

    const ddReviewItems: NavItem[] = [
        { title: 'Overview', href: idea.ddReview.index(), icon: FileCheck, group: 'DD Review' },
        ...(userPermissions.includes('unlock dd_review') ? [{ title: 'Pending Unlock', href: idea.ddReview.pendingUnlock().url, icon: Lock, group: 'DD Review' }] : []),
        ...(userPermissions.includes('compile sme_feedback') ? [{ title: 'Pending SME Compilation', href: idea.ddReview.pendingSmeCompilation().url, icon: ClipboardList, group: 'DD Review' }] : []),
        ...(userPermissions.includes('compile board_feedback') ? [{ title: 'Pending Board Compilation', href: idea.ddReview.pendingBoardCompilation().url, icon: ClipboardList, group: 'DD Review' }] : []),
        ...(userPermissions.includes('decide sme') ? [{ title: 'Pending SME Decision', href: idea.ddReview.pendingSmeDecision().url, icon: Users, group: 'DD Review' }] : []),
        ...(userPermissions.includes('decide board') ? [{ title: 'Pending Board Decision', href: idea.ddReview.pendingBoardDecision().url, icon: CheckCircle, group: 'DD Review' }] : []),
        { title: 'All Active', href: idea.ddReview.active().url, icon: Lightbulb, group: 'DD Review' },
        ...(canViewDDAnalytics ? [{ title: 'Analytics', href: idea.ddReview.dashboard(), icon: BarChart3, group: 'DD Review' }] : []),
    ];

    const mainNavItems: NavItem[] = [
        ...(canViewDDReview ? ddReviewItems : []),
        {
            title: 'SME Reviews',
            href: idea.smeReview.index(),
            icon: ClipboardCheck,
            group: 'Review',
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