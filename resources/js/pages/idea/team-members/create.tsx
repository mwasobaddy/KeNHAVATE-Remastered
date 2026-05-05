import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

type TeamMembersCreateProps = {
    idea: {
        idea_title: string;
    };
};

export default function TeamMembersCreate({ idea }: TeamMembersCreateProps) {
    return (
        <>
            <Head title="Add Team Member" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Add Team Member</h1>
                        <p className="mt-2 text-muted-foreground">
                            Add a co-author to: {idea.idea_title}
                        </p>
                        <div className="mt-6">
                            <p className="text-muted-foreground">Team member form coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TeamMembersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
        {
            title: 'Team Members',
            href: idea.teamMembers.index({ idea: '' }),
        },
        {
            title: 'Add Member',
            href: idea.teamMembers.create({ idea: '' }),
        },
    ],
};
