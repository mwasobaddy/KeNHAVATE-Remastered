import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ideas from '@/routes/ideas';

type CollaborationRequest = {
    id: number;
    status: string;
    message: string;
    feedback: string | null;
    created_at: string;
    user: { id: number; name: string };
    reviewer: { id: number; name: string } | null;
    idea: { slug: string; title: string };
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

export default function Inbox({ requests }: Props) {
    return (
        <>
            <Head title="Collaboration Inbox" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Collaboration Inbox"
                        description="Requests from users who want to collaborate on your ideas"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={ideas.collaborations.outbox()}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Go to Sent Requests
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={ideas.index()}>Back to Ideas</Link>
                        </Button>
                    </div>
                </div>

                {requests.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                No collaboration requests received yet.
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                When users request to collaborate on your ideas, they will appear here.
                            </p>
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
                                                {req.user.name}
                                            </CardTitle>
                                            <Badge className="shrink-0" variant={statusVariant[req.status] ?? 'outline'}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                                            <Link href={ideas.show(req.idea.slug)}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2 text-sm text-muted-foreground">
                                        On idea: <span className="font-medium text-foreground">{req.idea.title}</span>
                                    </div>
                                    <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {req.message}
                                    </p>

                                    {req.feedback && (
                                        <div className="mb-3 rounded-md bg-muted p-3 text-sm">
                                            <span className="font-medium">Your feedback: </span>
                                            {req.feedback}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                        {req.reviewer && (
                                            <span>Reviewed by you</span>
                                        )}
                                    </div>
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
