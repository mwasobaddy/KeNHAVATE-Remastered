import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import Heading from '@/components/heading';
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
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

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

export default function Mine({ changeRequests }: Props) {
    const sorted = useMemo(
        () => [...changeRequests].sort((a, b) => Number(a.hidden_by_user) - Number(b.hidden_by_user)),
        [changeRequests],
    );

    return (
        <>
            <Head title="My Change Requests" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="My Change Requests"
                    description="Changes you have proposed"
                />

                {sorted.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                You haven't proposed any changes yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sorted.map((cr) => (
                            <ChangeRequestCard key={cr.id} cr={cr} />
                        ))}
                    </div>
                )}

                <Button variant="outline" asChild className="self-start">
                    <Link href={ideas.index()}>Back to Ideas</Link>
                </Button>
            </div>
        </>
    );
}
