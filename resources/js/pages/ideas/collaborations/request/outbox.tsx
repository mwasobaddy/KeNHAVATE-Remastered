import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, FileEdit, Inbox, Send } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type CollaborationRequest = {
    id: number;
    status: string;
    message: string;
    feedback: string | null;
    created_at: string;
    reviewer: { id: number; name: string } | null;
    idea: { slug: string; title: string; author: { id: number; name: string } | null };
};

type Props = {
    requests: {
        data: CollaborationRequest[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function Outbox({ requests }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.index().url);
        }
    };

    return (
        <>
            <Head title="Sent Collaboration Requests" />

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
                        <Button size="icon" variant="outline" asChild>
                            <Link href={ideas.collaborations.inbox()}>
                                <Inbox className="h-5 w-5" />
                            </Link>
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Inbox</span>
                    </div>
                </div>

                <Heading
                    title="Sent Requests"
                    description="Collaboration requests you have sent to idea authors"
                />

                {requests.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12">
                            <Send className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                You haven't sent any collaboration requests yet.
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                Browse ideas open for collaboration and request to join.
                            </p>
                            <Button asChild size="sm">
                                <Link href={ideas.index({ query: { tab: 'open-for-collaboration' } })}>
                                    Browse Open Ideas
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requests.data.map((req) => (
                            <Card key={req.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <CardTitle className="truncate text-base">
                                                {req.idea.title}
                                            </CardTitle>
                                            <Badge className="shrink-0" variant={statusVariant[req.status] ?? 'outline'}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="border-blue-500/30" asChild>
                                                        <Link href={ideas.show(req.idea.slug)}>
                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View Idea</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span tabIndex={0}>
                                                        {req.status === 'approved' ? (
                                                            <Button variant="outline" size="icon" className="border-purple-500/30" asChild>
                                                                <Link href={ideas.changes.create(req.idea.slug)}>
                                                                    <FileEdit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" size="icon" className="border-purple-500/30" disabled>
                                                                <FileEdit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                            </Button>
                                                        )}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {req.status === 'approved'
                                                        ? 'Request Change'
                                                        : req.status === 'pending'
                                                            ? 'Awaiting approval before you can propose changes'
                                                            : 'Request was rejected'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3 text-sm text-muted-foreground">
                                        Author: <span className="font-medium text-foreground">
                                            {req.idea.author?.name ?? 'Unknown'}
                                        </span>
                                    </div>
                                    <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {req.message}
                                    </p>

                                    {req.feedback && (
                                        <div className="mb-3 rounded-md bg-muted p-3 text-sm">
                                            <span className="font-medium">Author's feedback: </span>
                                            {req.feedback}
                                        </div>
                                    )}

                                    {req.reviewer && (
                                        <div className="text-xs text-muted-foreground">
                                            Reviewed by {req.reviewer.name} on{' '}
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    )}

                                    {!req.reviewer && req.status === 'pending' && (
                                        <div className="text-xs text-muted-foreground">
                                            Sent on {new Date(req.created_at).toLocaleDateString()} — awaiting response
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {requests.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {requests.from} to {requests.to} of {requests.total} entries
                                </p>
                                <div className="flex gap-2">
                                    {requests.links.map((link, i) => {
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
                    </div>
                )}
            </div>
        </>
    );
}
