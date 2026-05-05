import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

export default function TeamMembersIndex({ idea, members }: { idea: { id: number; slug: string; idea_title: string }; members: any }) {
    return (
        <>
            <Head title="Team Members" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Team Members</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Manage co-authors for: {idea.idea_title}
                                </p>
                            </div>
                            <Link href={`/idea/${idea.slug}/team-members/create`}>
                                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                    Add Member
                                </button>
                            </Link>
                        </div>
                        <div className="mt-6">
                            {members.data.length === 0 ? (
                                <p className="text-muted-foreground">No team members yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {members.data.map((member: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; role: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                                        <div key={member.id} className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">{member.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    {member.role && (
                                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/idea/${idea.slug}/team-members/${member.id}/edit`}>
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

TeamMembersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: '/ideas',
        },
        {
            title: 'Team Members',
            href: '#',
        },
    ],
};
