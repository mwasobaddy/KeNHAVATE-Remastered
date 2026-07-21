import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Plus, Power, PowerOff, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/points';

type Point = {
    id: number;
    name: string;
    description: string | null;
    points: number;
    is_active: boolean;
    created_by: { id: number; name: string } | null;
    deleted_at: string | null;
    created_at: string;
};

type Props = {
    points: {
        data: Point[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string | null;
    filters: Record<string, string>;
};

const POINT_STATUSES = ['active', 'inactive'] as const;

export default function PointIndex({ points, filters: initialFilters, search: initialSearch }: Props) {
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const [activeTips, setActiveTips] = useState<Record<string, boolean>>({});
    const [tipBack, setTipBack] = useState(false);
    const [tipNew, setTipNew] = useState(false);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigateWithFilters = (searchVal: string, filterOverrides?: Record<string, string>) => {
        const params = new URLSearchParams();
        const filters = filterOverrides ?? activeFilters;

        if (searchVal) {
            params.set('search', searchVal);
        }

        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                params.set(key, value);
            }
        }

        const qs = params.toString();
        router.get(window.location.pathname + (qs ? `?${qs}` : ''), {}, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => navigateWithFilters(value), 300);
    };

    const updateFilter = (key: string, value: string) => {
        const next = { ...activeFilters };

        if (value) {
            next[key] = value;
        } else {
            delete next[key];
        }

        setActiveFilters(next);
        navigateWithFilters(searchValue, next);
    };

    const clearFilters = () => {
        const cleared: Record<string, string> = {};
        setActiveFilters(cleared);
        navigateWithFilters(searchValue, cleared);
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const hasSearch = searchValue.length > 0;
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const handleDelete = (point: Point) => {
        if (confirm(`Are you sure you want to delete "${point.name}"?`)) {
            router.delete(routes.destroy({ point: point.id }));
        }
    };

    const handleToggle = (point: Point) => {
        router.patch(routes.toggle({ point: point.id }));
    };

    return (
        <>
            <Head title="Point Actions" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Tooltip open={tipBack} onOpenChange={setTipBack}>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="warning" onClick={() => {
 setTipBack(true); goBack(); 
}}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Back</TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <Tooltip open={tipNew} onOpenChange={setTipNew}>
                            <TooltipTrigger asChild>
                                <Button size="icon" asChild>
                                    <Link href={routes.create()} onClick={() => setTipNew(true)}>
                                        <Plus className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>New Action</TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">New Action</span>
                    </div>
                </div>

                <Heading
                    title="Point Actions"
                    description="Manage actions that award points to users"
                />

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Search by name or description..."
                    />
                    <FilterModal
                        statuses={POINT_STATUSES}
                        categories={[]}
                        filters={activeFilters}
                        onFilterChange={updateFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Point Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Name</th>
                                        <th className="pb-3 pr-4 font-medium">Points</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 pr-4 font-medium">Created By</th>
                                        <th className="pb-3 pr-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {points.data.length > 0 ? (
                                        points.data.map((point) => (
                                            <tr key={point.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium">{point.name}</div>
                                                    {point.description && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {point.description}
                                                        </div>
                                                    )}
                                                    {point.deleted_at && (
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            Deleted
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4">{point.points}</td>
                                                <td className="py-3 pr-4">
                                                    <Badge
                                                        variant={point.is_active ? 'default' : 'secondary'}
                                                    >
                                                        {point.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {point.created_by?.name ?? '—'}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Tooltip open={activeTips[`${point.id}-edit`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${point.id}-edit`]: o }))}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="success" size="icon" asChild>
                                                                         <Link href={routes.edit({ point: point.id })} onClick={() => setActiveTips((p) => ({ ...p, [`${point.id}-edit`]: true }))}>
                                                                             <SquarePen className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Edit</TooltipContent>
                                                            </Tooltip>
                                                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Edit</span>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Tooltip open={activeTips[`${point.id}-toggle`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${point.id}-toggle`]: o }))}>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant={point.is_active ? 'warning' : 'info'}
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            setActiveTips((p) => ({ ...p, [`${point.id}-toggle`]: true }));
                                                                            handleToggle(point);
                                                                        }}
                                                                    >
                                                                        {point.is_active
                                                                            ? <PowerOff className="h-4 w-4" />
                                                                            : <Power className="h-4 w-4" />
                                                                        }
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {point.is_active ? 'Deactivate' : 'Activate'}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <span className="text-[10px] leading-tight text-muted-foreground text-center">{point.is_active ? 'Deactivate' : 'Activate'}</span>
                                                        </div>
                                                        {!point.deleted_at && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${point.id}-delete`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${point.id}-delete`]: o }))}>
                                                                    <TooltipTrigger asChild>
                                                                    <Button
                                                                         variant="destructive"
                                                                         size="icon"
                                                                         onClick={() => {
                                                                             setActiveTips((p) => ({ ...p, [`${point.id}-delete`]: true }));
                                                                             handleDelete(point);
                                                                         }}
                                                                     >
                                                                         <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete</TooltipContent>
                                                                </Tooltip>
                                                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Delete</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                {hasSearch || hasActiveFilters ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 text-muted-foreground/50" />
                                                        <p>No point actions match your search.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p>No point actions found.</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {points.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {hasSearch || hasActiveFilters
                                        ? `Showing ${points.data.length} entries`
                                        : `Showing ${points.from} to ${points.to} of ${points.total} entries`
                                    }
                                </p>
                                {!hasSearch && !hasActiveFilters && (
                                    <div className="flex gap-2">
                                        {points.links.map((link, i) => {
                                            if (!link.url || link.label === '...') {
                                                return (
                                                    <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                        {link.label}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                                    <Link href={link.url} preserveState preserveScroll>
                                                        {link.label}
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PointIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Point Actions', href: '/points' },
    ],
};
