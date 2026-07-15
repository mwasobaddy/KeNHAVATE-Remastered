import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ideas from '@/routes/ideas';

type Officer = {
    id: number;
    name: string;
    email: string;
};

type PaginatedData = {
    data: Array<{
        id: number;
        title: string;
        slug: string;
        status: string;
        created_at: string;
        author: { id: number; name: string };
        category: { id: number; name: string } | null;
        assigned_officer?: { id: number; name: string } | null;
    }>;
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    currentTab: string;
    pendingAssignment: PaginatedData | null;
    myAssignments: PaginatedData | null;
    pendingDecisions: PaginatedData | null;
    canAssign: boolean;
    canClassify: boolean;
    canRecordDecision: boolean;
    officers: Officer[];
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    submitted: 'default',
    assigned: 'secondary',
    resubmitted: 'warning' as any,
    classified: 'default',
};

const tabs = [
    { key: 'assign-officer', label: 'Assign Officer', gate: 'canAssign' as const },
    { key: 'my-assignments', label: 'My Assignments', gate: 'canClassify' as const },
    { key: 'pending-decisions', label: 'Pending Decisions', gate: 'canRecordDecision' as const },
];

function switchTab(tab: string) {
    router.get(ideas.review(), { tab }, { preserveState: true, preserveScroll: true });
}

export default function ReviewIndex({ currentTab, pendingAssignment, myAssignments, pendingDecisions, canAssign, canClassify, canRecordDecision, officers }: Props) {
    const availableTabs = tabs.filter((t) => ({ canAssign, canClassify, canRecordDecision }[t.gate]));
    const currentData = { 'assign-officer': pendingAssignment, 'my-assignments': myAssignments, 'pending-decisions': pendingDecisions }[currentTab] ?? null;
    const visibleTabs = availableTabs.length > 1;
    const [assigningSlug, setAssigningSlug] = useState<string | null>(null);

    return (
        <>
            <Head title="Review Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading title="Review Dashboard" description="Manage ideas in the review pipeline" />

                {visibleTabs && (
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => switchTab(tab.key)}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    currentTab === tab.key
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {currentData && currentData.data.length > 0 ? (
                    <div className="space-y-4">
                        {currentData.data.map((idea) => (
                            <AssignDialog
                                key={idea.id}
                                ideaSlug={idea.slug}
                                ideaTitle={idea.title}
                                officers={officers}
                                open={assigningSlug === idea.slug}
                                onOpenChange={(open) => setAssigningSlug(open ? idea.slug : null)}
                            >
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">
                                                    <Link href={ideas.show(idea.slug)} className="hover:underline">
                                                        {idea.title}
                                                    </Link>
                                                </CardTitle>
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    By {idea.author.name}
                                                    {idea.category ? ` • ${idea.category.name}` : ''}
                                                </p>
                                            </div>
                                            <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                                                {idea.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Submitted {new Date(idea.created_at).toLocaleDateString()}
                                            </span>
                                            {idea.assigned_officer && (
                                                <span className="text-muted-foreground">
                                                    Officer: {idea.assigned_officer.name}
                                                </span>
                                            )}
                                            <div className="flex gap-2">
                                                {canAssign && currentTab === 'assign-officer' && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => setAssigningSlug(idea.slug)}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={ideas.reviewShow(idea.slug)}>Review</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AssignDialog>
                        ))}

                        {currentData.last_page > 1 && (
                            <div className="flex justify-center gap-2 text-sm">
                                {currentData.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => switchTab(currentTab)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                <span className="flex items-center text-muted-foreground">
                                    Page {currentData.current_page} of {currentData.last_page}
                                </span>
                                {currentData.current_page < currentData.last_page && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => switchTab(currentTab)}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-12">
                            <p className="text-lg font-medium">No ideas in this section</p>
                            <p className="text-sm text-muted-foreground">
                                Ideas will appear here when they reach this stage of the review pipeline.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function AssignDialog({
    ideaSlug,
    ideaTitle,
    officers,
    open,
    onOpenChange,
    children,
}: {
    ideaSlug: string;
    ideaTitle: string;
    officers: Officer[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        officer_id: undefined as number | undefined,
    });

    function handleAssign() {
        post(ideas.assign(ideaSlug), {
            preserveState: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign RI&KM Officer</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Assign an officer to review <span className="font-medium text-foreground">{ideaTitle}</span>.
                </p>

                <div className="grid gap-2">
                    <Label htmlFor="officer_id">Officer</Label>
                    <select
                        id="officer_id"
                        name="officer_id"
                        value={data.officer_id ?? ''}
                        onChange={(e) => setData('officer_id', e.target.value === '' ? undefined : Number(e.target.value))}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                    >
                        <option value="">Select an officer...</option>
                        {officers.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name} ({o.email})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.officer_id} />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
 onOpenChange(false); reset(); 
}}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={processing || !data.officer_id} onClick={handleAssign}>
                        {processing ? 'Assigning...' : 'Assign Officer'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
