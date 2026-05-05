import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    const groupedItems = items.reduce<Record<string, NavItem[]>>((acc, item) => {
        const group = item.group || 'General';

        if (!acc[group]) {
            acc[group] = [];
        }

        acc[group].push(item);

        return acc;
    }, {});

    const groupOrder = ['General', 'Review'];

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
                            item.items && item.items.length > 0 ? (
                                <Collapsible key={item.title} asChild defaultOpen={item.items.some((sub) => isCurrentUrl(sub.href || ''))}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={{ children: item.title }}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto h-4 w-4" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrentUrl(subItem.href || '')}
                                                        >
                                                            <Link href={subItem.href || '#'}>
                                                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ) : (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href || '')}
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
                            )
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}