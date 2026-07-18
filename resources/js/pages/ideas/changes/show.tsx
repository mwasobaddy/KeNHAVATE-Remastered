import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideas from '@/routes/ideas';

type User = { id: number; name: string };

type Change = {
    field: string;
    old_value: string;
    new_value: string;
};

type ChangeRequest = {
    id: number;
    status: string;
    proposed_data: Change[];
    notes: string | null;
    feedback: string | null;
    created_at: string;
    proposer: User;
    reviewer: User | null;
};

type Props = {
    idea: { slug: string; title: string };
    changeRequest: ChangeRequest;
    canReview: boolean;
};

const fieldLabels: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    problem_statement: 'Problem Statement',
    proposed_solution: 'Proposed Solution',
    cost_benefit_analysis: 'Cost-Benefit Analysis',
};

export default function ReviewChange({ idea, changeRequest, canReview }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.changes.index(idea.slug));
        }
    };

    const isPending = changeRequest.status === 'pending';

    return (
        <>
            <Head title={`Review Changes - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Heading
                            title="Review Changes"
                            description={`By ${changeRequest.proposer.name} on ${idea.title}`}
                        />
                    </div>
                    <Badge variant={changeRequest.status === 'approved' ? 'secondary' : changeRequest.status === 'rejected' ? 'destructive' : 'default'}>
                        {changeRequest.status}
                    </Badge>
                </div>

                {changeRequest.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Proposer's Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{changeRequest.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    {(changeRequest.proposed_data ?? []).map((change, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {fieldLabels[change.field] || change.field}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-xs text-destructive mb-1 block">Old value</Label>
                                        <div className="rounded-md bg-destructive/10 p-3 text-sm whitespace-pre-wrap line-through opacity-70">
                                            {change.old_value || <span className="italic">(empty)</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-green-600 mb-1 block">New value</Label>
                                        <div className="rounded-md bg-green-50 p-3 text-sm whitespace-pre-wrap dark:bg-green-950/20">
                                            {change.new_value || <span className="italic">(empty)</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {changeRequest.feedback && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{changeRequest.feedback}</p>
                        </CardContent>
                    </Card>
                )}

                {isPending && canReview && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Form
                            method="post"
                            action={ideas.changes.approve([idea.slug, changeRequest.id])}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-green-600">Approve</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="approve-feedback">Feedback (optional)</Label>
                                                <Textarea
                                                    id="approve-feedback"
                                                    name="feedback"
                                                    rows={2}
                                                    placeholder="Optional note for the proposer..."
                                                />
                                                <InputError message={errors.feedback} />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={processing}>
                                                {processing ? 'Approving...' : 'Approve Changes'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </Form>

                        <Form
                            method="post"
                            action={ideas.changes.reject([idea.slug, changeRequest.id])}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-destructive">Reject</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="reject-feedback">Feedback (required)</Label>
                                                <Textarea
                                                    id="reject-feedback"
                                                    name="feedback"
                                                    rows={2}
                                                    required
                                                    placeholder="Explain why the changes are not accepted..."
                                                />
                                                <InputError message={errors.feedback} />
                                            </div>
                                            <Button type="submit" variant="destructive" className="w-full" disabled={processing}>
                                                {processing ? 'Rejecting...' : 'Reject Changes'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </Form>
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 self-start">
                        <Button size="icon" variant="info" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={ideas.show(idea.slug)}>View Idea</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

ReviewChange.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Change Request', href: '#' },
    ],
};
