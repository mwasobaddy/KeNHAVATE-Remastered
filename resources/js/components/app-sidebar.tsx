import { Link, usePage } from '@inertiajs/react';
import { Bug, Building, Building2, ClipboardCheck, ClipboardList, FileText, FolderTree, Inbox, LayoutGrid, Lightbulb, MapPin, ScrollText, Send, Shield, Tags, Trophy, User, Zap } from 'lucide-react';
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
import bugReports from '@/routes/bug-reports';
import regions from '@/routes/regions';
import directorates from '@/routes/directorates';
import departments from '@/routes/departments';
import contractTypes from '@/routes/contract-types';
import ideaCategories from '@/routes/idea-categories';
import ideaClassifications from '@/routes/idea-classifications';
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
    const hasReportManage = permissions.includes('report.manage');
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

    const changesItems: NavItem[] = [
        {
            title: 'Request Outbox',
            href: ideas.changes.mine(),
            icon: Send,
            group: 'Changes',
        },
        {
            title: 'Request Inbox',
            href: ideas.changes.pending(),
            icon: Inbox,
            group: 'Changes',
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

    const configurationItems: NavItem[] = [];

    if (hasPointsAccess) {
        configurationItems.push({
            title: 'Points',
            href: points.index(),
            icon: Zap as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('region.manage')) {
        configurationItems.push({
            title: 'Regions',
            href: regions.index(),
            icon: MapPin as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('directorate.manage')) {
        configurationItems.push({
            title: 'Directorates',
            href: directorates.index(),
            icon: Building2 as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('department.manage')) {
        configurationItems.push({
            title: 'Departments',
            href: departments.index(),
            icon: Building as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('contract_type.manage')) {
        configurationItems.push({
            title: 'Contract Types',
            href: contractTypes.index(),
            icon: FileText as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('idea_category.manage')) {
        configurationItems.push({
            title: 'Idea Categories',
            href: ideaCategories.index(),
            icon: FolderTree as LucideIcon,
            group: 'Configuration',
        });
    }

    if (permissions.includes('idea_classification.manage')) {
        configurationItems.push({
            title: 'Idea Classifications',
            href: ideaClassifications.index(),
            icon: Tags as LucideIcon,
            group: 'Configuration',
        });
    }

    const iamItems: NavItem[] = [];

    if (hasRoleManage) {
        iamItems.push({
            title: 'Role Management',
            href: roles.index(),
            icon: Shield as LucideIcon,
            group: 'IAM',
        });
    }

    if (hasUserManage) {
        iamItems.push({
            title: 'User Management',
            href: users.index(),
            icon: User as LucideIcon,
            group: 'IAM',
        });
    }

    if (hasAuditAccess) {
        iamItems.push({
            title: 'Audit Log',
            href: '/audit',
            icon: ScrollText as LucideIcon,
            group: 'IAM',
        });
    }

    const supportItems: NavItem[] = [
        {
            title: 'Report Bug',
            href: bugReports.index(),
            icon: Bug as LucideIcon,
            group: 'Support',
            exactMatch: true,
        },
    ];

    if (hasReportManage) {
        supportItems.push({
            title: 'Review Reports',
            href: bugReports.manage(),
            icon: ClipboardCheck as LucideIcon,
            group: 'Support',
        });
    }

    const mainNavItems = [
        ...generalItems,
        ...collaborationItems,
        ...changesItems,
        ...reviewItems,
        ...configurationItems,
        ...iamItems,
        ...supportItems,
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
