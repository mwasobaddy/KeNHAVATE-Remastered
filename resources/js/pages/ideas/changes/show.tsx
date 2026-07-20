import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, Reply } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import RespondToChangeRequestDialog from '@/components/respond-to-change-request-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

const changeStatusStyles: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

export default function ReviewChange({ idea, changeRequest, canReview }: Props) {
    const [respondOpen, setRespondOpen] = useState(false);
    const [tipView, setTipView] = useState(false);
    const [tipRespond, setTipRespond] = useState(false);

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
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipView} onOpenChange={setTipView}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="info" asChild>
                                        <Link href={ideas.show(idea.slug)} onClick={() => setTipView(true)}>
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Idea</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">View Idea</span>
                        </div>

                        {isPending && canReview && (
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip open={tipRespond} onOpenChange={setTipRespond}>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="success" onClick={() => {
 setTipRespond(true); setRespondOpen(true); 
}}>
                                            <Reply className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Respond</TooltipContent>
                                </Tooltip>
                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Respond</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <Heading
                            title="Review Changes"
                            description={`By ${changeRequest.proposer.name} on ${idea.title}`}
                        />
                    </div>
                    <Badge variant="outline" className={changeStatusStyles[changeRequest.status] ?? ''}>
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
                                        <Label className="mb-1 block text-xs text-destructive">Old value</Label>
                                        <div className="rounded-md bg-destructive/10 p-3 text-sm whitespace-pre-wrap line-through opacity-70">
                                            {change.old_value || <span className="italic">(empty)</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-1 block text-xs text-green-600">New value</Label>
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

                <RespondToChangeRequestDialog
                    changeRequest={changeRequest}
                    ideaSlug={idea.slug}
                    open={respondOpen}
                    onOpenChange={(open) => {
 if (!open) {
setRespondOpen(false);
} 
}}
                />
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
