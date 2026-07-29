import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bug, CheckCircle, Clock, FileText, Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { decodeHtmlEntities } from '@/lib/utils';
import bugReports from '@/routes/bug-reports';

type Attachment = {
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
};

type Report = {
    id: number;
    title: string;
    description: string;
    status: string;
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
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; class: string }> = {
    pending: { label: 'Pending', icon: Clock, class: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    accepted: { label: 'Accepted', icon: CheckCircle, class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
    rejected: { label: 'Rejected', icon: XCircle, class: 'text-red-600 dark:text-red-400 bg-red-500/10' },
};

export default function MyBugReports({ reports }: Props) {
    return (
        <>
            <Head title="My Bug Reports" />

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
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" asChild>
                            <Link href={bugReports.create().url}>
                                <Plus className="h-5 w-5" />
                            </Link>
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">New Report</span>
                    </div>
                </div>

                <Heading title="My Bug Reports" description="Track the status of your submitted bug reports." />

                {reports.data.length === 0 && reports.total === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <Bug className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No reports yet</p>
                            <p className="text-sm text-muted-foreground">
                                Found a bug? Let us know so we can fix it.
                            </p>
                            <Button asChild>
                                <Link href={bugReports.create().url}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Report a Bug
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reports.data.map((report) => {
                            const config = statusConfig[report.status] ?? statusConfig.pending;
                            const Icon = config.icon;

                            return (
                                <Card key={report.id}>
                                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">{report.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDate(report.created_at)}</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className={`flex items-center gap-1 ${config.class}`}>
                                            <Icon className="h-3 w-3" />
                                            {config.label}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {report.description}
                                        </p>

                                        {report.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
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

                                        {report.reviewer_notes && (
                                            <div className="rounded-md bg-muted/50 p-3 text-sm">
                                                <span className="font-medium">Reviewer notes:</span>{' '}
                                                <span className="text-muted-foreground">{report.reviewer_notes}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {reports.last_page > 1 && (
                            <div className="flex items-center justify-between">
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
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

MyBugReports.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bug Reports', href: bugReports.index().url },
    ],
};
