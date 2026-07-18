import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, MessageSquare, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    changeRequests: ChangeRequest[];
    search: string | null;
    filters: Record<string, string>;
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

const CHANGE_STATUSES = ['pending', 'approved', 'rejected'] as const;

function ChangeRequestCard({ cr }: { cr: ChangeRequest }) {
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
                    <CardTitle className="truncate text-base">{cr.idea.title}</CardTitle>
                    <Badge variant={statusVariant[cr.status] ?? 'outline'} className="shrink-0">
                        {cr.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    {(cr.proposed_data ?? []).length} field{(cr.proposed_data ?? []).length !== 1 ? 's' : ''} proposed
                    {cr.reviewer && <> &middot; Reviewed by {cr.reviewer.name}</>}
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
                    <span>by {cr.proposer.name}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={ideas.changes.show([cr.idea.slug, cr.id])}>
                            Review
                        </Link>
                    </Button>
                    {cr.status !== 'pending' && (
                        <>
                            {cr.hidden_by_user ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUnhide}
                                >
                                    <EyeOff className="mr-1 h-4 w-4" />
                                    Unhide
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleHide}
                                >
                                    <Eye className="mr-1 h-4 w-4" />
                                    Hide
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Mine({ changeRequests, filters: initialFilters, search: initialSearch }: Props) {
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
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

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.index().url);
        }
    };

    return (
        <>
            <Head title="My Change Requests" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Top bar */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="info" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                </div>

                <Heading
                    title="My Change Requests"
                    description="Changes you have proposed"
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

                {changeRequests.length === 0 ? (
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
                                        You haven't proposed any changes yet.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {changeRequests.map((cr) => (
                            <ChangeRequestCard key={cr.id} cr={cr} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Mine.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'My Changes', href: '/ideas/changes/mine' },
    ],
};
