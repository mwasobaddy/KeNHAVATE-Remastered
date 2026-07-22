import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardCheck,
    Coins,
    Download,
    FileEdit,
    FileIcon,
    FileText,
    GitCompareArrows,
    Lightbulb,
    RotateCcw,
    ScrollText,
    Shield,
    SquarePen,
    Target,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
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

function formatSize(bytes: number | null): string {
    if (bytes === null) {
        return '';
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function docIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';

    if (['pdf'].includes(ext)) {
        return <FileText className="h-5 w-5 text-primary" />;
    }

    if (['xls', 'xlsx'].includes(ext)) {
        return <FileText className="h-5 w-5 text-emerald-600" />;
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return <FileText className="h-5 w-5 text-amber-600" />;
    }

    return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

function DocumentRow({ href, name, size, typeLabel }: { href: string; name: string; size: number | null; typeLabel: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5">
                    {docIcon(name)}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                        {typeLabel}
                        {size !== null ? ` · ${formatSize(size)}` : ''}
                    </p>
                </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" asChild>
                <a href={href} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                </a>
            </Button>
        </div>
    );
}

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
            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
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
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-destructive" />
                                Problem Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.problem_statement}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Proposed Solution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.proposed_solution}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-emerald-600" />
                                Cost-Benefit Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {idea.cost_benefit_analysis}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {(proposal || supportingDocs.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-muted-foreground" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {proposal && (
                                <div>
                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Full Proposal
                                    </h4>
                                    <DocumentRow
                                        href={`/ideas/${idea.slug}/documents/${proposal.id}`}
                                        name={proposal.original_name}
                                        size={proposal.file_size}
                                        typeLabel="Full Proposal"
                                    />
                                </div>
                            )}
                            {supportingDocs.length > 0 && (
                                <div>
                                    {proposal && <Separator className="mb-4" />}
                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Supporting Documents
                                    </h4>
                                    <div className="space-y-3">
                                        {supportingDocs.map((doc) => (
                                            <DocumentRow
                                                key={doc.id}
                                                href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                                name={doc.original_name}
                                                size={doc.file_size}
                                                typeLabel="Supporting Document"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {idea.ip_right && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                Intellectual Property
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {idea.ip_right.has_ip_protection ? (
                                    <Badge className="gap-1.5">
                                        <Shield className="h-3 w-3" />
                                        IP Protected
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="gap-1.5">
                                        Not Protected
                                    </Badge>
                                )}
                                <Badge variant="secondary">{idea.ip_right.status}</Badge>
                            </div>

                            {idea.ip_right.has_ip_protection && (
                                <>
                                    {idea.ip_right.patent_number && (
                                        <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                            <p className="text-xs text-muted-foreground">Patent Number</p>
                                            <p className="mt-0.5 text-sm font-medium">{idea.ip_right.patent_number}</p>
                                        </div>
                                    )}

                                    {idea.ip_right.documents.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">Patent Documents</p>
                                            {idea.ip_right.documents.map((doc) => (
                                                <DocumentRow
                                                    key={doc.id}
                                                    href={`/ideas/${idea.slug}/ip-documents/${doc.id}`}
                                                    name={doc.original_name}
                                                    size={doc.file_size}
                                                    typeLabel="Patent Document"
                                                />
                                            ))}
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
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                            Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                {idea.assigned_officer ? (
                                    <>
                                        <p className="text-sm font-medium">
                                            {idea.assigned_officer.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {idea.assigned_officer.email}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No officer assigned yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {idea.classification && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                        <ScrollText className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {idea.classification.name}
                                        </p>
                                        {idea.classification.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {idea.classification.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {idea.invitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Contributors
                            </CardTitle>
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
