import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

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
    return (
        <>
            <Head title="Audit Log" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Audit Log"
                    description="System-wide activity trail"
                />

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
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
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
                                                No activity recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {logs.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {logs.from} to {logs.to} of {logs.total} entries
                                </p>
                                <div className="flex gap-2">
                                    {logs.links.map((link, i) => {
                                        if (!link.url || link.label === '...') {
                                            return (
                                                <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                    {link.label}
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

                <div className="flex justify-start">
                    <Button variant="outline" asChild>
                        <Link href={dashboard()}>Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
