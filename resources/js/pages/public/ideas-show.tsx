import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90 py-24 lg:py-32">
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-yellow">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to Explore
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={statusStyles[idea.status] ?? ''}>
                            {idea.status.replace(/_/g, ' ')}
                        </Badge>
                        {idea.category && (
                            <span className="text-xs text-white/40">{idea.category.name}</span>
                        )}
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {idea.title}
                    </h1>

                    <p className="mt-3 text-sm text-white/40">
                        By {idea.author.name} &middot; {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ─── CONTENT ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Main content cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <ContentCard title="Description" icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        }>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{idea.description}</p>
                        </ContentCard>

                        <ContentCard title="Problem Statement" icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        }>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{idea.problem_statement}</p>
                        </ContentCard>

                        <ContentCard title="Proposed Solution" icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                        }>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{idea.proposed_solution}</p>
                        </ContentCard>

                        <ContentCard title="Cost-Benefit Analysis" icon={
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                        }>
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{idea.cost_benefit_analysis}</p>
                        </ContentCard>
                    </div>

                    {/* Documents */}
                    {(proposal || supportingDocs.length > 0) && (
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            {proposal && (
                                <div className="rounded-2xl border bg-card/50 p-6">
                                    <div className="mb-3 flex items-center gap-2">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        <span className="font-semibold text-sm">Proposal Document</span>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/ideas/${idea.slug}/documents/${proposal.id}`} target="_blank" rel="noopener noreferrer">
                                            Download Proposal
                                        </a>
                                    </Button>
                                    {proposal.file_size && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {(proposal.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    )}
                                </div>
                            )}
                            {supportingDocs.length > 0 && (
                                <div className="rounded-2xl border bg-card/50 p-6">
                                    <div className="mb-3 flex items-center gap-2">
                                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                        <span className="font-semibold text-sm">Supporting Documents</span>
                                    </div>
                                    <div className="space-y-2">
                                        {supportingDocs.map((doc) => (
                                            <a
                                                key={doc.id}
                                                href={`/ideas/${idea.slug}/documents/${doc.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                                <span className="truncate">{doc.original_name}</span>
                                                {doc.file_size && (
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        ({(doc.file_size / 1024).toFixed(1)} KB)
                                                    </span>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Intellectual Property */}
                    {idea.ip_right && (
                        <div className="mt-6 rounded-2xl border bg-card/50 p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                <span className="font-semibold text-sm">Intellectual Property</span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                    <span className="font-medium text-foreground">Status:</span>{' '}
                                    {idea.ip_right.has_ip_protection ? 'Protected' : 'Not Protected'}
                                </p>
                                {idea.ip_right.patent_number && (
                                    <p><span className="font-medium text-foreground">Patent Number:</span> {idea.ip_right.patent_number}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Collaboration CTA */}
                    {idea.collaboration_enabled && (
                        <div className="relative mt-8 overflow-hidden rounded-2xl border bg-black p-8 text-center">
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow/10" />

                            <div className="relative">
                                <h2 className="text-xl font-bold text-white">Interested in this idea?</h2>
                                <p className="mt-2 text-sm text-white/40">
                                    Sign in to collaborate, propose changes, or submit your own idea.
                                </p>
                                <div className="mt-5 flex items-center justify-center gap-3">
                                    <Button asChild>
                                        <Link href="/login">Sign in</Link>
                                    </Button>
                                    <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                                        <Link href="/login">Create account</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

/* ─── Sub-components ─── */

function ContentCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border bg-card/50 p-6 transition-all duration-200 hover:border-yellow/30 hover:shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow/10 text-yellow-700 dark:text-yellow-300">
                    {icon}
                </span>
                <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            {children}
        </div>
    );
}
