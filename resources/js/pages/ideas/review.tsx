import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck, ClipboardList, Eye, Search, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SearchInput from '@/components/search-input';
import StatsCards from '@/components/stats-cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Officer = {
    id: number;
    name: string;
    email: string;
};

type Review = {
    id: number;
    stage: string;
    action: string;
    created_at: string;
};

type IdeaItem = {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    author: { id: number; name: string };
    category: { id: number; name: string } | null;
    assigned_officer?: { id: number; name: string } | null;
    reviews?: Review[];
};

type PaginatedData = {
    data: IdeaItem[];
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

type ReviewStats = {
    in_pipeline: number;
    pending_assignment: number;
    in_queue: number;
    reviewed: number;
};

type Props = {
    currentTab: string;
    pendingAssignment: PaginatedData | null;
    myQueue: PaginatedData | null;
    reviewed: PaginatedData | null;
    canAssign: boolean;
    canClassify: boolean;
    canRecordDecision: boolean;
    officers: Officer[];
    categories: Category[];
    filters: Record<string, string>;
    search: string | null;
    reviewStats: ReviewStats;
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
    budget_logged: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
};

const actionLabels: Record<string, string> = {
    assigned: 'You assigned this',
    classified: 'You classified this',
    approved: 'You approved this',
    declined: 'You declined this',
    deferred: 'You deferred this',
    budget_logged: 'You logged budget',
    in_progress: 'You marked in progress',
    completed: 'You completed this',
    implemented: 'You implemented this',
    closed: 'You closed this',
    requested: 'You requested revision',
    resubmitted: 'You resubmitted this',
};

const actionStyles: Record<string, string> = {
    assigned: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    classified: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
    approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    declined: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    deferred: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    budget_logged: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    in_progress: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    implemented: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    requested: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    resubmitted: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
};

const tabs = [
    { key: 'assign-officer', label: 'Assign Officer' },
    { key: 'my-queue', label: 'My Queue' },
    { key: 'reviewed', label: 'Reviewed' },
] as const;

function navigateWithFilters(currentTab: string, searchValue: string, activeFilters: Record<string, string>) {
    const params = new URLSearchParams();

    if (currentTab !== 'assign-officer') {
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

    router.get(ideas.review().url + (qs ? `?${qs}` : ''), {}, { preserveState: true, preserveScroll: true });
}

function latestReviewAction(idea: IdeaItem): string | null {
    if (!idea.reviews || idea.reviews.length === 0) {
        return null;
    }

    const latest = idea.reviews.reduce((a, b) =>
        new Date(a.created_at) > new Date(b.created_at) ? a : b,
    );

    return latest.action;
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

export default function ReviewIndex({ currentTab, pendingAssignment, myQueue, reviewed, canAssign, canClassify, canRecordDecision, officers, categories, filters: initialFilters, search: initialSearch, reviewStats }: Props) {
    const canQueue = canClassify || canRecordDecision;
    const availableTabs = tabs.filter((t) => {
        if (t.key === 'assign-officer') {
            return canAssign;
        }

        return canQueue;
    });
    const currentData = { 'assign-officer': pendingAssignment, 'my-queue': myQueue, reviewed }[currentTab] ?? null;
    const visibleTabs = availableTabs.length > 1;
    const [assigningSlug, setAssigningSlug] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const hasSearch = searchValue.length > 0;

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const tabLabel = tabs.find((t) => t.key === currentTab)?.label ?? 'Review';

    const tableColspan = currentTab === 'assign-officer' ? 6 : currentTab === 'reviewed' ? 7 : 6;

    return (
        <TooltipProvider>
            <>
                <Head title="Review Dashboard" />

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                    {/* Top bar */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <Button size="icon" variant="warning" onClick={goBack}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                        </div>
                    </div>

                    <Heading
                        title="Review Dashboard"
                        description="Manage ideas in the review pipeline"
                    />

                    <StatsCards
                        label="Pipeline Overview"
                        summary={`${reviewStats.in_pipeline} in pipeline · ${reviewStats.pending_assignment} pending · ${reviewStats.in_queue} in my queue`}
                        items={[
                            { title: 'In Pipeline', value: reviewStats.in_pipeline, description: 'Ideas under review', icon: <ClipboardList className="text-sky-600 dark:text-sky-400" /> },
                            { title: 'Pending Assignment', value: reviewStats.pending_assignment, description: 'Awaiting officer', icon: <UserPlus className="text-amber-600 dark:text-amber-400" /> },
                            { title: 'My Queue', value: reviewStats.in_queue, description: 'Awaiting your action', icon: <ClipboardCheck className="text-violet-600 dark:text-violet-400" /> },
                            { title: 'Reviewed', value: reviewStats.reviewed, description: 'You have reviewed', icon: <Eye className="text-emerald-600 dark:text-emerald-400" /> },
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

                    {visibleTabs && (
                        <Tabs
                            value={currentTab}
                            onValueChange={(tab) => {
                                if (searchDebounceRef.current) {
                                    clearTimeout(searchDebounceRef.current);
                                }

                                const params = new URLSearchParams();

                                if (tab !== 'assign-officer') {
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

                                router.get(ideas.review().url + (qs ? `?${qs}` : ''), {}, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                        >
                            <TabsList className="w-full justify-start">
                                {availableTabs.map((tab) => (
                                    <TabsTrigger key={tab.key} value={tab.key}>
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>{tabLabel}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">Title</th>
                                            <th className="pb-3 pr-4 font-medium">Category</th>
                                            <th className="pb-3 pr-4 font-medium">Author</th>
                                            <th className="pb-3 pr-4 font-medium">Status</th>
                                            {currentTab !== 'assign-officer' && (
                                                <th className="pb-3 pr-4 font-medium">Officer</th>
                                            )}
                                            {currentTab === 'reviewed' && (
                                                <th className="pb-3 pr-4 font-medium">Your Action</th>
                                            )}
                                            <th className="pb-3 pr-4 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData && currentData.data.length > 0 ? (
                                            currentData.data.map((idea) => {
                                                const action = latestReviewAction(idea);

                                                return (
                                                    <tr key={idea.id} className="border-b last:border-0">
                                                        <td className="py-3 pr-4">
                                                            <Link
                                                                href={ideas.reviewShow(idea.slug)}
                                                                className="font-medium hover:text-sky-600 dark:hover:text-sky-400"
                                                            >
                                                                {idea.title}
                                                            </Link>
                                                        </td>
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {idea.category?.name ?? 'Uncategorized'}
                                                        </td>
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {idea.author.name}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <Badge variant="outline" className={statusStyles[idea.status] ?? ''}>
                                                                {idea.status.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </td>
                                                        {currentTab !== 'assign-officer' && (
                                                            <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                                                {idea.assigned_officer?.name ?? '—'}
                                                            </td>
                                                        )}
                                                        {currentTab === 'reviewed' && (
                                                            <td className="py-3 pr-4">
                                                                {action && (
                                                                    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${actionStyles[action] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                                        {actionLabels[action] ?? `You ${action}`}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                                            {formatDate(idea.created_at)}
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-0.5">
                                                                {canAssign && currentTab === 'assign-officer' && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="border-teal-500/30"
                                                                                onClick={() => setAssigningSlug(idea.slug)}
                                                                            >
                                                                                <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Assign Officer</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="outline" size="icon" className="border-blue-500/30" asChild>
                                                                            <Link href={ideas.reviewShow(idea.slug)}>
                                                                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Review</TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={tableColspan} className="py-12 text-center text-muted-foreground">
                                                    {hasSearch || hasActiveFilters ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>No ideas match your search or filters.</p>
                                                        </div>
                                                    ) : currentTab === 'assign-officer' ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>No ideas pending assignment.</p>
                                                        </div>
                                                    ) : currentTab === 'my-queue' ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <ClipboardCheck className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>Nothing requires your action right now.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Eye className="h-8 w-8 text-muted-foreground/50" />
                                                            <p>You haven't reviewed any ideas yet.</p>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {currentData && currentData.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {currentData.from} to {currentData.to} of {currentData.total} entries
                                    </p>
                                    <div className="flex gap-2">
                                        {currentData.links.map((link, i) => {
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

                <Dialog open={assigningSlug !== null} onOpenChange={(open) => {
                    if (!open) {
                        setAssigningSlug(null);
                    }
                }}>
                    {assigningSlug && (
                        <AssignOfficerDialog ideaSlug={assigningSlug} onClose={() => setAssigningSlug(null)} officers={officers} currentData={currentData} />
                    )}
                </Dialog>
            </>
        </TooltipProvider>
    );
}

ReviewIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Review Dashboard', href: '/ideas/review' },
    ],
};

function AssignOfficerDialog({ ideaSlug, onClose, officers, currentData }: { ideaSlug: string; onClose: () => void; officers: Officer[]; currentData: PaginatedData | null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        officer_id: undefined as number | undefined,
    });

    function handleAssign() {
        post(ideas.assign(ideaSlug), {
            preserveState: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Assign RI&KM Officer</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
                Assign an officer to review this idea.
            </p>

            <div className="grid gap-2">
                <Label htmlFor="officer_id">Officer</Label>
                <select
                    id="officer_id"
                    name="officer_id"
                    value={data.officer_id ?? ''}
                    onChange={(e) => setData('officer_id', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                >
                    <option value="">Select an officer...</option>
                    {officers.filter((o) => {
                        const idea = currentData?.data.find((i) => i.slug === ideaSlug);

                        return o.id !== (idea?.author.id ?? -1);
                    }).map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name} ({o.email})
                        </option>
                    ))}
                </select>
                <InputError message={errors.officer_id} />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="button" disabled={processing || !data.officer_id} onClick={handleAssign}>
                    {processing ? 'Assigning...' : 'Assign Officer'}
                </Button>
            </div>
        </DialogContent>
    );
}
