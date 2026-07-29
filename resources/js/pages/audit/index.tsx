import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { decodeHtmlEntities } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AuditLog = {
    id: number;
    user: { id: number; name: string; email: string | null };
    action: string;
    description: string | null;
    created_at: string;
};

type PaginatedData = {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    logs: PaginatedData;
};

const AUDIT_ACTIONS = [
    'otp_requested',
    'login',
    'account_created',
    'onboarding_completed',
    'terms_accepted',
    'point_awarded',
] as const;

const actionLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    otp_requested: { label: 'OTP Requested', variant: 'outline' },
    login: { label: 'Login', variant: 'default' },
    account_created: { label: 'Account Created', variant: 'secondary' },
    onboarding_completed: { label: 'Onboarding Completed', variant: 'default' },
    terms_accepted: { label: 'Terms Accepted', variant: 'secondary' },
    point_awarded: { label: 'Point Awarded', variant: 'default' },
};

function actionBadge(action: string) {
    const config = actionLabels[action] ?? { label: action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function AuditIndex({ logs }: Props) {
    const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');

    const updateSearch = (value: string) => {
        setSearch(value);
        const params = new URLSearchParams(window.location.search);

        if (value) {
params.set('search', value);
} else {
params.delete('search');
}

        const qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };

    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
        const p = new URLSearchParams(window.location.search);
        const f: Record<string, string> = {};
        const status = p.get('status');
        const date_from = p.get('date_from');
        const date_to = p.get('date_to');

        if (status) {
f.status = status;
}

        if (date_from) {
f.date_from = date_from;
}

        if (date_to) {
f.date_to = date_to;
}

        return f;
    });

    const filtered = useMemo(() => {
        let result = logs.data;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (log) => log.user.name.toLowerCase().includes(q)
                    || (log.description && log.description.toLowerCase().includes(q))
                    || log.action.toLowerCase().includes(q),
            );
        }

        if (activeFilters.status) {
            const selected = activeFilters.status.split(',');
            result = result.filter((log) => selected.includes(log.action));
        }

        if (activeFilters.date_from) {
            const from = new Date(activeFilters.date_from);
            result = result.filter((log) => new Date(log.created_at) >= from);
        }

        if (activeFilters.date_to) {
            const to = new Date(activeFilters.date_to);
            to.setHours(23, 59, 59, 999);
            result = result.filter((log) => new Date(log.created_at) <= to);
        }

        return result;
    }, [logs.data, search, activeFilters]);

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const syncFiltersUrl = (filters: Record<string, string>) => {
        const params = new URLSearchParams(window.location.search);

        for (const [k, v] of Object.entries(filters)) {
            if (v) {
params.set(k, v);
} else {
params.delete(k);
}
        }

        const qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };

    const updateFilter = (key: string, value: string) => {
        setActiveFilters((prev) => {
            const next = { ...prev };

            if (value) {
                next[key] = value;
            } else {
                delete next[key];
            }

            syncFiltersUrl(next);

            return next;
        });
    };

    const clearFilters = () => {
        setActiveFilters({});
        const params = new URLSearchParams(window.location.search);
        params.delete('status');
        params.delete('date_from');
        params.delete('date_to');
        params.delete('search');
        const qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const isFiltering = !!search.trim() || hasActiveFilters;

    return (
        <>
            <Head title="Audit Log" />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
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
                    title="Audit Log"
                    description="System-wide activity trail"
                />

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={search}
                        onChange={updateSearch}
                        placeholder="Search by user, action, or details..."
                    />

                    <FilterModal
                        statuses={AUDIT_ACTIONS}
                        categories={[]}
                        filters={activeFilters}
                        onFilterChange={updateFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">User</th>
                                        <th className="pb-3 pr-4 font-medium">Action</th>
                                        <th className="pb-3 pr-4 font-medium">Details</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map((log) => (
                                            <tr key={log.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium">{log.user.name}</div>
                                                    {log.user.email && (
                                                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4">{actionBadge(log.action)}</td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {log.description ?? '—'}
                                                </td>
                                                <td className="py-3 whitespace-nowrap text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                {search || hasActiveFilters
                                                    ? 'No activity matches your search or filters.'
                                                    : 'No activity recorded yet.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {isFiltering ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                                Showing {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                            </p>
                        ) : logs.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {logs.from} to {logs.to} of {logs.total} entries
                                </p>
                                <div className="flex gap-2">
                                    {logs.links.map((link, i) => {
                                        if (!link.url || link.label === '...') {
                                            return (
                                                <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                    {decodeHtmlEntities(link.label)}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={link.url}
                                                    preserveState
                                                    preserveScroll
                                                >
                                                    {decodeHtmlEntities(link.label)}
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
        </>
    );
}
