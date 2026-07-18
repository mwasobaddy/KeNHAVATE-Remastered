import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* First item — visible on all screens */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={breadcrumbs[0].href}>{breadcrumbs[0].title}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Desktop: middle items */}
                {breadcrumbs.slice(1, -1).map((item) => (
                    <Fragment key={item.title}>
                        <BreadcrumbSeparator className="hidden sm:block" />
                        <BreadcrumbItem className="hidden sm:flex">
                            <BreadcrumbLink asChild>
                                <Link href={item.href}>{item.title}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Fragment>
                ))}

                {/* Mobile: collapsed ellipsis (when > 2 items) */}
                {breadcrumbs.length > 2 && (
                    <>
                        <BreadcrumbSeparator className="sm:hidden" />
                        <BreadcrumbItem className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 outline-none">
                                    <BreadcrumbEllipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {breadcrumbs.slice(1, -1).map((item) => (
                                        <DropdownMenuItem key={item.title} asChild>
                                            <Link href={item.href}>{item.title}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    </>
                )}

                {/* Separator before last item */}
                <BreadcrumbSeparator />

                {/* Last item — visible on all screens */}
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        {breadcrumbs[breadcrumbs.length - 1].title}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
