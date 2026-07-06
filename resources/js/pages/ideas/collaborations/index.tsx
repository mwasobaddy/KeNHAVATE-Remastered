import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideas from '@/routes/ideas';

type Collaborator = { id: number; name: string };

type CollaborationRequest = {
    id: number;
    status: string;
    message: string;
    feedback: string | null;
    created_at: string;
    user: Collaborator;
    reviewer: Collaborator | null;
};

type Props = {
    idea: { slug: string; title: string };
    collaborationRequests: { data: CollaborationRequest[] };
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function CollaborationIndex({ idea, collaborationRequests }: Props) {
    return (
        <>
            <Head title={`Collaborations - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Collaboration Requests"
                        description={`For: ${idea.title}`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ideas.collaborations.inbox()}>Inbox</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ideas.collaborations.outbox()}>Sent Requests</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={ideas.show(idea.slug)}>Back to Idea</Link>
                        </Button>
                    </div>
                </div>

                {collaborationRequests.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No collaboration requests yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {collaborationRequests.data.map((cr) => (
                            <Card key={cr.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">
                                            {cr.user.name}
                                        </CardTitle>
                                        <Badge variant={statusVariant[cr.status] ?? 'outline'}>
                                            {cr.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {cr.message}
                                    </p>

                                    {cr.feedback && (
                                        <div className="mb-3 rounded-md bg-muted p-3 text-sm">
                                            <span className="font-medium">Feedback: </span>
                                            {cr.feedback}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{cr.created_at}</span>
                                        {cr.reviewer && (
                                            <span>Reviewed by {cr.reviewer.name}</span>
                                        )}
                                    </div>

                                    {cr.status === 'pending' && (
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <Form
                                                        method="post"
                                                        action={ideas.collaborations.approve([idea.slug, cr.id])}
                                                        className="space-y-3"
                                                    >
                                                        {({ processing, errors }) => (
                                                            <>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`approve-feedback-${cr.id}`}>
                                                                        Feedback (optional)
                                                                    </Label>
                                                                    <Textarea
                                                                        id={`approve-feedback-${cr.id}`}
                                                                        name="feedback"
                                                                        rows={2}
                                                                        placeholder="Optional note..."
                                                                    />
                                                                    <InputError message={errors.feedback} />
                                                                </div>
                                                                <Button type="submit" className="w-full" disabled={processing}>
                                                                    {processing ? 'Approving...' : 'Approve'}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="pt-4">
                                                    <Form
                                                        method="post"
                                                        action={ideas.collaborations.reject([idea.slug, cr.id])}
                                                        className="space-y-3"
                                                    >
                                                        {({ processing, errors }) => (
                                                            <>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`reject-feedback-${cr.id}`}>
                                                                        Feedback (required)
                                                                    </Label>
                                                                    <Textarea
                                                                        id={`reject-feedback-${cr.id}`}
                                                                        name="feedback"
                                                                        rows={2}
                                                                        required
                                                                        placeholder="Explain why..."
                                                                    />
                                                                    <InputError message={errors.feedback} />
                                                                </div>
                                                                <Button type="submit" variant="destructive" className="w-full" disabled={processing}>
                                                                    {processing ? 'Rejecting...' : 'Reject'}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
