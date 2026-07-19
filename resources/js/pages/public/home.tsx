import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

interface Props {
    stats: {
        totalIdeas: number;
        implemented: number;
        collaborators: number;
    };
}

export default function Home({ stats }: Props) {
    return (
        <>
            <Head title="Welcome" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-beige to-background">
                <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Innovate{' '}
                            <span className="text-black">KeNHA</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                            Have an idea to improve Kenya's road infrastructure? Submit it here,
                            collaborate with colleagues, and see it come to life.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-4">
                            <Link
                                href={login()}
                                className="rounded-lg bg-yellow px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow/90"
                            >
                                Submit Your Idea
                            </Link>
                            <Link
                                href="/explore"
                                className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
                            >
                                Browse Ideas
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-200 to-transparent dark:via-yellow-800" />
            </section>

            {/* Stats */}
            <section className="border-b py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-3">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-black">{stats.totalIdeas}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Ideas Submitted</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">{stats.implemented}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Ideas Implemented</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-amber-600">{stats.collaborators}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Active Collaborators</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
                        <p className="mt-4 text-muted-foreground">
                            From idea to impact in three simple steps.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        <div className="relative rounded-xl border bg-card p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow/20 text-black">
                                <span className="text-lg font-bold">1</span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Submit</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Share your idea with a clear description, problem statement, and proposed solution.
                            </p>
                        </div>
                        <div className="relative rounded-xl border bg-card p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50">
                                <span className="text-lg font-bold">2</span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Review</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Your idea is reviewed, classified, and evaluated by the relevant officers.
                            </p>
                        </div>
                        <div className="relative rounded-xl border bg-card p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50">
                                <span className="text-lg font-bold">3</span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Implement</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Approved ideas are budgeted, implemented, and tracked to completion.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black py-16">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Ready to make a difference?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-beige">
                        Join your colleagues in shaping the future of Kenya's road infrastructure.
                    </p>
                    <div className="mt-8">
                        <Link
                            href={login()}
                            className="inline-flex items-center rounded-lg bg-yellow px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow/90"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
