import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ClipboardCheck, Eye, FileEdit, Lightbulb, SquarePen, Plus, RotateCcw, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SearchInput from '@/components/search-input';
import StatsCards from '@/components/stats-cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeTips, setActiveTips] = useState<Record<string, boolean>>({});

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            navigateWithFilters(currentTab, value, activeFilters);
        }, 300);
    };

    const updateFilter = (key: string, value: string) => {
        const next = { ...activeFilters };

        if (value) {
            next[key] = value;
        } else {
            delete next[key];
        }

        setActiveFilters(next);
        navigateWithFilters(currentTab, searchValue, next);
    };

    const clearFilters = () => {
        const cleared: Record<string, string> = {};
        setActiveFilters(cleared);
        navigateWithFilters(currentTab, searchValue, cleared);
    };

    const canRequestCollaboration = (idea: Idea) => {
        const isOpen = idea.status === 'draft' || idea.status === 'submitted' || idea.status === 'revision_requested';

        return isOpen
            && idea.collaboration_enabled
            && idea.author?.id !== auth.user.id
            && idea.collaboration_status !== 'pending'
            && idea.collaboration_status !== 'approved';
    };

    const collabIdea = ideasData.data.find((i) => i.slug === collabIdeaSlug);

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const hasSearch = searchValue.length > 0;

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

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
        <>
            <Head title="Ideas" />

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                    {/* Top bar */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={activeTips['nav-back']} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, 'nav-back': open }))}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="warning" onClick={goBack}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Back</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={activeTips['nav-new']} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, 'nav-new': open }))}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.create()}>
                                            <Plus className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New Idea</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">New Idea</span>
                        </div>
                    </div>

                    <Heading
                        title="Ideas"
                        description="Browse and manage innovation ideas"
                    />

                    <StatsCards
                        label="Overview"
                        summary={`${ideaStats.total} ideas · ${ideaStats.drafts} drafts · ${ideaStats.under_review} in review`}
                        items={[
                            { title: 'Total Ideas', value: ideaStats.total, description: 'Ideas submitted', icon: <Lightbulb className="text-sky-600 dark:text-sky-400" /> },
                            { title: 'Drafts', value: ideaStats.drafts, description: 'Awaiting submission', icon: <SquarePen className="text-amber-600 dark:text-amber-400" /> },
                            { title: 'Under Review', value: ideaStats.under_review, description: 'Awaiting decision', icon: <ClipboardCheck className="text-violet-600 dark:text-violet-400" /> },
                            { title: 'Approved', value: ideaStats.approved, description: 'Ideas approved', icon: <CheckCircle className="text-emerald-600 dark:text-emerald-400" /> },
                        ]}
                    />

                    <div className="flex items-center gap-2">
                        <SearchInput
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder="Search ideas by title or description..."
                        />

                        <FilterModal
                            statuses={IDEA_STATUSES}
                            categories={categories}
                            filters={activeFilters}
                            onFilterChange={updateFilter}
                            onClear={clearFilters}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </div>

                    <Tabs
                        value={currentTab}
                        onValueChange={(tab) => {
                            if (searchDebounceRef.current) {
                                clearTimeout(searchDebounceRef.current);
                            }

                            const params = new URLSearchParams();

                            if (tab !== 'my-ideas') {
                                params.set('tab', tab);
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
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${idea.id}-view`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-view`]: open }))}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="info" size="icon" asChild>
                                                                            <Link href={ideas.show(idea.slug)}>
                                                                                <Eye className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>View</TooltipContent>
                                                                </Tooltip>
                                                                <span className="text-[10px] leading-tight text-muted-foreground">View</span>
                                                            </div>

                                                            {(currentTab === 'my-ideas' || (currentTab === 'open-for-collaboration' && idea.author?.id === auth.user.id)) && (idea.collaboration_enabled || idea.collaboration_status) && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-collab`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-collab`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="success" size="icon" asChild>
                                                                                <Link href={ideas.collaborations.index(idea.slug)}>
                                                                                    <Users className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Team</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Team</span>
                                                                </div>
                                                            )}

                                                            {currentTab === 'my-ideas' && idea.status === 'draft' && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-edit`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-edit`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="success" size="icon" asChild>
                                                                                <Link href={ideas.edit(idea.slug)}>
                                                                                    <SquarePen className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Edit</span>
                                                                </div>
                                                            )}

                                                            {currentTab === 'my-ideas' && idea.status === 'revision_requested' && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-resubmit`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-resubmit`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="warning" size="icon" asChild>
                                                                                <Link href={ideas.edit(idea.slug)}>
                                                                                    <RotateCcw className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Resubmit</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Resubmit</span>
                                                                </div>
                                                            )}

                                                            {currentTab === 'my-ideas' && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-delete`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-delete`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="destructive"
                                                                                size="icon"
                                                                                onClick={() => setDeleteIdea(idea)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Delete</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Delete</span>
                                                                </div>
                                                            )}

                                                            {currentTab === 'open-for-collaboration' && canRequestCollaboration(idea) && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-request`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-request`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="success"
                                                                                size="icon"
                                                                                onClick={() => setCollabIdeaSlug(idea.slug)}
                                                                            >
                                                                                <UserPlus className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Request</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Request</span>
                                                                </div>
                                                            )}

                                                            {currentTab === 'open-for-collaboration' && idea.collaboration_status === 'approved' && (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Tooltip open={activeTips[`${idea.id}-propose`]} onOpenChange={(open) => setActiveTips((prev) => ({ ...prev, [`${idea.id}-propose`]: open }))}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="premium" size="icon" asChild>
                                                                                <Link href={ideas.changes.create(idea.slug)}>
                                                                                    <FileEdit className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Propose</TooltipContent>
                                                                    </Tooltip>
                                                                    <span className="text-[10px] leading-tight text-muted-foreground">Propose</span>
                                                                </div>
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
                                onSuccess={() => setCollabIdeaSlug(null)}
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
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}w ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

IdeaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
    ],
};
