import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

export default function TeamMembersShow({ member }) {
    return (
        <>
            <Head title="Team Member Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">{member.name}</h1>
                        <p className="mt-2 text-muted-foreground">{member.email}</p>
                        {member.role && (
                            <p className="mt-1 text-muted-foreground">Role: {member.role}</p>
                        )}
                        {member.permissions && (
                            <div className="mt-4">
                                <h3 className="font-medium">Permissions:</h3>
                                <div className="mt-2 flex gap-2">
                                    {member.permissions.map((perm) => (
                                        <span key={perm} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

TeamMembersShow.layout = {
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
            title: 'Member Details',
            href: '#',
        },
    ],
};
