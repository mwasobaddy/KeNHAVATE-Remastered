import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

export default function TeamMembersEdit({ member }) {
    return (
        <>
            <Head title="Edit Team Member" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Edit Team Member</h1>
                        <p className="mt-2 text-muted-foreground">
                            Update {member.name}'s details and permissions
                        </p>
                        <div className="mt-6">
                            <p className="text-muted-foreground">Team member edit form coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TeamMembersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
        {
            title: 'Team Members',
            href: idea.teamMembers.index({ idea: 0 }),
        },
        {
            title: 'Edit Member',
            href: '#',
        },
    ],
};
