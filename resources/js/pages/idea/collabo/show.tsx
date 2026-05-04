'use client';

import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Heart, MessageCircle, Users, Calendar, FileText, Lightbulb, AlertCircle } from 'lucide-react';
import ideaRoutes from '@/routes/idea';

interface User {
    id: number;
    name?: string;
    first_name?: string;
    other_names?: string;
    email?: string;
    work_email?: string;
    avatar?: string | null;
}

interface TeamMember {
    id: number;
    user: User | null;
    role: string | null;
    permissions: string;
    email: string;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Idea {
    id: number;
    idea_title: string;
    abstract: string | null;
    problem_statement: string | null;
    proposed_solution: string | null;
    status: string;
    collaboration_enabled: boolean;
    collaboration_deadline: string | null;
    slug: string;
    user: User | null;
    team_members: TeamMember[];
    thematic_area?: ThematicArea | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
}

interface CollaboShowProps {
    idea: Idea;
}

const getDisplayName = (user: User | null): string => {
    if (!user) {
return 'Unknown';
}

    return user.name ?? ([user.first_name, user.other_names].filter(Boolean).join(' ').trim() || 'Unknown');
};

const getAvatarLabel = (displayName: string) => {
    const label = displayName.replace(/^@/, '');

    return label.charAt(0).toUpperCase();
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        'stage 1 review': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'stage 1 revise': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        'stage 2 review': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        'stage 2 revise': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        'approved': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        'rejected': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };

    return colors[status] || 'bg-gray-100 text-gray-700';
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function CollaboShow({ idea }: CollaboShowProps) {
    return (
        <>
            <Head title={`Collaboration - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Header */}
                    <div className="border-b border-border bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-950/20 dark:to-blue-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-foreground">{idea.idea_title}</h1>
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(idea.status)}`}>
                                        {idea.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-muted-foreground">
                                    <Link href={ideaRoutes.collabo.index().url} className="text-primary hover:underline">
                                        ← Back to Collaborations
                                    </Link>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950"
                                    onClick={() => router.visit(ideaRoutes.show(idea.slug).url)}
                                >
                                    <FileText className="h-4 w-4" />
                                    View Full Idea
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Heart className="h-4 w-4" />
                                <span>{idea.likes_count} likes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span>{idea.comments_count} comments</span>
                            </div>
                            {idea.thematic_area && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Lightbulb className="h-4 w-4" />
                                    <span>{idea.thematic_area.name}</span>
                                </div>
                            )}
                            {idea.collaboration_deadline && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {formatDate(idea.collaboration_deadline)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid gap-6 p-6 md:grid-cols-3">
                        {/* Left - Idea Details */}
                        <div className="md:col-span-2 space-y-6">
                            {idea.abstract && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                        <FileText className="h-5 w-5 text-purple-500" />
                                        Abstract
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {idea.abstract}
                                    </p>
                                </div>
                            )}

                            {idea.problem_statement && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                        Problem Statement
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {idea.problem_statement}
                                    </p>
                                </div>
                            )}

                            {idea.proposed_solution && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                        <Lightbulb className="h-5 w-5 text-green-500" />
                                        Proposed Solution
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {idea.proposed_solution}
                                    </p>
                                </div>
                            )}

                            {!idea.abstract && !idea.problem_statement && !idea.proposed_solution && (
                                <div className="rounded-xl border border-border bg-card p-5">
                                    <p className="text-sm text-muted-foreground">
                                        No additional details available. Click "View Full Idea" to see complete information.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right - Collaboration Sidebar */}
                        <div className="space-y-6">
                            {/* Team Members Card */}
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Collaborators
                                </h3>

                                {/* Owner */}
                                {idea.user && (
                                    <div className="mb-4 flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/30">
                                        {idea.user.avatar ? (
                                            <img
                                                src={idea.user.avatar}
                                                alt={getDisplayName(idea.user)}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-300">
                                                {getAvatarLabel(getDisplayName(idea.user))}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{getDisplayName(idea.user)}</p>
                                            <p className="text-xs text-muted-foreground">Owner</p>
                                        </div>
                                    </div>
                                )}

                                {/* Team Members */}
                                {idea.team_members && idea.team_members.length > 0 ? (
                                    <div className="space-y-2">
                                        {idea.team_members.map((member) => (
                                            <div key={member.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                                                {member.user?.avatar ? (
                                                    <img
                                                        src={member.user.avatar}
                                                        alt={getDisplayName(member.user)}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                        {getAvatarLabel(getDisplayName(member.user))}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{getDisplayName(member.user)}</p>
                                                    <p className="text-xs text-muted-foreground">{member.role || 'Collaborator'}</p>
                                                </div>
                                                <span className={`rounded px-2 py-0.5 text-xs ${member.permissions === 'edit' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                    {member.permissions}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No collaborators yet</p>
                                )}

                                <div className="mt-4 border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        <Users className="mr-1 inline h-4 w-4" />
                                        {idea.team_members?.length || 0} team member{(idea.team_members?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted"
                                        onClick={() => router.visit(ideaRoutes.show(idea.slug).url)}
                                    >
                                        <span>View Full Details</span>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted"
                                        onClick={() => router.visit(comments.index({ idea: idea.slug }).url)}
                                    >
                                        <span>View Comments</span>
                                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Collaboration Info Card */}
                            {idea.collaboration_enabled && (
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/30">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-purple-900 dark:text-purple-100">Collaboration Open</h4>
                                            <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                                This idea is open for collaboration. Reach out to the owner to join the team!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

import comments from '@/routes/idea/comments';

CollaboShow.layout = {
    breadcrumbs: [
        {
            title: 'Collaborations',
            href: ideaRoutes.collabo.index(),
        },
        {
            title: 'Idea',
            href: ideaRoutes.collabo.show({ slug: ':slug' }).url,
        },
    ],
};