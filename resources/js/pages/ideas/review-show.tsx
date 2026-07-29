import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Gavel, LayoutDashboard, RotateCcw, Tags } from 'lucide-react';
import { useRef, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Document = {
    id: number;
    type: 'proposal' | 'supporting';
    original_name: string;
    file_size: number | null;
};

type IpDocument = {
    id: number;
    original_name: string;
    file_size: number | null;
};

type IpRight = {
    id: number;
    has_ip_protection: boolean;
    patent_number: string | null;
    consent_given: boolean;
    consent_given_at: string | null;
    status: string;
    documents: IpDocument[];
};

type Reviewer = {
    id: number;
    name: string;
};

type ReviewEntry = {
    id: number;
    stage: string;
    action: string;
    notes: string | null;
    created_at: string;
    reviewer: Reviewer;
};

type Officer = {
    id: number;
    name: string;
    email: string;
};

type Classification = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

type Idea = {
    id: number;
    title: string;
    slug: string;
    description: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    collaboration_enabled: boolean;
    status: string;
    created_at: string;
    author: { id: number; name: string };
    category: { id: number; name: string } | null;
    documents: Document[];
    ip_right: IpRight | null;
    assigned_officer: { id: number; name: string; email: string } | null;
    classification: Classification | null;
    reviews: ReviewEntry[];
};

type Props = {
    idea: Idea;
    canAssign: boolean;
    canClassify: boolean;
    classifications: Classification[];
    categories: { id: number; name: string }[];
    officers: Officer[];
    canRecordDecision: boolean;
    validDecisions: string[];
    canProgress: boolean;
    canRequestRevision: boolean;
    canProposeChanges: boolean;
    canApproveChanges: boolean;
    hasPendingCollaborationCount: number;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    submitted: 'default',
    assigned: 'secondary',
    revision_requested: 'outline',
    resubmitted: 'default',
    classified: 'secondary',
    approved: 'secondary',
    declined: 'destructive',
    deferred: 'outline',
    budget_logged: 'secondary',
    closed: 'outline',
    in_progress: 'default',
    completed: 'secondary',
    implemented: 'secondary',
};

const stageLabels: Record<string, string> = {
    assignment: 'Assignment',
    classification: 'Classification',
    decision: 'Decision',
    execution: 'Progress',
    revision: 'Revision',
};

function formatAction(action: string): string {
    return action
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ReviewShow({ idea, canAssign, canClassify, classifications, categories, officers, canRecordDecision, validDecisions, canProgress, canRequestRevision }: Props) {

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(`/ideas/review?tab=my-queue`);
        }
    };

    const [tipAssign, setTipAssign] = useState(false);
    const [tipClassify, setTipClassify] = useState(false);
    const [tipRevision, setTipRevision] = useState(false);
    const [tipDecision, setTipDecision] = useState(false);
    const [tipAdvance, setTipAdvance] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    function validate(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        if (form.querySelector<HTMLSelectElement>('[name="classification_id"]') && !fd.get('classification_id')) {
            errs.classification_id = 'Please select a classification type.';
        }

        if (form.querySelector<HTMLSelectElement>('[name="decision"]') && !fd.get('decision')) {
            errs.decision = 'Please select a decision.';
        }

        if (form.querySelector<HTMLSelectElement>('[name="officer_id"]') && !fd.get('officer_id')) {
            errs.officer_id = 'Please select an officer.';
        }

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <>
            <Head title={`Review: ${idea.title}`} />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Top Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canAssign && !idea.assigned_officer && (
                            <AssignOfficerDialog ideaSlug={idea.slug} ideaTitle={idea.title} officers={officers} authorId={idea.author.id} tipAssign={tipAssign} setTipAssign={setTipAssign} />
                        )}

                        {canClassify && (
                            <Dialog>
                                <div className="flex flex-col items-center gap-1">
                                    <Tooltip open={tipClassify} onOpenChange={setTipClassify}>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="premium">
                                                    <Tags className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Classify</TooltipContent>
                                    </Tooltip>
                                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Classify</span>
                                </div>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Classify Idea</DialogTitle>
                                    </DialogHeader>
                                    <Form
                                        method="post"
                                        action={ideas.classify(idea.slug)}
                                        className="space-y-4"
                                        transform={(data) => ({
                                            ...data,
                                            classification_id: data.classification_id === '' ? undefined : Number(data.classification_id),
                                            category_id: data.category_id === '' ? undefined : Number(data.category_id),
                                        })}
                                        onSubmit={(e) => { setClientErrors({}); if (!validate(e.currentTarget)) e.preventDefault(); }}
                                    >
                                        {({ processing, errors }) => {
                                            const allErrors = { ...clientErrors, ...errors };
                                            return (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="classification_id">Classification Type</Label>
                                                    <Select name="classification_id" defaultValue="">
                                                        <SelectTrigger id="classification_id">
                                                            <SelectValue placeholder="Select type..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {classifications.map((c) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={allErrors.classification_id} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="category_id">
                                                        Thematic Area <span className="text-muted-foreground">(optional)</span>
                                                    </Label>
                                                    <Select name="category_id" defaultValue="">
                                                        <SelectTrigger id="category_id">
                                                            <SelectValue placeholder="Keep current area" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((c) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.category_id} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        defaultValue=""
                                                        rows={3}
                                                        placeholder="Any additional notes..."
                                                    />
                                                    <InputError message={errors.notes} />
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline">Cancel</Button>
                                                    </DialogTrigger>
                                                    <Button type="submit" disabled={processing}>
                                                        {processing ? 'Classifying...' : 'Classify Idea'}
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    }}
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canRequestRevision && (
                            <Dialog>
                                <div className="flex flex-col items-center gap-1">
                                    <Tooltip open={tipRevision} onOpenChange={setTipRevision}>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="info">
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Revision</TooltipContent>
                                    </Tooltip>
                                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Revision</span>
                                </div>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Revision</DialogTitle>
                                    </DialogHeader>
                                    <Form method="post" action={ideas.requestRevision(idea.slug)} className="space-y-4"
                                        onSubmit={(e) => { setClientErrors({}); if (!validate(e.currentTarget)) e.preventDefault(); }}
                                    >
                                        {({ processing, errors }) => {
                                            const allErrors = { ...clientErrors, ...errors };
                                            return (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    The author will be asked to revise and resubmit this idea.
                                                </p>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="notes">Instructions <span className="text-muted-foreground">(optional)</span></Label>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        defaultValue=""
                                                        rows={3}
                                                        placeholder="What changes are needed?"
                                                    />
                                                    <InputError message={allErrors.notes} />
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline">Cancel</Button>
                                                    </DialogTrigger>
                                                    <Button type="submit" disabled={processing}>
                                                        {processing ? 'Requesting...' : 'Request Revision'}
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    }}
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canRecordDecision && (
                            <Dialog>
                                <div className="flex flex-col items-center gap-1">
                                    <Tooltip open={tipDecision} onOpenChange={setTipDecision}>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="warning">
                                                    <Gavel className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Decision</TooltipContent>
                                    </Tooltip>
                                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Decision</span>
                                </div>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Record DG Decision</DialogTitle>
                                    </DialogHeader>
                                    <Form method="post" action={ideas.decide(idea.slug)} className="space-y-4"
                                        onSubmit={(e) => { setClientErrors({}); if (!validate(e.currentTarget)) e.preventDefault(); }}
                                    >
                                        {({ processing, errors }) => {
                                            const allErrors = { ...clientErrors, ...errors };
                                            return (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="decision">Decision</Label>
                                                    <Select name="decision" defaultValue="">
                                                        <SelectTrigger id="decision">
                                                            <SelectValue placeholder="Select decision..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {validDecisions.map((d) => (
                                                                <SelectItem key={d} value={d}>
                                                                    {d.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={allErrors.decision} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
                                                    <Textarea
                                                        id="notes"
                                                        name="notes"
                                                        defaultValue=""
                                                        rows={3}
                                                        placeholder="Any additional notes..."
                                                    />
                                                    <InputError message={allErrors.notes} />
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline">Cancel</Button>
                                                    </DialogTrigger>
                                                    <Button type="submit" disabled={processing}>
                                                        {processing ? 'Recording...' : 'Record Decision'}
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    }}
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canProgress && (
                            <Form method="post" action={ideas.progress(idea.slug)}
                                onSubmit={(e) => { setClientErrors({}); if (!validate(e.currentTarget)) e.preventDefault(); }}
                            >
                                {({ processing }) => (
                                    <div className="flex flex-col items-center gap-1">
                                        <Tooltip open={tipAdvance} onOpenChange={setTipAdvance}>
                                            <TooltipTrigger asChild>
                                                <Button type="submit" variant="success" size="icon" disabled={processing}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Advance</TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Advance</span>
                                    </div>
                                )}
                            </Form>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Reviewing Idea
                        </p>
                        <Heading
                            title={idea.title}
                            description={`By ${idea.author.name}${idea.category ? ` • ${idea.category.name}` : ''}`}
                        />
                    </div>
                    <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                        {idea.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {idea.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {idea.problem_statement}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Proposed Solution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {idea.proposed_solution}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cost-Benefit Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {idea.cost_benefit_analysis}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Files */}
                <div className="grid gap-6 md:grid-cols-2">
                    {idea.documents.filter((d) => d.type === 'proposal').map((doc) => (
                        <Card key={doc.id}>
                            <CardHeader>
                                <CardTitle>Full Proposal</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <a
                                        href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download Proposal
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {idea.documents.filter((d) => d.type === 'supporting').length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Supporting Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {idea.documents.filter((d) => d.type === 'supporting').map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{doc.original_name}</span>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* IP Rights */}
                {idea.ip_right && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p>
                                <span className="font-medium">IP Protected:</span>{' '}
                                {idea.ip_right.has_ip_protection ? 'Yes' : 'No'}
                            </p>
                            {idea.ip_right.patent_number && (
                                <p>
                                    <span className="font-medium">Patent Number:</span>{' '}
                                    {idea.ip_right.patent_number}
                                </p>
                            )}
                            {idea.ip_right.documents.length > 0 && (
                                <div>
                                    <p className="mb-1 font-medium">IP Documents:</p>
                                    <div className="space-y-1">
                                        {idea.ip_right.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between">
                                                <span className="text-muted-foreground">{doc.original_name}</span>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a
                                                        href={`/ideas/${idea.slug}/ip-documents/${doc.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Download
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Review Timeline */}
                {idea.reviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Review History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {idea.reviews.map((entry) => (
                                    <div key={entry.id} className="border-l-2 border-muted pl-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">{entry.reviewer.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {stageLabels[entry.stage] ?? formatAction(entry.stage)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                &middot; {formatAction(entry.action)}
                                            </span>
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {entry.notes && (
                                            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                                                {entry.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Assignment / Classification Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {idea.assigned_officer ? (
                            <p>
                                <span className="font-medium">Assigned Officer:</span>{' '}
                                {idea.assigned_officer.name} ({idea.assigned_officer.email})
                            </p>
                        ) : (
                            <p className="text-muted-foreground">No officer assigned yet.</p>
                        )}

                        {idea.classification ? (
                            <p>
                                <span className="font-medium">Classification:</span>{' '}
                                {idea.classification.name}
                            </p>
                        ) : (
                            <p className="text-muted-foreground">Not yet classified.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReviewShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Review Dashboard', href: '/ideas/review' },
        { title: 'Review Idea', href: '#' },
    ],
};

/* ---------- Assign Dialog (standalone, not nested) ---------- */

function AssignOfficerDialog({
    ideaSlug,
    ideaTitle,
    officers,
    authorId,
    tipAssign,
    setTipAssign,
}: {
    ideaSlug: string;
    ideaTitle: string;
    officers: Officer[];
    authorId: number;
    tipAssign: boolean;
    setTipAssign: (value: boolean) => void;
}) {
    const availableOfficers = officers.filter((o) => o.id !== authorId);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    function validateAssign(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};
        if (!fd.get('officer_id')) errs.officer_id = 'Please select an officer.';
        setLocalErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <Dialog>
            <div className="flex flex-col items-center gap-1">
                <Tooltip open={tipAssign} onOpenChange={setTipAssign}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <LayoutDashboard className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Assign</TooltipContent>
                </Tooltip>
                <span className="text-[10px] leading-tight text-muted-foreground text-center">Assign</span>
            </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign RI&KM Officer</DialogTitle>
                </DialogHeader>
                <Form
                    method="post"
                    action={ideas.assign(ideaSlug)}
                    className="space-y-4"
                    transform={(data) => ({
                        ...data,
                        officer_id: data.officer_id === '' ? undefined : Number(data.officer_id),
                    })}
                    onSubmit={(e) => { setLocalErrors({}); if (!validateAssign(e.currentTarget)) e.preventDefault(); }}
                >
                    {({ processing, errors }) => {
                        const allErrors = { ...localErrors, ...errors };
                        return (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Assign an officer to review <span className="font-medium text-foreground">{ideaTitle}</span>.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="officer_id">Officer</Label>
                                <Select name="officer_id" defaultValue="">
                                    <SelectTrigger id="officer_id">
                                        <SelectValue placeholder="Select an officer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableOfficers.map((o) => (
                                            <SelectItem key={o.id} value={String(o.id)}>
                                                {o.name} ({o.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={allErrors.officer_id} />
                            </div>
                            <div className="flex justify-end gap-3">
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Assigning...' : 'Assign Officer'}
                                </Button>
                            </div>
                        </>
                    );
                    }}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
