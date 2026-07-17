import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, ClipboardCheck, Eye, FileEdit, Lightbulb, Pencil, Plus, RotateCcw, Search, SlidersHorizontal, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

type IdeaStats = {
    total: number;
    drafts: number;
    under_review: number;
    approved: number;
    contributions: number;
};

type Props = {
    ideas: PaginatedData;
    currentTab: string;
    categories: Category[];
    filters: Record<string, string>;
    search: string | null;
    ideaStats: IdeaStats;
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

const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    assigned: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    revision_requested: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    resubmitted: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    classified: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
    dg_review: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    declined: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    deferred: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    planned: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
    closed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    in_progress: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    implemented: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
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

export default function IdeaIndex({ ideas: ideasData, currentTab, categories, filters: initialFilters, search: initialSearch, ideaStats }: Props) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const colSpan = currentTab === 'my-ideas' ? 5 : 7;
    const [deleteIdea, setDeleteIdea] = useState<Idea | null>(null);
    const [collabIdeaSlug, setCollabIdeaSlug] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const [filterOpen, setFilterOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

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

    const canRequestCollaboration = (idea: Idea) => {
        const isOpen = idea.status === 'draft' || idea.status === 'revision_requested';

        return isOpen
            && idea.collaboration_enabled
            && idea.author?.id !== auth.user.id
            && idea.collaboration_status !== 'pending'
            && idea.collaboration_status !== 'approved';
    };

    const collabIdea = ideasData.data.find((i) => i.slug === collabIdeaSlug);

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

                    {/* Top bar */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <Button size="icon" variant="info" onClick={goBack}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button size="icon" asChild>
                                <Link href={ideas.create()}>
                                    <Plus className="h-5 w-5" />
                                </Link>
                            </Button>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">New Idea</span>
                        </div>
                    </div>

                    <Heading
                        title="Ideas"
                        description="Browse and manage innovation ideas"
                    />

                    <Collapsible className="group/collapsible">
                        <CollapsibleTrigger asChild>
                            <button className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                                <Lightbulb className="h-4 w-4" />
                                Overview
                                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                                    {ideaStats.total} ideas &middot; {ideaStats.drafts} drafts &middot; {ideaStats.under_review} in review
                                </span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:hidden" />
                                <ChevronUp className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]/collapsible:hidden" />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="mt-3 grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
                                        <div className="rounded-full bg-sky-500/10 p-2">
                                            <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold lg:text-2xl">{ideaStats.total}</div>
                                        <p className="hidden text-xs text-muted-foreground lg:block">Ideas submitted</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                                        <div className="rounded-full bg-amber-500/10 p-2">
                                            <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold lg:text-2xl">{ideaStats.drafts}</div>
                                        <p className="hidden text-xs text-muted-foreground lg:block">Awaiting submission</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                                        <div className="rounded-full bg-violet-500/10 p-2">
                                            <ClipboardCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold lg:text-2xl">{ideaStats.under_review}</div>
                                        <p className="hidden text-xs text-muted-foreground lg:block">Awaiting decision</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                        <div className="rounded-full bg-emerald-500/10 p-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold lg:text-2xl">{ideaStats.approved}</div>
                                        <p className="hidden text-xs text-muted-foreground lg:block">Ideas approved</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

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

                    <Tabs
                        value={currentTab}
                        onValueChange={(tab) => {
                            const params = new URLSearchParams();

                            if (tab !== 'my-ideas') {
                                params.set('tab', tab);
                            }

                            const qs = params.toString();

                            router.get(ideas.index().url + (qs ? `?${qs}` : ''), {}, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                    >
                        <TabsList className="w-full justify-start">
                            {TABS.map((tab) => (
                                <TabsTrigger key={tab.key} value={tab.key}>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

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
                                                    <td className="py-3 pr-4">
                                                        <Link
                                                            href={ideas.show(idea.slug)}
                                                            className="font-medium hover:text-sky-600 dark:hover:text-sky-400"
                                                        >
                                                            {idea.title}
                                                        </Link>
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
                                                        <Badge variant="outline" className={statusStyles[idea.status] ?? ''}>
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
                                                        {formatDate(idea.created_at)}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-0.5">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="outline" size="icon" className="border-blue-500/30" asChild>
                                                                        <Link href={ideas.show(idea.slug)}>
                                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View</TooltipContent>
                                                            </Tooltip>

                                                            {currentTab === 'my-ideas' && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span tabIndex={0}>
                                                                                {idea.status === 'draft' ? (
                                                                                    <Button variant="outline" size="icon" className="border-green-500/30" asChild>
                                                                                        <Link href={ideas.edit(idea.slug)}>
                                                                                            <Pencil className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                                        </Link>
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button variant="outline" size="icon" className="border-green-500/30" disabled>
                                                                                        <Pencil className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                                    </Button>
                                                                                )}
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {idea.status === 'draft' ? 'Edit' : 'Only available for draft ideas'}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span tabIndex={0}>
                                                                                {idea.status === 'revision_requested' ? (
                                                                                    <Button variant="outline" size="icon" className="border-amber-500/30" asChild>
                                                                                        <Link href={ideas.edit(idea.slug)}>
                                                                                            <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                                        </Link>
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button variant="outline" size="icon" className="border-amber-500/30" disabled>
                                                                                        <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                                    </Button>
                                                                                )}
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {idea.status === 'revision_requested' ? 'Resubmit' : 'Only available when revision is requested'}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="border-red-500/30"
                                                                                onClick={() => setDeleteIdea(idea)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Delete</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}

                                                            {currentTab === 'open-for-collaboration' && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span tabIndex={0}>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="border-teal-500/30"
                                                                                disabled={!canRequestCollaboration(idea)}
                                                                                onClick={() => setCollabIdeaSlug(idea.slug)}
                                                                            >
                                                                                <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                                            </Button>
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {canRequestCollaboration(idea)
                                                                            ? 'Request to Collaborate'
                                                                            : idea.status !== 'draft' && idea.status !== 'revision_requested'
                                                                                ? 'Idea is not open for collaboration'
                                                                                : idea.collaboration_status === 'pending'
                                                                                    ? 'Request already pending'
                                                                                    : idea.collaboration_status === 'approved'
                                                                                        ? 'Already a collaborator'
                                                                                        : 'Cannot request collaboration'}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {currentTab === 'open-for-collaboration' && idea.collaboration_status === 'approved' && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="outline" size="icon" className="border-purple-500/30" asChild>
                                                                            <Link href={ideas.changes.create(idea.slug)}>
                                                                                <FileEdit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                                                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground">
                                                    {hasSearch || hasActiveFilters ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>No ideas match your search or filters.</p>
                                                        </div>
                                                    ) : currentTab === 'my-ideas' ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>You haven't submitted any ideas yet.</p>
                                                            <Button size="sm" className="mt-2" asChild>
                                                                <Link href={ideas.create()}>Submit Your First Idea</Link>
                                                            </Button>
                                                        </div>
                                                    ) : currentTab === 'open-for-collaboration' ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>No ideas open for collaboration right now.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>You haven't been invited as a contributor to any ideas.</p>
                                                        </div>
                                                    )}
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

                <Dialog open={collabIdeaSlug !== null} onOpenChange={(open) => {
                    if (!open) {
                        setCollabIdeaSlug(null);
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request to Collaborate</DialogTitle>
                            {collabIdea && (
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Send a request to collaborate on &ldquo;{collabIdea.title}&rdquo;
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        {collabIdea && (
                            <Form
                                method="post"
                                action={ideas.collaborations.store(collabIdea.slug)}
                                resetOnSuccess={true}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="message">
                                                Why do you want to collaborate?
                                            </Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                required
                                                placeholder="Tell the author what skills or ideas you can contribute..."
                                            />
                                            <InputError message={errors.message} />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button type="button" variant="outline" onClick={() => setCollabIdeaSlug(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Sending...' : 'Send Request'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </>
        </TooltipProvider>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
