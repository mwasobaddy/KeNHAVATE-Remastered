import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Idea {
    id: number;
    title: string;
    slug: string;
    status: string;
    description: string;
    created_at: string;
    author: { id: number; name: string };
    category: { id: number; name: string } | null;
}

interface PaginatedData {
    data: Idea[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    ideas: PaginatedData;
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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}w ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Explore({ ideas }: Props) {
    return (
        <>
            <Head title="Explore Ideas" />

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Explore Ideas</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Browse ideas submitted by the KeNHA community.
                    </p>
                </div>

                {ideas.data.length === 0 ? (
                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">No ideas have been published yet.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {ideas.data.map((idea) => (
                            <Link key={idea.id} href={`/explore/${idea.slug}`}>
                                <Card className="h-full transition-colors hover:bg-accent/50">
                                    <CardContent className="p-5">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Badge className={statusStyles[idea.status] ?? ''}>
                                                {idea.status.replace(/_/g, ' ')}
                                            </Badge>
                                            {idea.category && (
                                                <span className="text-xs text-muted-foreground">{idea.category.name}</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold leading-snug">{idea.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {idea.description}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>By {idea.author.name}</span>
                                            <span>{formatDate(idea.created_at)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {ideas.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {ideas.links.map((link, i) => {
                            if (!link.url) {
                                return (
                                    <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                        {link.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : 'text-muted-foreground hover:bg-accent'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
