import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import ideas from '@/routes/ideas';

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
    proposal_file_path: string | null;
    support_documents: string[] | null;
    collaboration_enabled: boolean;
    status: string;
    created_at: string;
    author: { id: number; name: string };
    category: { id: number; name: string };
    invitations: Invitation[];
};

type Props = {
    idea: Idea;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function ShowIdea({ idea }: Props) {
    return (
        <>
            <Head title={idea.title} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Heading
                            title={idea.title}
                            description={`By ${idea.author.name} • ${idea.category.name}`}
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
                    {idea.proposal_file_path && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Full Proposal</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <a
                                        href={`/ideas/${idea.slug}/proposal`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download Proposal
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {idea.support_documents && idea.support_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Supporting Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {idea.support_documents.map((doc, i) => (
                                        <li key={i}>
                                            <Button variant="link" className="h-auto p-0" asChild>
                                                <a
                                                    href={`/ideas/${idea.slug}/support-document/${i}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Document {i + 1}
                                                </a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {idea.invitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
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

                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link href={ideas.index()}>Back to Ideas</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={ideas.edit(idea.slug)}>Edit</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
