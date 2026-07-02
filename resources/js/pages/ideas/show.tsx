import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
};

type Props = {
    idea: Idea;
    canRequestCollaboration: boolean;
    hasPendingCollaborationCount: number;
    canProposeChanges: boolean;
    canApproveChanges: boolean;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function ShowIdea({ idea, canRequestCollaboration, hasPendingCollaborationCount, canProposeChanges, canApproveChanges }: Props) {
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
