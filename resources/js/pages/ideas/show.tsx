import { Form, Head, Link, usePage } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
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
    canRequestCollaboration: boolean;
    hasPendingCollaborationCount: number;
    canProposeChanges: boolean;
    canApproveChanges: boolean;
    canAssign: boolean;
    canClassify: boolean;
    classifications: Classification[];
    categories: { id: number; name: string }[];
    officers: Officer[];
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function ShowIdea({ idea, canRequestCollaboration, hasPendingCollaborationCount, canProposeChanges, canApproveChanges, canAssign, canClassify, classifications, categories, officers }: Props) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const proposal = idea.documents.find((d) => d.type === 'proposal');
    const supportingDocs = idea.documents.filter((d) => d.type === 'supporting');
    const isAuthor = auth.user.id === idea.author.id;
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Head title={idea.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
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
                                <Button variant="outline" asChild>
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
                                    <Badge variant="outline">Not Protected</Badge>
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
                        ) : canAssign ? (
                            <Form
                                method="post"
                                action={ideas.assign(idea.slug)}
                                className="space-y-4"
                            >
                                {({ processing, errors, data, setData }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="officer_id">
                                                Assign RI&KM Officer
                                            </Label>
                                            <select
                                                id="officer_id"
                                                name="officer_id"
                                                value={data.officer_id ?? ''}
                                                onChange={(e) => setData('officer_id', e.target.value === '' ? undefined : e.target.value)}
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
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Assigning...' : 'Assign Officer'}
                                        </Button>
                                    </>
                                )}
                            </Form>
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

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" asChild>
                        <Link href={ideas.index()}>Back to Ideas</Link>
                    </Button>
                    {(canAssign || canClassify) && (
                        <Button variant="outline" asChild>
                            <Link href={ideas.review().url}>Back to Review Dashboard</Link>
                        </Button>
                    )}

                    {canClassify && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Classify Idea</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Classify Idea</DialogTitle>
                                </DialogHeader>
                                <Form
                                    method="post"
                                    action={ideas.classify(idea.slug)}
                                    className="space-y-4"
                                >
                                    {({ processing, errors, data, setData }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="classification_id">
                                                    Classification Type
                                                </Label>
                                                <select
                                                    id="classification_id"
                                                    name="classification_id"
                                                    value={data.classification_id ?? ''}
                                                    onChange={(e) => setData('classification_id', e.target.value === '' ? undefined : Number(e.target.value))}
                                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    required
                                                >
                                                    <option value="">Select type...</option>
                                                    {classifications.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.classification_id} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="category_id">
                                                    Thematic Area <span className="text-muted-foreground">(optional)</span>
                                                </Label>
                                                <select
                                                    id="category_id"
                                                    name="category_id"
                                                    value={data.category_id ?? ''}
                                                    onChange={(e) => setData('category_id', e.target.value === '' ? undefined : Number(e.target.value))}
                                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value="">Keep current area</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.category_id} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">
                                                    Notes <span className="text-muted-foreground">(optional)</span>
                                                </Label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    value={data.notes ?? ''}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    rows={3}
                                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="Any additional notes..."
                                                />
                                                <InputError message={errors.notes} />
                                            </div>

                                            <div className="flex justify-end gap-3">
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline">
                                                        Cancel
                                                    </Button>
                                                </DialogTrigger>
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? 'Classifying...' : 'Classify Idea'}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {isAuthor && (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={ideas.edit(idea.slug)}>Edit</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={ideas.collaborations.index(idea.slug)}>
                                    Collaborations
                                    {hasPendingCollaborationCount > 0 && (
                                        <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                            {hasPendingCollaborationCount}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </>
                    )}

                    {(canProposeChanges || canApproveChanges) && (
                        <Button variant="outline" asChild>
                            <Link href={ideas.changes.index(idea.slug)}>Change Requests</Link>
                        </Button>
                    )}

                    {!isAuthor && canProposeChanges && (
                        <Button variant="outline" asChild>
                            <Link href={ideas.changes.create(idea.slug)}>Propose Changes</Link>
                        </Button>
                    )}

                    {canRequestCollaboration && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Request to Collaborate</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request to Collaborate</DialogTitle>
                                </DialogHeader>
                                <Form
                                    method="post"
                                    action={ideas.collaborations.store(idea.slug)}
                                    resetOnSuccess={true}
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
                                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
                    )}
                </div>
            </div>
        </>
    );
}
