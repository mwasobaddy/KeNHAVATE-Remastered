import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, FolderGit2, LayoutGrid, Lightbulb, ScrollText, Trophy, Zap } from 'lucide-react';
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
import type { LucideIcon } from 'lucide-react';
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
    const { auth } = usePage().props;
    const user = auth.user;
    const roles = user?.roles ?? [];

    const hasPointsAccess = roles.some((r) => ['admin', 'board'].includes(r));
    const hasAuditAccess = roles.some((r) => ['admin', 'board'].includes(r));

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

    const reviewItems: NavItem[] = [];

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

    const mainNavItems = [...generalItems, ...reviewItems];

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
