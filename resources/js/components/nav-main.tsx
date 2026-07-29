import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const groupedItems = items.reduce<Record<string, NavItem[]>>((acc, item) => {
        const group = item.group || 'General';

        if (!acc[group]) {
            acc[group] = [];
        }

        acc[group].push(item);

        return acc;
    }, {});

    const groupOrder = ['General', 'Collaboration', 'Changes', 'Review', 'Engagement', 'IAM', 'Others'];

    const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
        const aIndex = groupOrder.indexOf(a);
        const bIndex = groupOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
            return a.localeCompare(b);
        }

        if (aIndex === -1) {
            return 1;
        }

        if (bIndex === -1) {
            return -1;
        }

        return aIndex - bIndex;
    });

    return (
        <>
            {sortedGroups.map((group) => (
                <SidebarGroup key={group} className="px-2 py-0">
                    <SidebarGroupLabel className="px-2">
                        {group}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {groupedItems[group].map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.exactMatch ? isCurrentUrl(typeof item.href === 'string' ? item.href : (item.href?.url ?? '')) : isCurrentOrParentUrl(typeof item.href === 'string' ? item.href : (item.href?.url ?? ''))}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href || '#'} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-white">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
