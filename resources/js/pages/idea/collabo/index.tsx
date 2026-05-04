'use client';

import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

interface Idea {
    id: number;
    idea_title: string;
    status: string;
    collaboration_enabled: boolean;
    slug: string;
}

interface CollaboIndexProps {
    ideas: {
        data: Idea[];
    };
}

export default function CollaboIndex({ ideas }: CollaboIndexProps) {
    return (
        <>
            <Head title="Collaborations" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Collaborations</h1>
                                <p className="mt-2 text-muted-foreground">Ideas open for collaboration</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            {ideas.data.length === 0 ? (
                                <p className="text-muted-foreground">No collaborations available.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ideas.data.map((ideaItem) => (
                                        <div key={ideaItem.id} className="rounded-lg border p-4">
                                            <h3 className="font-medium">{ideaItem.idea_title}</h3>
                                            <p className="text-sm text-muted-foreground">Status: {ideaItem.status}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CollaboIndex.layout = {
    breadcrumbs: [
        {
            title: 'Collaborations',
            href: idea.collabo.index(),
        },
    ],
};