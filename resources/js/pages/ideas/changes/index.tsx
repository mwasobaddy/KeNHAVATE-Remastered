import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ideas from '@/routes/ideas';

type User = { id: number; name: string };

type ChangeRequest = {
    id: number;
    status: string;
    proposed_data: { field: string; old_value: string; new_value: string }[];
    notes: string | null;
    feedback: string | null;
    created_at: string;
    proposer: User;
    reviewer: User | null;
};

type Props = {
    idea: { slug: string; title: string; author: User };
    changeRequests: { data: ChangeRequest[] };
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function ChangeRequestIndex({ idea, changeRequests }: Props) {
    return (
        <>
            <Head title={`Changes - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Change Requests"
                        description={`For: ${idea.title}`}
                    />
                    <Button asChild>
                        <Link href={ideas.changes.create(idea.slug)}>
                            Propose Changes
                        </Link>
                    </Button>
                </div>

                {changeRequests.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No change requests yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {changeRequests.data.map((cr) => (
                            <Card key={cr.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">
                                            {cr.proposer.name} &mdash; {cr.proposed_data.length} field{cr.proposed_data.length !== 1 ? 's' : ''} changed
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusVariant[cr.status] ?? 'outline'}>
                                                {cr.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {cr.notes && (
                                        <p className="mb-2 text-sm text-muted-foreground">{cr.notes}</p>
                                    )}
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {cr.proposed_data.map((c, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {c.field}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{cr.created_at}</span>
                                        {cr.reviewer && (
                                            <span>Reviewed by {cr.reviewer.name}</span>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-3" asChild>
                                        <Link href={ideas.changes.show([idea.slug, cr.id])}>
                                            Review
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Button variant="outline" asChild>
                    <Link href={ideas.show(idea.slug)}>Back to Idea</Link>
                </Button>
            </div>
        </>
    );
}
