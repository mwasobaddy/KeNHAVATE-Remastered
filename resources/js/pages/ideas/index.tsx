import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileEdit, Pencil, RotateCcw, Search, SlidersHorizontal, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Idea = {
    id: number;
    title: string;
    slug: string;
    status: string;
    collaboration_enabled: boolean;
    collaboration_status?: 'pending' | 'approved' | 'rejected' | null;
    author: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    created_at: string;
};

type PaginatedData = {
    data: Idea[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Category = {
    id: number;
    name: string;
};

type Props = {
    ideas: PaginatedData;
    currentTab: string;
    categories: Category[];
    filters: Record<string, string>;
    search: string | null;
};

const IDEA_STATUSES = [
    'draft',
    'submitted',
    'assigned',
    'revision_requested',
    'resubmitted',
    'classified',
    'dg_review',
    'approved',
    'declined',
    'deferred',
    'planned',
    'closed',
    'in_progress',
    'completed',
    'implemented',
] as const;

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

const collabVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

const collabLabels: Record<string, string> = {
    pending: 'Requested',
    approved: 'Approved',
    rejected: 'Declined',
};

const TABS = [
    { key: 'my-ideas', label: 'My Ideas' },
    { key: 'open-for-collaboration', label: 'Open for Collaboration' },
    { key: 'my-contributions', label: 'My Contributions' },
] as const;

function navigateWithFilters(currentTab: string, searchValue: string, activeFilters: Record<string, string>) {
    const params = new URLSearchParams();

    if (currentTab !== 'my-ideas') {
        params.set('tab', currentTab);
    }

    if (searchValue) {
        params.set('search', searchValue);
    }

    for (const [key, value] of Object.entries(activeFilters)) {
        if (value) {
            params.set(key, value);
        }
    }

    const qs = params.toString();

    router.get(ideas.index().url + (qs ? `?${qs}` : ''), {}, { preserveState: true, preserveScroll: true });
}

export default function IdeaIndex({ ideas: ideasData, currentTab, categories, filters: initialFilters, search: initialSearch }: Props) {
    const colSpan = currentTab === 'my-ideas' ? 5 : 7;
    const [deleteIdea, setDeleteIdea] = useState<Idea | null>(null);
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const [filterOpen, setFilterOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (searchValue !== (initialSearch ?? '')) {
            debounceRef.current = setTimeout(() => {
                navigateWithFilters(currentTab, searchValue, activeFilters);
            }, 300);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    const updateFilter = (key: string, value: string) => {
        const next = { ...activeFilters };

        if (value) {
            next[key] = value;
        } else {
            delete next[key];
        }

        setActiveFilters(next);
    };

    const applyFilters = () => {
        setFilterOpen(false);
        navigateWithFilters(currentTab, searchValue, activeFilters);
    };

    const clearFilters = () => {
        const cleared: Record<string, string> = {};
        setActiveFilters(cleared);
        setFilterOpen(false);
        navigateWithFilters(currentTab, searchValue, cleared);
    };

    const clearSearch = () => {
        setSearchValue('');
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const hasSearch = searchValue.length > 0;

    const confirmDelete = () => {
        if (!deleteIdea) {
            return;
        }

        router.delete(ideas.destroy(deleteIdea.slug).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteIdea(null),
        });
    };

    return (
        <TooltipProvider>
            <>
                <Head title="Ideas" />

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <Heading
                            title="Ideas"
                            description="Browse and manage innovation ideas"
                        />
                        <Button asChild>
                            <Link href={ideas.create()}>Submit New Idea</Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search ideas by title or description..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {hasSearch && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="relative shrink-0">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">Status</h4>
                                        <div className="max-h-40 space-y-1.5 overflow-y-auto">
                                            {IDEA_STATUSES.map((status) => (
                                                <label
                                                    key={status}
                                                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted"
                                                >
                                                    <Checkbox
                                                        checked={activeFilters.status?.split(',').includes(status)}
                                                        onCheckedChange={(checked) => {
                                                            const current = (activeFilters.status ?? '').split(',').filter(Boolean);
                                                            const next = checked
                                                                ? [...current, status]
                                                                : current.filter((s) => s !== status);

                                                            updateFilter('status', next.join(','));
                                                        }}
                                                    />
                                                    {status}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">Category</h4>
                                        <Select
                                            value={activeFilters.category_id ?? ''}
                                            onValueChange={(value) => updateFilter('category_id', value === '_all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_all">All categories</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">Date Range</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label htmlFor="date-from" className="text-xs text-muted-foreground">From</Label>
                                                <Input
                                                    id="date-from"
                                                    type="date"
                                                    value={activeFilters.date_from ?? ''}
                                                    onChange={(e) => updateFilter('date_from', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="date-to" className="text-xs text-muted-foreground">To</Label>
                                                <Input
                                                    id="date-to"
                                                    type="date"
                                                    value={activeFilters.date_to ?? ''}
                                                    onChange={(e) => updateFilter('date_to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                        <Button size="sm" onClick={applyFilters}>
                                            Apply filters
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {TABS.map((tab) => (
                            <Link
                                key={tab.key}
                                href={ideas.index().url + (tab.key !== 'my-ideas' ? `?tab=${tab.key}` : '')}
                                preserveState
                                preserveScroll
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    currentTab === tab.key
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {TABS.find((t) => t.key === currentTab)?.label ?? 'Ideas'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">Title</th>
                                            <th className="pb-3 pr-4 font-medium">Category</th>
                                            {currentTab !== 'my-ideas' && (
                                                <th className="pb-3 pr-4 font-medium">Author</th>
                                            )}
                                            <th className="pb-3 pr-4 font-medium">Status</th>
                                            {currentTab === 'open-for-collaboration' && (
                                                <th className="pb-3 pr-4 font-medium">Collaboration</th>
                                            )}
                                            {currentTab === 'my-contributions' && (
                                                <th className="pb-3 pr-4 font-medium">Role</th>
                                            )}
                                            <th className="pb-3 pr-4 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ideasData.data.length > 0 ? (
                                            ideasData.data.map((idea) => (
                                                <tr key={idea.id} className="border-b last:border-0">
                                                    <td className="py-3 pr-4 font-medium">
                                                        {idea.title}
                                                    </td>
                                                    <td className="py-3 pr-4 text-muted-foreground">
                                                        {idea.category?.name ?? 'Uncategorized'}
                                                    </td>
                                                    {currentTab !== 'my-ideas' && (
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {idea.author?.name ?? 'Unknown'}
                                                        </td>
                                                    )}
                                                    <td className="py-3 pr-4">
                                                        <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                                                            {idea.status.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </td>
                                                    {currentTab === 'open-for-collaboration' && (
                                                        <td className="py-3 pr-4">
                                                            {idea.collaboration_status ? (
                                                                <Badge
                                                                    variant={collabVariants[idea.collaboration_status] ?? 'outline'}
                                                                >
                                                                    {collabLabels[idea.collaboration_status] ?? idea.collaboration_status}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">Open</Badge>
                                                            )}
                                                        </td>
                                                    )}
                                                    {currentTab === 'my-contributions' && (
                                                        <td className="py-3 pr-4">
                                                            <Badge variant="secondary">Contributor</Badge>
                                                        </td>
                                                    )}
                                                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                                        {new Date(idea.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-0.5">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" asChild>
                                                                        <Link href={ideas.show(idea.slug)}>
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View</TooltipContent>
                                                            </Tooltip>

                                                            {currentTab === 'my-ideas' && (
                                                                <>
                                                                    {idea.status === 'draft' && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button variant="ghost" size="icon" asChild>
                                                                                    <Link href={ideas.edit(idea.slug)}>
                                                                                        <Pencil className="h-4 w-4" />
                                                                                    </Link>
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Edit</TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    {idea.status === 'revision_requested' && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button variant="ghost" size="icon" asChild>
                                                                                    <Link href={ideas.edit(idea.slug)}>
                                                                                        <RotateCcw className="h-4 w-4" />
                                                                                    </Link>
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Resubmit</TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => setDeleteIdea(idea)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Delete</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}

                                                            {currentTab === 'open-for-collaboration' && !idea.collaboration_status && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" asChild>
                                                                            <Link href={ideas.show(idea.slug)}>
                                                                                <UserPlus className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Request to Collaborate</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {currentTab === 'open-for-collaboration' && idea.collaboration_status === 'approved' && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" asChild>
                                                                            <Link href={ideas.changes.create(idea.slug)}>
                                                                                <FileEdit className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Request Change</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                                                    {hasSearch || hasActiveFilters
                                                        ? 'No ideas match your search or filters.'
                                                        : currentTab === 'my-ideas'
                                                            ? "You haven't submitted any ideas yet."
                                                            : currentTab === 'open-for-collaboration'
                                                                ? 'No ideas open for collaboration right now.'
                                                                : "You haven't been invited as a contributor to any ideas."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {ideasData.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {ideasData.from} to {ideasData.to} of {ideasData.total} entries
                                    </p>
                                    <div className="flex gap-2">
                                        {ideasData.links.map((link, i) => {
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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={deleteIdea !== null} onOpenChange={(open) => {
                    if (!open) {
                        setDeleteIdea(null);
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Idea</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &ldquo;{deleteIdea?.title}&rdquo;? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteIdea(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        </TooltipProvider>
    );
}
