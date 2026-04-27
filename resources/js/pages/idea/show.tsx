import { Head, Link } from '@inertiajs/react';
import ideaRoute from '@/routes/idea';

type ThematicArea = {
    name: string;
};

type Idea = {
    idea_title: string;
    status: string;
    slug: string;
    thematic_area?: ThematicArea;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    original_idea_disclaimer?: boolean;
    collaboration_enabled?: boolean;
    comments_enabled?: boolean;
    attachment_filename?: string;
    attachment?: string;
};

interface IdeaShowProps {
    idea: Idea;
}

export default function IdeaShow({ idea }: IdeaShowProps) {
    return (
        <>
            <Head title={idea.idea_title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{idea.idea_title}</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Status: {idea.status}
                                </p>
                            </div>
                            <Link href={ideaRoute.edit(idea.slug).url}>
                                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                    Edit Idea
                                </button>
                            </Link>
                        </div>

                        <div className="mt-6 space-y-6">
                            {idea.thematic_area && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Thematic Area</h3>
                                    <p className="mt-1">{idea.thematic_area.name}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Abstract</h3>
                                <p className="mt-1 whitespace-pre-wrap">{idea.abstract}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Problem Statement</h3>
                                <p className="mt-1 whitespace-pre-wrap">{idea.problem_statement}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Proposed Solution</h3>
                                <p className="mt-1 whitespace-pre-wrap">{idea.proposed_solution}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Cost Benefit Analysis</h3>
                                <p className="mt-1 whitespace-pre-wrap">{idea.cost_benefit_analysis}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Declaration of Interests</h3>
                                <p className="mt-1 whitespace-pre-wrap">{idea.declaration_of_interests}</p>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Original Idea</h3>
                                    <p className="mt-1">{idea.original_idea_disclaimer ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Collaboration Enabled</h3>
                                    <p className="mt-1">{idea.collaboration_enabled ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Comments Enabled</h3>
                                    <p className="mt-1">{idea.comments_enabled ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {idea.attachment_filename && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Attachment</h3>
                                    <a
                                        href={`/storage/${idea.attachment}`}
                                        target="_blank"
                                        className="mt-1 text-sm text-primary hover:underline"
                                    >
                                        {idea.attachment_filename}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

IdeaShow.layout = (page: { props: { idea: Idea } }) => ({
    breadcrumbs: [
        {
            title: 'Ideas',
            href: ideaRoute.index().url,
        },
        {
            title: page.props.idea?.idea_title || 'Idea Details',
            href: ideaRoute.show(page.props.idea.slug),
        },
    ],
});
