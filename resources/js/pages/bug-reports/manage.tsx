import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bug, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import { decodeHtmlEntities } from '@/lib/utils';
import bugReports from '@/routes/bug-reports';

type Attachment = {
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
};

type User = {
    id: number;
    name: string;
};

type Report = {
    id: number;
    title: string;
    description: string;
    status: string;
    user: User;
    reviewer: User | null;
    reviewer_notes: string | null;
    reviewed_at: string | null;
    created_at: string;
    attachments: Attachment[];
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    reports: PaginatedData<Report>;
    activeTab?: string;
};

const REVIEWED_STATUSES = ['accepted', 'rejected'] as const;

const statusConfig: Record<string, { label: string; icon: typeof Clock; class: string }> = {
    pending: { label: 'Pending', icon: Clock, class: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    accepted: { label: 'Accepted', icon: CheckCircle, class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
    rejected: { label: 'Rejected', icon: XCircle, class: 'text-red-600 dark:text-red-400 bg-red-500/10' },
};

export default function ManageBugReports({ reports, activeTab = 'pending' }: Props) {
    const [rejectDialog, setRejectDialog] = useState<{ report: Report; notes: string } | null>(null);

    const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
        const params = new URLSearchParams(window.location.search);
        const f: Record<string, string> = {};
        const status = params.get('status');
        const dateFrom = params.get('date_from');
        const dateTo = params.get('date_to');
        if (status) f.status = status;
        if (dateFrom) f.date_from = dateFrom;
        if (dateTo) f.date_to = dateTo;

        return f;
    });

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    const navigateWithFilters = (searchVal: string, filterOverrides?: Record<string, string>) => {
        const params = new URLSearchParams();
        const filters = filterOverrides ?? activeFilters;

        params.set('tab', 'reviewed');

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
        setSearch(value);

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
        navigateWithFilters(search, next);
    };

    const clearFilters = () => {
        const cleared: Record<string, string> = {};
        setActiveFilters(cleared);
        navigateWithFilters(search, cleared);
    };

    const items = reports.data;
    const totalReports = reports.total ?? 0;

    function renderPagination() {
        if (reports.last_page <= 1) return null;

        return (
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {reports.from} to {reports.to} of {reports.total} entries
                </p>
                <div className="flex gap-2">
                    {reports.links.map((link, i) => {
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
            </div>
        );
    }

    return (
        <>
            <Head title="Manage Bug Reports" />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                </div>

                <Heading title="Manage Bug Reports" description="Review and validate bug reports submitted by users." />

                {totalReports === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <Bug className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No reports yet</p>
                            <p className="text-sm text-muted-foreground">
                                Bug reports will appear here once users submit them.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs value={activeTab} onValueChange={(v) => router.visit(`/bug-reports/manage?tab=${v}`, { preserveState: true, preserveScroll: true })}>
                        <TabsList>
                            <TabsTrigger value="pending">
                                Pending
                            </TabsTrigger>
                            <TabsTrigger value="reviewed">
                                Reviewed
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="space-y-4">
                            {items.length > 0 ? (
                                <>
                                    {items.map((report) => (
                                        <ReviewCard key={report.id} report={report} onReject={(r) => setRejectDialog({ report: r, notes: '' })} />
                                    ))}
                                    {renderPagination()}
                                </>
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                                        <CheckCircle className="h-12 w-12 text-emerald-500/50" />
                                        <p className="text-lg font-medium">All caught up!</p>
                                        <p className="text-sm text-muted-foreground">
                                            No pending reports to review.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="reviewed" className="space-y-4">
                            <div className="flex items-center gap-2">
                                <SearchInput
                                    value={search}
                                    onChange={handleSearchChange}
                                    placeholder="Search by title, description, or reporter..."
                                />
                                <FilterModal
                                    statuses={REVIEWED_STATUSES}
                                    categories={[]}
                                    filters={activeFilters}
                                    onFilterChange={updateFilter}
                                    onClear={clearFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Reviewed Reports</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left text-muted-foreground">
                                                    <th className="pb-3 pr-4 font-medium">Title</th>
                                                    <th className="pb-3 pr-4 font-medium">Reporter</th>
                                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                                    <th className="pb-3 pr-4 font-medium">Review Notes</th>
                                                    <th className="pb-3 font-medium">Reviewed At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length > 0 ? (
                                                    items.map((report) => {
                                                        const config = statusConfig[report.status] ?? statusConfig.pending;
                                                        const Icon = config.icon;

                                                        return (
                                                            <tr key={report.id} className="border-b last:border-0">
                                                                <td className="py-3 pr-4">
                                                                    <div className="max-w-xs truncate font-medium">
                                                                        {report.title}
                                                                    </div>
                                                                    <div className="truncate text-xs text-muted-foreground">
                                                                        {report.description}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 pr-4 whitespace-nowrap">
                                                                    {report.user.name}
                                                                </td>
                                                                <td className="py-3 pr-4">
                                                                    <Badge variant="secondary" className={`flex w-fit items-center gap-1 ${config.class}`}>
                                                                        <Icon className="h-3 w-3" />
                                                                        {config.label}
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-3 pr-4 max-w-xs">
                                                                    <span className="truncate text-muted-foreground">
                                                                        {report.reviewer_notes ?? '—'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 whitespace-nowrap text-muted-foreground">
                                                                    {report.reviewed_at ? formatDate(report.reviewed_at) : '—'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                            {search || hasActiveFilters
                                                                ? 'No reviewed reports match your search or filters.'
                                                                : 'No reviewed reports yet.'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {renderPagination()}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            <Dialog open={rejectDialog !== null} onOpenChange={(open) => { if (!open) setRejectDialog(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Bug Report</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this report. This feedback will be shared with the submitter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="reject-notes">Reason for rejection</Label>
                        <Textarea
                            id="reject-notes"
                            rows={3}
                            placeholder="Explain why this report is being rejected..."
                            value={rejectDialog?.notes ?? ''}
                            onChange={(e) => setRejectDialog((prev) => prev ? { ...prev, notes: e.target.value } : null)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRejectDialog(null)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!rejectDialog?.notes?.trim()}
                            onClick={() => {
                                if (!rejectDialog) return;
                                router.post(bugReports.review(rejectDialog.report.id).url, {
                                    action: 'reject',
                                    notes: rejectDialog.notes,
                                });
                                setRejectDialog(null);
                            }}
                        >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ReviewCard({ report, onReject }: { report: Report; onReject: (report: Report) => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        by {report.user.name} &middot; {formatDate(report.created_at)}
                    </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                    <Clock className="h-3 w-3" />
                    Pending
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>

                {report.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Attachments:</span>
                        {report.attachments.map((att) => (
                            <div
                                key={att.id}
                                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground"
                            >
                                <FileText className="h-3 w-3" />
                                {att.original_name}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                            router.post(bugReports.review(report.id).url, {
                                action: 'accept',
                                notes: null,
                            });
                        }}
                    >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(report)}
                    >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

ManageBugReports.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Bug Reports', href: bugReports.manage().url },
    ],
};
