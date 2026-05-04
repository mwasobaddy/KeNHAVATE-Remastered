'use client';

import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Heart, MessageCircle, Users, Calendar, FileText, Lightbulb, AlertCircle, UserPlus, X, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

interface CollaborationRequest {
    id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'declined';
    message: string | null;
    created_at: string;
    user: User | null;
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
    pending_collaboration_requests?: CollaborationRequest[];
}

interface CollaboShowProps {
    idea: Idea;
    isOwner: boolean;
    isCollaborator: boolean;
    userCollaborationRequest: CollaborationRequest | null;
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

export default function CollaboShow({ idea, isOwner, isCollaborator, userCollaborationRequest }: CollaboShowProps) {
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const requestCollaboration = async () => {
        setSubmitting(true);

        try {
            await axios.post(`/idea/${idea.id}/collabo/request`, {
                message: requestMessage,
            });
            router.reload();
        } catch (error) {
            console.error('Failed to submit request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelRequest = async () => {
        setSubmitting(true);

        try {
            await axios.delete(`/idea/${idea.id}/collabo/request`);
            router.reload();
        } catch (error) {
            console.error('Failed to cancel request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const approveRequest = async (requestId: number) => {
        try {
            await axios.post(`/idea/${idea.id}/collabo/requests/${requestId}/approve`);
            router.reload();
        } catch (error) {
            console.error('Failed to approve request:', error);
        }
    };

    const declineRequest = async (requestId: number) => {
        try {
            await axios.post(`/idea/${idea.id}/collabo/requests/${requestId}/decline`);
            router.reload();
        } catch (error) {
            console.error('Failed to decline request:', error);
        }
    };

    const removeCollaborator = async (memberId: number) => {
        if (!confirm('Are you sure you want to remove this collaborator?')) {
            return;
        }

        try {
            await axios.delete(`/idea/${idea.id}/collabo/collaborators/${memberId}`);
            router.reload();
        } catch (error) {
            console.error('Failed to remove collaborator:', error);
        }
    };

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
                            {/* Request to Collaborate / Already Collaborating */}
                            {!isCollaborator && idea.collaboration_enabled && (
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/30">
                                    {userCollaborationRequest ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                                                        {userCollaborationRequest.status === 'pending' ? 'Request Pending' : 'Request ' + userCollaborationRequest.status}
                                                    </h4>
                                                </div>
                                            </div>
                                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                                Your {userCollaborationRequest.status} request is awaiting review.
                                            </p>
                                            {userCollaborationRequest.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={cancelRequest}
                                                    className="text-sm text-purple-600 underline hover:text-purple-800"
                                                >
                                                    Cancel Request
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Collaborate on this Idea</h4>
                                                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                                        Request to join this team and contribute to the idea.
                                                    </p>
                                                </div>
                                            </div>
                                            {showRequestForm ? (
                                                <div className="space-y-3">
                                                    <Textarea
                                                        placeholder="Add a message to your request (optional)"
                                                        value={requestMessage}
                                                        onChange={(e) => setRequestMessage(e.target.value)}
                                                        className="w-full"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={requestCollaboration}
                                                            disabled={submitting}
                                                            size="sm"
                                                            className="bg-purple-600 hover:bg-purple-700"
                                                        >
                                                            {submitting ? 'Sending...' : 'Send Request'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setShowRequestForm(false);
                                                                setRequestMessage('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRequestForm(true)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                    Request to Collaborate
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Current Collaborators (for owner) */}
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
                                                {isOwner && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCollaborator(member.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No collaborators yet</p>
                                )}

                                <div className="mt-4 border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        <Users className="mr-1 inline h-4 w-4" />
                                        {idea.team_members?.length || 0} collaborator{(idea.team_members?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Pending Requests (for owner) */}
                            {isOwner && idea.pending_collaboration_requests && idea.pending_collaboration_requests.length > 0 && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-950/30">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <UserPlus className="h-5 w-5 text-yellow-500" />
                                        Pending Requests ({idea.pending_collaboration_requests.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {idea.pending_collaboration_requests.map((request) => (
                                            <div key={request.id} className="rounded-lg border border-yellow-200 bg-white p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                <div className="flex items-center gap-3">
                                                    {request.user?.avatar ? (
                                                        <img
                                                            src={request.user.avatar}
                                                            alt={getDisplayName(request.user)}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                            {getAvatarLabel(getDisplayName(request.user))}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{getDisplayName(request.user)}</p>
                                                        {request.message && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{request.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => approveRequest(request.id)}
                                                            className="rounded p-1 text-green-600 hover:bg-green-100"
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => declineRequest(request.id)}
                                                            className="rounded p-1 text-red-600 hover:bg-red-100"
                                                            title="Decline"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                                This idea is open for collaboration. Request to join the team!
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