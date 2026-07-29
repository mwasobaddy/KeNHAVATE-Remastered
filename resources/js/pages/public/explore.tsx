import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { decodeHtmlEntities } from '@/lib/utils';
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

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90 py-24 lg:py-32">
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #FFF212 0.5px, transparent 0.5px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/50 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            Browse
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Explore <span className="text-yellow">Ideas</span>
                        </h1>
                        <p className="mt-4 text-lg text-white/50">
                            Browse ideas submitted by the KeNHA community.
                        </p>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ─── IDEAS GRID ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {ideas.data.length === 0 ? (
                        <div className="mt-12 text-center">
                            <p className="text-muted-foreground">No ideas have been published yet.</p>
                            <Button className="mt-4 rounded-full" asChild>
                                <Link href="/" className="inline-flex items-center gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-sm text-muted-foreground">
                                Showing {ideas.from}–{ideas.to} of {ideas.total} ideas
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {ideas.data.map((idea) => (
                                    <Link key={idea.id} href={`/explore/${idea.slug}`}>
                                        <Card className="group relative h-full overflow-hidden border bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/30 hover:shadow-md">
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.03] via-transparent to-transparent dark:from-white/[0.06]" />
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent dark:via-white/20" />
                                            <CardContent className="relative z-10 p-5 sm:p-6">
                                                <h3 className="font-semibold leading-snug transition-colors group-hover:text-yellow-700 dark:group-hover:text-yellow-300">
                                                    {idea.title}
                                                </h3>
                                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                    {idea.description}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                        </svg>
                                                        {idea.author.name}
                                                    </span>
                                                    <span>{formatDate(idea.created_at)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {ideas.last_page > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-2">
                                    {ideas.links.map((link, i) => {
                                        if (!link.url) {
                                            return (
                                                <span key={i} className="px-3 py-1.5 text-sm text-muted-foreground">
                                                    {decodeHtmlEntities(link.label)}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                                    link.active
                                                        ? 'bg-yellow text-black shadow-sm'
                                                        : 'text-muted-foreground hover:bg-accent'
                                                }`}
                                            >
                                                {decodeHtmlEntities(link.label)}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
