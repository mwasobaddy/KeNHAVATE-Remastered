import { Head, Link } from '@inertiajs/react';
import idea from '@/routes/idea';

export default function IdeaIndex({ ideas }) {
    return (
        <>
            <Head title="Ideas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Ideas</h1>
                                <p className="mt-2 text-muted-foreground">Manage and browse all ideas</p>
                            </div>
                            <Link href={idea.create().url}>
                                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                    Create Idea
                                </button>
                            </Link>
                        </div>
                        <div className="mt-6">
                            {ideas.data.length === 0 ? (
                                <p className="text-muted-foreground">No ideas yet. Create your first idea!</p>
                            ) : (
                                <div className="space-y-4">
                                    {ideas.data.map((ideaItem) => (
                                        <div key={ideaItem.id} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">{ideaItem.idea_title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Status: {ideaItem.status}
                                                    </p>
                                                    {ideaItem.thematic_area && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {ideaItem.thematic_area.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={idea.show(ideaItem.slug).url}>
                                                        <button className="text-sm text-primary">View</button>
                                                    </Link>
                                                    <Link href={idea.edit(ideaItem.slug).url}>
                                                        <button className="text-sm text-primary">Edit</button>
                                                    </Link>
                                                </div>
                                            </div>
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

IdeaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
    ],
};
