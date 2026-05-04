'use client';

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import idea from '@/routes/idea';

interface Idea {
    id: number;
    idea_title: string;
    status: string;
    slug: string;
}

interface CollaboShowProps {
    idea: Idea;
}

export default function CollaboShow({ idea }: CollaboShowProps) {
    return (
        <>
            <Head title={`Collaboration - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{idea.idea_title}</h1>
                                <p className="mt-2 text-muted-foreground">
                                    <Link href={idea.collabo.index().url} className="text-primary hover:underline">
                                        ← Back to Collaborations
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-muted-foreground">Status: {idea.status}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

CollaboShow.layout = {
    breadcrumbs: [
        {
            title: 'Collaborations',
            href: idea.collabo.index(),
        },
        {
            title: 'Idea',
            href: idea.collabo.show(idea.slug),
        },
    ],
};