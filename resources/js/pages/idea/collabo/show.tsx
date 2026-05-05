'use client';

import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
    MessageSquare,
    Users,
    FileText,
    Lightbulb,
    AlertCircle,
    UserPlus,
    X,
    Check,
    Edit3,
    Send,
    ThumbsUp,
    Clock,
    CheckCircle,
    TrendingUp,
    ChevronLeft,
    HelpCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideaRoutes from '@/routes/idea';
import comments from '@/routes/idea/comments';

interface User {
    id: number;
    name?: string;
    first_name?: string;
    other_names?: string;
    email?: string;
    work_email?: string;
    avatar?: string | null;
}

interface Collaborator {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role: string;
    permissions: string;
    user?: User | null;
}

interface CollaborationRequest {
    id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'declined';
    message: string | null;
    created_at: string;
    user: User | null;
}

interface Suggestion {
    id: number;
    user_id: number;
    section: string;
    content: string;
    status: 'pending' | 'accepted' | 'rejected';
    likes_count: number;
    replies_count: number;
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
    cost_benefit: string | null;
    status: string;
    collaboration_enabled: boolean;
    collaboration_deadline: string | null;
    slug: string;
    user: User | null;
    collaborators: Collaborator[];
    thematic_area?: ThematicArea | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    pending_collaboration_requests?: CollaborationRequest[];
    suggestions?: Suggestion[];
}

interface CollaboShowProps {
    idea: Idea;
    isOwner: boolean;
    isCollaborator: boolean;
    userCollaborationRequest: CollaborationRequest | null;
}

type TabType = 'suggestions' | 'document' | 'collaborators';
type FilterType = 'all' | 'pending' | 'accepted';

const getDisplayName = (user: User | null | undefined): string => {
    if (!user) {
        return 'Unknown';
    }

    return user.name ?? ([user.first_name, user.other_names].filter(Boolean).join(' ').trim() || 'Unknown');
};

const getAvatarLabel = (displayName: string) => {
    const label = displayName.replace(/^@/, '');

    return label.charAt(0).toUpperCase();
};

const getTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
return `${minutes} minutes ago`;
}

    if (hours < 24) {
return `${hours} hours ago`;
}

    return `${days} days ago`;
};

const sectionIcons: Record<string, any> = {
    abstract: FileText,
    problem_statement: AlertCircle,
    proposed_solution: Lightbulb,
    cost_benefit: TrendingUp,
    general: MessageSquare,
    other: HelpCircle,
};

const sectionLabels: Record<string, string> = {
    abstract: 'Abstract',
    problem_statement: 'Problem Statement',
    proposed_solution: 'Proposed Solution',
    cost_benefit: 'Cost-Benefit Analysis',
    general: 'General',
    other: 'Other',
};

