import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Plus, Search, FolderTree, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { decodeHtmlEntities } from '@/lib/utils';
import routes from '@/routes/idea-categories';
import type { Auth } from '@/types/auth';

type IdeaCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    creator: { id: number; name: string } | null;
};

type Props = {
    idea_categories: {
        data: IdeaCategory[];
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

export default function IdeaCategoryIndex({ idea_categories, filters: initialFilters, search: initialSearch }: Props) {
    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const permissions = user?.permissions ?? [];
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

    const handleDelete = (category: IdeaCategory) => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            router.delete(routes.destroy({ ideaCategory: category.id }));
        }
    };

    return (
        <>
            <Head title="Idea Categories" />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
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

                    {permissions.includes('idea_category.create') && (
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipNew} onOpenChange={setTipNew}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={routes.create()} onClick={() => setTipNew(true)}>
                                            <Plus className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New Category</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">New Category</span>
                        </div>
                    )}
                </div>

                <Heading
                    title="Idea Categories"
                    description="Manage categories for classifying ideas"
                />

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Search by name or slug..."
                    />
                    <FilterModal
                        statuses={[]}
                        categories={[]}
                        filters={activeFilters}
                        onFilterChange={updateFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Idea Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Name</th>
                                        <th className="pb-3 pr-4 font-medium">Slug</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 pr-4 font-medium">Created By</th>
                                        <th className="pb-3 pr-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {idea_categories.data.length > 0 ? (
                                        idea_categories.data.map((category) => (
                                            <tr key={category.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{category.name}</span>
                                                    </div>
                                                    {category.description && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {category.slug}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge
                                                        variant={category.is_active ? 'default' : 'secondary'}
                                                    >
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {category.creator?.name ?? '—'}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-start gap-2">
                                                        {permissions.includes('idea_category.edit') && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${category.id}-edit`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${category.id}-edit`]: o }))}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="success" size="icon" asChild>
                                                                             <Link href={routes.edit({ ideaCategory: category.id })} onClick={() => setActiveTips((p) => ({ ...p, [`${category.id}-edit`]: true }))}>
                                                                                 <SquarePen className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Edit</TooltipContent>
                                                                </Tooltip>
                                                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Edit</span>
                                                            </div>
                                                        )}
                                                        {permissions.includes('idea_category.delete') && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${category.id}-delete`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${category.id}-delete`]: o }))}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                             variant="destructive"
                                                                             size="icon"
                                                                             onClick={() => {
                                                                                 setActiveTips((p) => ({ ...p, [`${category.id}-delete`]: true }));
                                                                                 handleDelete(category);
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
                                                        <p>No idea categories match your search.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p>No idea categories found.</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {idea_categories.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {hasSearch || hasActiveFilters
                                        ? `Showing ${idea_categories.data.length} entries`
                                        : `Showing ${idea_categories.from} to ${idea_categories.to} of ${idea_categories.total} entries`
                                    }
                                </p>
                                {!hasSearch && !hasActiveFilters && (
                                    <div className="flex gap-2">
                                        {idea_categories.links.map((link, i) => {
                                            if (!link.url || link.label === '...') {
                                                return (
                                                    <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                        {decodeHtmlEntities(link.label)}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                                    <Link href={link.url} preserveState preserveScroll>
                                                        {decodeHtmlEntities(link.label)}
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

IdeaCategoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Idea Categories', href: '/idea-categories' },
    ],
};
