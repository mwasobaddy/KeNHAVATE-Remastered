import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, FileEdit, GitCompareArrows, SquarePen, RotateCcw, UserPlus, Users } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Document = {
    id: number;
    type: 'proposal' | 'supporting';
    original_name: string;
    file_size: number | null;
};

type AssignedOfficer = {
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

type Invitation = {
    id: number;
    email: string;
    role: string;
    status: string;
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
    category: { id: number; name: string };
    documents: Document[];
    invitations: Invitation[];
    ip_right: IpRight | null;
    assigned_officer: AssignedOfficer | null;
    classification: Classification | null;
};

type Props = {
    idea: Idea;
    canEdit: boolean;
    canRequestCollaboration: boolean;
    hasPendingCollaborationCount: number;
    canProposeChanges: boolean;
    canApproveChanges: boolean;
    canResubmit: boolean;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
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

export default function ShowIdea({ idea, canEdit, canRequestCollaboration, hasPendingCollaborationCount, canProposeChanges, canApproveChanges, canResubmit }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.index().url);
        }
    };

    const proposal = idea.documents.find((d) => d.type === 'proposal');
    const supportingDocs = idea.documents.filter((d) => d.type === 'supporting');
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const isAuthor = auth.user.id === idea.author.id;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tipChanges, setTipChanges] = useState(false);
    const [tipEdit, setTipEdit] = useState(false);
    const [tipResubmit, setTipResubmit] = useState(false);
    const [tipCollaborate, setTipCollaborate] = useState(false);
    const [tipPropose, setTipPropose] = useState(false);
    const [tipRequest, setTipRequest] = useState(false);

    return (
        <>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                    <div className="flex flex-row items-start gap-2">
                        {(canProposeChanges || canApproveChanges) && (
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip open={tipChanges} onOpenChange={setTipChanges}>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" asChild>
                                            <Link href={ideas.changes.index(idea.slug)} onClick={() => setTipChanges(true)}>
                                                <GitCompareArrows className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Changes</TooltipContent>
                                </Tooltip>
                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Changes</span>
                            </div>
                        )}

                        {isAuthor && (
                            <>
                                {canEdit && (
                                    <div className="flex flex-col items-center gap-1">
                                        <Tooltip open={tipEdit} onOpenChange={setTipEdit}>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="success" asChild>
                                                    <Link href={ideas.edit(idea.slug)} onClick={() => setTipEdit(true)}>
                                                        <SquarePen className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit idea</TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Edit</span>
                                    </div>
                                )}

                                {canResubmit && (
                                    <div className="flex flex-col items-center gap-1">
                                        <Tooltip open={tipResubmit} onOpenChange={setTipResubmit}>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="warning" asChild>
                                                    <Link href={ideas.edit(idea.slug)} onClick={() => setTipResubmit(true)}>
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Resubmit idea</TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Resubmit</span>
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-1">
                                    <Tooltip open={tipCollaborate} onOpenChange={setTipCollaborate}>
                                        <TooltipTrigger asChild>
                                            <Button variant="success" size="icon" asChild>
                                                <Link href={ideas.collaborations.index(idea.slug)} onClick={() => setTipCollaborate(true)}>
                                                    <Users className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Manage collaborators{hasPendingCollaborationCount > 0 ? ` (${hasPendingCollaborationCount} pending)` : ''}
                                        </TooltipContent>
                                    </Tooltip>
                                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Team</span>
                                </div>
                            </>
                        )}

                        {!isAuthor && (
                            <>
                                {canProposeChanges && (
                                    <div className="flex flex-col items-center gap-1">
                                        <Tooltip open={tipPropose} onOpenChange={setTipPropose}>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="premium" asChild>
                                                    <Link href={ideas.changes.create(idea.slug)} onClick={() => setTipPropose(true)}>
                                                        <FileEdit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Propose changes</TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Propose</span>
                                    </div>
                                )}

                                {canRequestCollaboration && (
                                    <div className="flex flex-col items-center gap-1">
                                        <Tooltip open={tipRequest} onOpenChange={setTipRequest}>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="success" onClick={() => {
                                                    setTipRequest(true); setDialogOpen(true);
                                                }}>
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Request to collaborate</TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Request</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Head title={idea.title} />

                <div className="flex items-start justify-between">
                    <div>
                        <Heading
                            title={idea.title}
                            description={`By ${idea.author.name}${idea.category ? ` • ${idea.category.name}` : ''}`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                            {idea.status}
                        </Badge>
                        {idea.collaboration_enabled && (
                            <Badge variant="secondary">Collaboration Open</Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Statement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.problem_statement}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Proposed Solution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.proposed_solution}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cost-Benefit Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.cost_benefit_analysis}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {proposal && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Full Proposal</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="default" asChild>
                                    <a
                                        href={`/ideas/${idea.slug}/documents/${proposal.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download Proposal
                                    </a>
                                </Button>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {proposal.original_name}
                                    {proposal.file_size
                                        ? ` (${(proposal.file_size / 1024).toFixed(1)} KB)`
                                        : ''}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {supportingDocs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Supporting Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {supportingDocs.map((doc) => (
                                        <li key={doc.id}>
                                            <Button variant="link" className="h-auto p-0" asChild>
                                                <a
                                                    href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {doc.original_name}
                                                </a>
                                            </Button>
                                            {doc.file_size && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({(doc.file_size / 1024).toFixed(1)} KB)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {idea.ip_right && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                {idea.ip_right.has_ip_protection ? (
                                    <Badge>IP Protected</Badge>
                                ) : (
                                    <Badge variant="default">Not Protected</Badge>
                                )}
                                <Badge variant="secondary">{idea.ip_right.status}</Badge>
                            </div>

                            {idea.ip_right.has_ip_protection && (
                                <>
                                    {idea.ip_right.patent_number && (
                                        <p className="text-sm">
                                            <span className="font-medium">Patent Number:</span>{' '}
                                            {idea.ip_right.patent_number}
                                        </p>
                                    )}

                                    {idea.ip_right.documents.length > 0 && (
                                        <div>
                                            <p className="mb-1 text-sm font-medium">Patent Documents:</p>
                                            <ul className="space-y-1">
                                                {idea.ip_right.documents.map((doc) => (
                                                    <li key={doc.id}>
                                                        <Button variant="link" className="h-auto p-0" asChild>
                                                            <a
                                                                href={`/ideas/${idea.slug}/ip-documents/${doc.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {doc.original_name}
                                                            </a>
                                                        </Button>
                                                        {doc.file_size && (
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                ({(doc.file_size / 1024).toFixed(1)} KB)
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}

                            {idea.ip_right.consent_given && (
                                <p className="text-sm text-muted-foreground">
                                    Consent given{idea.ip_right.consent_given_at
                                        ? ` on ${new Date(idea.ip_right.consent_given_at).toLocaleDateString()}`
                                        : ''}
                                    .
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {idea.assigned_officer ? (
                            <div className="text-sm">
                                <p>
                                    <span className="font-medium">RI&KM Officer:</span>{' '}
                                    {idea.assigned_officer.name}
                                </p>
                                <p className="text-muted-foreground">
                                    {idea.assigned_officer.email}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No officer assigned yet.
                            </p>
                        )}

                        {idea.classification && (
                            <div className="border-t pt-4 text-sm">
                                <p>
                                    <span className="font-medium">Classification:</span>{' '}
                                    {idea.classification.name}
                                </p>
                                {idea.classification.description && (
                                    <p className="mt-1 text-muted-foreground">
                                        {idea.classification.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {idea.invitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contributors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Email</th>
                                            <th className="pb-2 pr-4 font-medium">Role</th>
                                            <th className="pb-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {idea.invitations.map((inv) => (
                                            <tr key={inv.id} className="border-b last:border-0">
                                                <td className="py-2 pr-4">{inv.email}</td>
                                                <td className="py-2 pr-4 text-muted-foreground capitalize">
                                                    {inv.role}
                                                </td>
                                                <td className="py-2">
                                                    <Badge variant={inv.status === 'accepted' ? 'secondary' : 'outline'}>
                                                        {inv.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Request Collaboration Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request to Collaborate</DialogTitle>
                    </DialogHeader>
                    <Form
                        method="post"
                        action={ideas.collaborations.store(idea.slug)}
                        resetOnSuccess={true}
                        onSuccess={() => setDialogOpen(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">
                                        Why do you want to collaborate?
                                    </Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        required
                                        placeholder="Tell the author what skills or ideas you can contribute..."
                                    />
                                    <InputError message={errors.message} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="default" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Sending...' : 'Send Request'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowIdea.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'View Idea', href: '#' },
    ],
};