export default function CollaboShow({ idea, isOwner, isCollaborator, userCollaborationRequest }: CollaboShowProps) {
    const [activeTab, setActiveTab] = useState<TabType>('suggestions');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showSuggestionForm, setShowSuggestionForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [suggestionSection, setSuggestionSection] = useState('proposed_solution');
    const [suggestionContent, setSuggestionContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const requestCollaboration = async () => {
        setSubmitting(true);

        try {
            await axios.post(`/idea/${idea.slug}/collabo/request`, {
                message: requestMessage,
            });
            router.reload();
        } catch (error) {
            console.error('Failed to submit request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const submitSuggestion = async () => {
        setSubmitting(true);

        try {
            setShowSuggestionForm(false);
            setSuggestionContent('');
            router.reload();
        } catch (error: any) {
            console.error('Failed to submit suggestion:', error.response?.data || error);
            alert(error.response?.data?.message || error.response?.data?.errors || 'Failed to submit suggestion');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelRequest = async () => {
        setSubmitting(true);

        try {
            await axios.delete(`/idea/${idea.slug}/collabo/request`);
            router.reload();
        } catch (error) {
            console.error('Failed to cancel request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const approveRequest = async (requestId: number) => {
        try {
            await axios.post(`/idea/${idea.slug}/collabo/requests/${requestId}/approve`);
            router.reload();
        } catch (error) {
            console.error('Failed to approve request:', error);
        }
    };

    const declineRequest = async (requestId: number) => {
        try {
            await axios.post(`/idea/${idea.slug}/collabo/requests/${requestId}/decline`);
            router.reload();
        } catch (error) {
            console.error('Failed to decline request:', error);
        }
    };

    const approveSuggestion = async (suggestionId: number) => {
        try {
            await axios.post(`/idea/${idea.slug}/suggestions/${suggestionId}/approve`);
            router.reload();
        } catch (error) {
            console.error('Failed to approve suggestion:', error);
        }
    };

    const declineSuggestion = async (suggestionId: number) => {
        try {
            await axios.post(`/idea/${idea.slug}/suggestions/${suggestionId}/decline`);
            router.reload();
        } catch (error) {
            console.error('Failed to decline suggestion:', error);
        }
    };

    const removeCollaborator = async (memberId: number) => {
        if (!confirm('Are you sure you want to remove this collaborator?')) {
            return;
        }

        try {
            await axios.delete(`/idea/${idea.slug}/collabo/collaborators/${memberId}`);
            router.reload();
        } catch (error) {
            console.error('Failed to remove collaborator:', error);
        }
    };

    const suggestions = idea.suggestions || [];
    const filteredSuggestions = suggestions.filter((s) => {
        if (filterType === 'all') {
return true;
}

        return s.status === filterType;
    });

    const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
    const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;

    return (
        <>
            <Head title={`Collaboration - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Header */}
                    <div className="border-b border-border bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-950/20 dark:to-blue-950/20">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                    <Link
                                        href={ideaRoutes.collabo.index().url}
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-foreground">{idea.idea_title}</h1>
                                    {idea.collaboration_enabled && (
                                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                                            <Users className="h-3 w-3" />
                                            Open
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    By <span className="font-medium text-foreground">{getDisplayName(idea.user)}</span>
                                    {idea.collaborators && idea.collaborators.length > 0 && (
                                        <span> • {idea.collaborators.length + 1} team members</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border">
                        <div className="flex gap-8 px-6">
                            <button
                                onClick={() => setActiveTab('suggestions')}
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                                    activeTab === 'suggestions'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Suggestions ({suggestions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('document')}
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                                    activeTab === 'document'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <FileText className="h-4 w-4" />
                                Idea Details
                            </button>
                            <button
                                onClick={() => setActiveTab('collaborators')}
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                                    activeTab === 'collaborators'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                Collaborators ({idea.collaborators.length + 1})
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid gap-6 p-6 md:grid-cols-3">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Suggestions Tab */}
                            {activeTab === 'suggestions' && (
                                <div className="space-y-4">
                                    {/* Filters */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Button
                                                variant={filterType === 'all' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setFilterType('all')}
                                            >
                                                All
                                            </Button>
                                            <Button
                                                variant={filterType === 'pending' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setFilterType('pending')}
                                            >
                                                Pending ({pendingCount})
                                            </Button>
                                            <Button
                                                variant={filterType === 'accepted' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setFilterType('accepted')}
                                            >
                                                Accepted ({acceptedCount})
                                            </Button>
                                        </div>
                                        {(isCollaborator || isOwner) && (
                                            <Button
                                                onClick={() => setShowSuggestionForm(true)}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Add Suggestion
                                            </Button>
                                        )}
                                    </div>

                                    {/* New Suggestion Form */}
                                    {showSuggestionForm && (
                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                                            <h3 className="mb-3 font-medium">New Suggestion</h3>
                                            <div className="mb-3">
                                                <Label className="mb-2 block text-sm">Which section does this relate to?</Label>
                                                <select
                                                    value={suggestionSection}
                                                    onChange={(e) => setSuggestionSection(e.target.value)}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                                >
                                                    <option value="abstract">Abstract</option>
                                                    <option value="problem_statement">Problem Statement</option>
                                                    <option value="proposed_solution">Proposed Solution</option>
                                                    <option value="cost_benefit">Cost-Benefit Analysis</option>
                                                    <option value="general">General</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <Textarea
                                                value={suggestionContent}
                                                onChange={(e) => setSuggestionContent(e.target.value)}
                                                placeholder="Share your suggestion or improvement idea..."
                                                className="mb-3 min-h-24"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowSuggestionForm(false);
                                                        setSuggestionContent('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={submitSuggestion}
                                                    disabled={submitting || !suggestionContent.trim()}
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Suggestions List */}
                                    {filteredSuggestions.length > 0 ? (
                                        <div className="space-y-4">
                                            {filteredSuggestions.map((suggestion) => {
                                                const SectionIcon = sectionIcons[suggestion.section] || FileText;

                                                return (
                                                    <div
                                                        key={suggestion.id}
                                                        className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                                                                {getAvatarLabel(getDisplayName(suggestion.user))}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="mb-2 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {getDisplayName(suggestion.user)}
                                                                        </span>
                                                                        <span className="text-muted-foreground">•</span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {getTimeAgo(suggestion.created_at)}
                                                                        </span>
                                                                    </div>
                                                                    <span
                                                                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                                            suggestion.status === 'accepted'
                                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                                : suggestion.status === 'rejected'
                                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                                        }`}
                                                                    >
                                                                        {suggestion.status === 'accepted' ? (
                                                                            <>
                                                                                <CheckCircle className="h-3 w-3" />
                                                                                Accepted
                                                                            </>
                                                                        ) : suggestion.status === 'rejected' ? (
                                                                            'Rejected'
                                                                        ) : (
                                                                            <>
                                                                                <Clock className="h-3 w-3" />
                                                                                Pending
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <div className="mb-3 flex items-center gap-2">
                                                                    <SectionIcon className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {sectionLabels[suggestion.section] || suggestion.section}
                                                                    </span>
                                                                </div>

                                                                <p className="mb-3 text-foreground">{suggestion.content}</p>

                                                                <div className="flex items-center gap-4">
                                                                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600">
                                                                        <ThumbsUp className="h-4 w-4" />
                                                                        <span>{suggestion.likes_count}</span>
                                                                    </button>
                                                                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600">
                                                                        <MessageSquare className="h-4 w-4" />
                                                                        <span>{suggestion.replies_count} replies</span>
                                                                    </button>

                                                                    {isOwner && suggestion.status === 'pending' && (
                                                                        <div className="ml-auto flex gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400"
                                                                                onClick={() => approveSuggestion(suggestion.id)}
                                                                            >
                                                                                <Check className="h-3 w-3" />
                                                                                Accept
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400"
                                                                                onClick={() => declineSuggestion(suggestion.id)}
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                                Decline
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">No suggestions yet</p>
                                            {(isCollaborator || isOwner) && (
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() => setShowSuggestionForm(true)}
                                                >
                                                    Add First Suggestion
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Idea Details Tab */}
                            {activeTab === 'document' && (
                                <div className="space-y-6">
                                    {idea.problem_statement && (
                                        <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-blue-300">
                                            <div className="mb-3 flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                <h3 className="font-semibold">Problem Statement</h3>
                                                <button className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Comment
                                                </button>
                                            </div>
                                            <p className="text-foreground leading-relaxed">{idea.problem_statement}</p>
                                        </div>
                                    )}

                                    {idea.proposed_solution && (
                                        <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-blue-300">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Lightbulb className="h-5 w-5 text-green-500" />
                                                <h3 className="font-semibold">Proposed Solution</h3>
                                                <button className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Comment
                                                </button>
                                            </div>
                                            <p className="text-foreground leading-relaxed">{idea.proposed_solution}</p>
                                        </div>
                                    )}

                                    {idea.cost_benefit && (
                                        <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-blue-300">
                                            <div className="mb-3 flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                                <h3 className="font-semibold">Cost-Benefit Analysis</h3>
                                                <button className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Comment
                                                </button>
                                            </div>
                                            <p className="text-foreground leading-relaxed">{idea.cost_benefit}</p>
                                        </div>
                                    )}

                                    {!idea.problem_statement && !idea.proposed_solution && !idea.cost_benefit && (
                                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">No details available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Collaborators Tab */}
                            {activeTab === 'collaborators' && (
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        People who have contributed suggestions and improvements to this idea
                                    </p>

                                    {/* Owner */}
                                    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            {idea.user?.avatar ? (
                                                <img
                                                    src={idea.user.avatar}
                                                    alt={getDisplayName(idea.user)}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                                                    {getAvatarLabel(getDisplayName(idea.user))}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium">{getDisplayName(idea.user)}</h4>
                                                <p className="text-sm text-muted-foreground">Owner</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Members */}
                                    {idea.collaborators.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {member.user?.avatar ? (
                                                    <img
                                                        src={member.user.avatar}
                                                        alt={getDisplayName(member.user)}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                                                        {getAvatarLabel(getDisplayName(member.user))}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-medium">{getDisplayName(member.user)}</h4>
                                                    <p className="text-sm text-muted-foreground">{member.role || 'Collaborator'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs ${
                                                        member.permissions === 'edit'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {member.permissions}
                                                </span>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => removeCollaborator(member.id)}
                                                        className="ml-3 text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {idea.collaborators.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">No collaborators yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Stats Card */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="mb-4 font-semibold">Collaboration Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Suggestions</span>
                                        <span className="font-bold">{suggestions.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Pending Review</span>
                                        <span className="font-bold text-yellow-600">{pendingCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Accepted</span>
                                        <span className="font-bold text-green-600">{acceptedCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Team Members</span>
                                        <span className="font-bold">{idea.collaborators.length + 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Collaboration Request (for non-collaborators) */}
                            {!isCollaborator && idea.collaboration_enabled && (
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/30">
                                    {userCollaborationRequest ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
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
                                                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Join the Team</h4>
                                                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                                        Request to collaborate and add suggestions.
                                                    </p>
                                                </div>
                                            </div>
                                            {showRequestForm ? (
                                                <div className="space-y-3">
                                                    <Textarea
                                                        placeholder="Add a message (optional)"
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

                            {/* Pending Requests (for owner) */}
                            {isOwner && idea.pending_collaboration_requests && idea.pending_collaboration_requests.length > 0 && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-950/30">
                                    <h3 className="mb-4 flex items-center gap-2 font-semibold">
                                        <UserPlus className="h-5 w-5 text-yellow-500" />
                                        Pending Requests ({idea.pending_collaboration_requests.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {idea.pending_collaboration_requests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-white p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                    {getAvatarLabel(getDisplayName(request.user))}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{getDisplayName(request.user)}</p>
                                                    {request.message && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{request.message}</p>
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
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="mb-4 font-semibold">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted"
                                        onClick={() => router.visit(ideaRoutes.show(idea.slug).url)}
                                    >
                                        <span>View Full Idea</span>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted"
                                        onClick={() => router.visit(comments.index({ idea: idea.slug }).url)}
                                    >
                                        <span>View Comments</span>
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    {isOwner && (
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted"
                                            onClick={() => router.visit(`/idea/${idea.slug}/team-members`)}
                                        >
                                            <span>Manage Team</span>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
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
            href: ideaRoutes.collabo.index(),
        },
        {
            title: 'Idea',
            href: ideaRoutes.collabo.show({ slug: ':slug' }).url,
        },
    ],
};