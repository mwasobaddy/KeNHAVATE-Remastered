import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, FileEdit, ListFilter, MessageSquare, Search, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type User = { id: number; name: string };

type ChangeRequest = {
    id: number;
    status: string;
    proposed_data: { field: string }[];
    notes: string | null;
    feedback: string | null;
    created_at: string;
    proposer: User;
    reviewer: User | null;
    user_id: number;
    idea: { slug: string; title: string };
    hidden_by_user: boolean;
};

type Props = {
    pending: ChangeRequest[];
    all: ChangeRequest[];
    search: string | null;
    filters: Record<string, string>;
};

const statusStyles: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const CHANGE_STATUSES = ['pending', 'approved', 'rejected'] as const;

function ChangeRequestCard({ cr }: { cr: ChangeRequest }) {
    const [tipReview, setTipReview] = useState(false);
    const [tipHide, setTipHide] = useState(false);

    const handleHide = () => {
        router.post(
            ideas.changes.hide([cr.idea.slug, cr.id]),
            {},
            { preserveState: true },
        );
    };

    const handleUnhide = () => {
        router.post(
            ideas.changes.unhide([cr.idea.slug, cr.id]),
            {},
            { preserveState: true },
        );
    };

    return (
        <Card className={cr.hidden_by_user ? 'opacity-40' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <CardTitle className="truncate text-base">{cr.idea.title}</CardTitle>
                        <Badge variant="outline" className={(statusStyles[cr.status] ?? '') + ' shrink-0'}>
                            {cr.status}
                        </Badge>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipReview} onOpenChange={setTipReview}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.changes.show([cr.idea.slug, cr.id])} onClick={() => setTipReview(true)}>
                                            <FileEdit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Review</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Review</span>
                        </div>
                        {cr.status !== 'pending' && (
                            <div className="flex flex-col items-center gap-1">
                                {cr.hidden_by_user ? (
                                    <Tooltip open={tipHide} onOpenChange={setTipHide}>
                                        <TooltipTrigger asChild>
                                            <Button variant="info" size="icon" onClick={() => {
                                                setTipHide(true); handleUnhide();
                                            }}>
                                                <EyeOff className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Unhide</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Tooltip open={tipHide} onOpenChange={setTipHide}>
                                        <TooltipTrigger asChild>
                                            <Button variant="info" size="icon" onClick={() => {
                                                setTipHide(true); handleHide();
                                            }}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Hide</TooltipContent>
                                    </Tooltip>
                                )}
                                <span className="text-[10px] leading-tight text-muted-foreground text-center">
                                    {cr.hidden_by_user ? 'Unhide' : 'Hide'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    {(cr.proposed_data ?? []).length} field{(cr.proposed_data ?? []).length !== 1 ? 's' : ''} proposed by {cr.proposer.name}
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {(cr.proposed_data ?? []).map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                            {c.field}
                        </Badge>
                    ))}
                </div>
                {cr.notes && (
                    <p className="mb-3 text-sm text-muted-foreground">{cr.notes}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{cr.created_at}</span>
                    {cr.reviewer && (
                        <span>Reviewed by {cr.reviewer.name}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Pending({ pending, all, filters: initialFilters, search: initialSearch }: Props) {
    const [showAll, setShowAll] = useState(() => new URLSearchParams(window.location.search).get('show_all') === 'true');
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigateWithFilters = (searchVal: string, filterOverrides?: Record<string, string>) => {
        const params = new URLSearchParams();
        const filters = filterOverrides ?? activeFilters;

        if (searchVal) {
            params.set('search', searchVal);
        }

        if (showAll) {
            params.set('show_all', 'true');
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

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const handleToggleShowAll = () => {
        const newShowAll = !showAll;
        setShowAll(newShowAll);
        const params = new URLSearchParams();

        if (newShowAll) {
            params.set('show_all', 'true');
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
        router.get(window.location.pathname + (qs ? `?${qs}` : ''), {}, { preserveState: true, preserveScroll: true });
    };

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.index().url);
        }
    };

    const items = showAll ? all : pending;

    return (
        <>
            <Head title="Change Requests Inbox" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Top bar */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>

                    <div className="flex items-start gap-4">

                        <div className="flex flex-col items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.changes.mine()}>
                                            <Send className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Outbox</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Outbox</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon" onClick={handleToggleShowAll}>
                                        <ListFilter className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{showAll ? 'Show pending only' : 'Show all'}</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Filter</span>
                        </div>
                    </div>
                </div>

                <Heading
                    title="Change Requests Inbox"
                    description="Change requests awaiting your review"
                />

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Search by idea, status, or proposer..."
                    />
                    <FilterModal
                        statuses={CHANGE_STATUSES}
                        categories={[]}
                        filters={activeFilters}
                        onFilterChange={updateFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12">
                            {searchValue || hasActiveFilters ? (
                                <>
                                    <Search className="h-10 w-10 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        No changes match your search.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        {showAll
                                            ? 'No change requests for your ideas.'
                                            : 'No change requests pending your review.'}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {items.map((cr) => (
                            <ChangeRequestCard key={cr.id} cr={cr} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Pending.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Change Requests Inbox', href: '/ideas/changes/pending' },
    ],
};
