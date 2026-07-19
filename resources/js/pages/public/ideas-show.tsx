import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    status: string;
    documents: IpDocument[];
};

interface Idea {
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
}

interface Props {
    idea: Idea;
}

const statusStyles: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    revision_requested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    resubmitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    classified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    deferred: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    implemented: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export default function PublicIdeaShow({ idea }: Props) {
    const proposal = idea.documents.find((d) => d.type === 'proposal');
    const supportingDocs = idea.documents.filter((d) => d.type === 'supporting');

    return (
        <>
            <Head title={idea.title} />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="mb-6">
                    <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        &larr; Back to Explore
                    </Link>
                </div>

                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{idea.title}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            By {idea.author.name}
                            {idea.category && <> &middot; {idea.category.name}</>}
                            &middot; {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <Badge className={statusStyles[idea.status] ?? ''}>
                        {idea.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{idea.description}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Problem Statement</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{idea.problem_statement}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Proposed Solution</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{idea.proposed_solution}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Cost-Benefit Analysis</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{idea.cost_benefit_analysis}</p>
                        </CardContent>
                    </Card>
                </div>

                {(proposal || supportingDocs.length > 0) && (
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        {proposal && (
                            <Card>
                                <CardHeader><CardTitle>Proposal Document</CardTitle></CardHeader>
                                <CardContent>
                                    <Button variant="outline" asChild>
                                        <a href={`/ideas/${idea.slug}/documents/${proposal.id}`} target="_blank" rel="noopener noreferrer">
                                            Download Proposal
                                        </a>
                                    </Button>
                                    {proposal.file_size && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {(proposal.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        {supportingDocs.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Supporting Documents</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {supportingDocs.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-black hover:underline"
                                        >
                                            {doc.original_name}
                                            {doc.file_size && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({(doc.file_size / 1024).toFixed(1)} KB)
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {idea.ip_right && (
                    <Card className="mt-8">
                        <CardHeader><CardTitle>Intellectual Property</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="font-medium">Status:</span>{' '}
                                {idea.ip_right.has_ip_protection ? 'Protected' : 'Not Protected'}
                            </p>
                            {idea.ip_right.patent_number && (
                                <p><span className="font-medium">Patent Number:</span> {idea.ip_right.patent_number}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {idea.collaboration_enabled && (
                    <div className="mt-8 rounded-xl border bg-card p-6 text-center">
                        <h2 className="text-lg font-semibold">Interested in this idea?</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sign in to collaborate, propose changes, or submit your own idea.
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <Button asChild>
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/login">Create account</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
