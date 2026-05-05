'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    FileText,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Users,
    Eye,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ideaRoutes from '@/routes/idea';

interface User {
    id: number;
    first_name: string;
    other_names: string;
    email: string;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface DdReview {
    id: number;
    is_unlocked: boolean;
    review_deadline: string | null;
    status: string;
    review_comments: string | null;
    created_at: string;
}

interface SmeReview {
    id: number;
    status: string;
    review_comments: string | null;
    reviewer_id: number;
    created_at: string;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    status: string;
    user: User | null;
    thematic_area: ThematicArea | null;
    dd_review: DdReview | null;
    sme_reviews: SmeReview[];
    created_at: string;
}

interface DdReviewIndexProps {
    lockedNewIdeas: Idea[];
    ddReviewedIdeas: Idea[];
    smeReviewedIdeas: Idea[];
    stage1RevisedIdeas: Idea[];
    stage2RevisedIdeas: Idea[];
}

function getFullName(user: User | null): string {
    if (!user) {
        return 'Unknown';
    }

    return `${user.first_name} ${user.other_names || ''}`.trim();
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getDeadlineStatus(deadline: string | null): { text: string; color: string } {
    if (!deadline) {
        return { text: 'No deadline', color: 'text-muted-foreground' };
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
        return { text: 'Expired', color: 'text-red-600' };
    }

    if (days === 0) {
        return { text: 'Due today', color: 'text-orange-600' };
    }

    if (days <= 3) {
        return { text: `${days} days left`, color: 'text-orange-600' };
    }

    return { text: `${days} days left`, color: 'text-green-600' };
}

function IdeaCard({
    idea,
    action,
    showDeadline = false,
}: {
    idea: Idea;
    action: React.ReactNode;
    showDeadline?: boolean;
}) {
    const deadlineStatus = showDeadline && idea.dd_review?.review_deadline
        ? getDeadlineStatus(idea.dd_review.review_deadline)
        : null;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                    {idea.idea_title}
                </CardTitle>
                <CardDescription>
                    By {getFullName(idea.user)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {idea.thematic_area && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Thematic Area: </span>
                            {idea.thematic_area.name}
                        </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                        Submitted: {formatDate(idea.created_at)}
                    </div>
                    {deadlineStatus && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Deadline:</span>
                            <span className={`font-medium ${deadlineStatus.color}`}>
                                {deadlineStatus.text}
                            </span>
                        </div>
                    )}
                    {action}
                </div>
            </CardContent>
        </Card>
    );
}

function IdeaList({
    ideas,
    emptyMessage,
    action,
}: {
    ideas: Idea[];
    emptyMessage: string;
    action: (idea: Idea) => React.ReactNode;
}) {
    if (ideas.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {emptyMessage}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
                <IdeaCard
                    key={idea.id}
                    idea={idea}
                    action={action(idea)}
                />
            ))}
        </div>
    );
}

export default function DdReviewIndex({
    lockedNewIdeas,
    ddReviewedIdeas,
    smeReviewedIdeas,
    stage1RevisedIdeas,
    stage2RevisedIdeas,
}: DdReviewIndexProps) {
    const { props } = usePage();
    const queryParams = props.query as Record<string, string>;

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [deadline, setDeadline] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    const activeMainTab = queryParams.tab || 'locked';
    const activeReviewedSubTab = queryParams.reviewed_tab || 'dd';
    const activeRevisedSubTab = queryParams.revised_tab || 'stage2';

    const handleMainTabChange = (tab: string) => {
        router.get(ideaRoutes.ddReview.index().url, { tab, reviewed_tab: 'dd', revised_tab: 'stage2' }, { preserveState: true });
    };

    const handleReviewedSubTabChange = (tab: string) => {
        router.get(ideaRoutes.ddReview.index().url, { ...queryParams, reviewed_tab: tab }, { preserveState: true });
    };

    const handleRevisedSubTabChange = (tab: string) => {
        router.get(ideaRoutes.ddReview.index().url, { ...queryParams, revised_tab: tab }, { preserveState: true });
    };

    const handleUnlock = () => {
        if (!selectedIdea || !deadline) {
            return;
        }

        setUnlocking(true);
        router.post(`/idea/${selectedIdea.slug}/dd-review/unlock`, {
            review_deadline: deadline,
        }, {
            onSuccess: () => {
                setShowUnlockModal(false);
                setUnlocking(false);
                router.reload();
            },
            onError: () => {
                console.error('Failed to unlock idea');
                alert('Failed to unlock idea');
                setUnlocking(false);
            },
        });
    };

    const openUnlockModal = (idea: Idea) => {
        setSelectedIdea(idea);
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 14);
        setDeadline(defaultDeadline.toISOString().slice(0, 16));
        setShowUnlockModal(true);
    };

    const renderUnlockButton = (idea: Idea) => (
        <Button className="w-full" onClick={() => openUnlockModal(idea)}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Unlock for Review
        </Button>
    );

    const renderViewButton = (idea: Idea) => (
        <Link href={ideaRoutes.show(idea.slug).url} className="w-full">
            <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Details
            </Button>
        </Link>
    );

    const renderReviewButton = (idea: Idea) => (
        <div className="flex gap-2">
            <Link href={ideaRoutes.show(idea.slug).url} className="flex-1">
                <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </Button>
            </Link>
            {idea.dd_review && (
                <Link href={ideaRoutes.ddReview.show(idea.dd_review.id).url} className="flex-1">
                    <Button className="w-full">
                        Review
                    </Button>
                </Link>
            )}
        </div>
    );

    const tabs = [
        { key: 'locked', label: `Locked / New (${lockedNewIdeas.length})`, icon: AlertCircle },
        { key: 'reviewed', label: `Reviewed (${ddReviewedIdeas.length + smeReviewedIdeas.length})`, icon: CheckCircle },
        { key: 'revised', label: `Revised (${stage1RevisedIdeas.length + stage2RevisedIdeas.length})`, icon: RefreshCw },
    ];

    const reviewedSubTabs = [
        { key: 'dd', label: `DD Reviewed (${ddReviewedIdeas.length})` },
        { key: 'sme', label: `SME Reviewed (${smeReviewedIdeas.length})` },
    ];

    const revisedSubTabs = [
        { key: 'stage2', label: `Stage 2 - DD (${stage2RevisedIdeas.length})` },
        { key: 'stage1', label: `Stage 1 - SME (${stage1RevisedIdeas.length})` },
    ];

    return (
        <>
            <Head title="DD Review Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">DD Review Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage ideas submitted for Deputy Director review
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={ideaRoutes.ddReview.dashboard()}>
                            <Button variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Analytics
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Tabs - Using the same style as idea/index.tsx */}
                <div className="border-b">
                    <div className="flex gap-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleMainTabChange(tab.key)}
                                    className={`flex items-center gap-2 border-b-2 px-2 py-3 text-sm font-medium ${
                                        activeMainTab === tab.key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Tab Content */}
                <div className="mt-6">
                    {/* Locked / New Tab */}
                    {activeMainTab === 'locked' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Pending Submission Review ({lockedNewIdeas.length})
                            </h2>
                            <IdeaList
                                ideas={lockedNewIdeas}
                                emptyMessage="No draft ideas waiting for review"
                                action={renderUnlockButton}
                            />
                        </div>
                    )}

                    {/* Reviewed Tab */}
                    {activeMainTab === 'reviewed' && (
                        <div className="space-y-4">
                            {/* Reviewed Sub-tabs */}
                            <div className="border-b">
                                <div className="flex gap-4">
                                    {reviewedSubTabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleReviewedSubTabChange(tab.key)}
                                            className={`border-b-2 px-2 py-2 text-sm font-medium ${
                                                activeReviewedSubTab === tab.key
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reviewed Sub-tab Content */}
                            {activeReviewedSubTab === 'dd' && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {ddReviewedIdeas.map((idea) => (
                                        <Card key={idea.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg line-clamp-2">
                                                        {idea.idea_title}
                                                    </CardTitle>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        idea.status === 'dd_approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {idea.status === 'dd_approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                </div>
                                                <CardDescription>
                                                    By {getFullName(idea.user)}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {idea.thematic_area && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Thematic Area: </span>
                                                            {idea.thematic_area.name}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-muted-foreground">
                                                        Reviewed: {formatDate(idea.dd_review?.created_at || idea.created_at)}
                                                    </div>
                                                    {idea.dd_review?.review_comments && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Comments: </span>
                                                            <span className="line-clamp-2">{idea.dd_review.review_comments}</span>
                                                        </div>
                                                    )}
                                                    {renderViewButton(idea)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {activeReviewedSubTab === 'sme' && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {smeReviewedIdeas.map((idea) => (
                                        <Card key={idea.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg line-clamp-2">
                                                    {idea.idea_title}
                                                </CardTitle>
                                                <CardDescription>
                                                    By {getFullName(idea.user)}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {idea.thematic_area && (
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Thematic Area: </span>
                                                            {idea.thematic_area.name}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">SME Reviews: </span>
                                                        <span className="font-medium">{idea.sme_reviews?.length || 0}</span>
                                                    </div>
                                                    {renderReviewButton(idea)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {activeReviewedSubTab === 'dd' && ddReviewedIdeas.length === 0 && (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No DD reviewed ideas
                                    </CardContent>
                                </Card>
                            )}

                            {activeReviewedSubTab === 'sme' && smeReviewedIdeas.length === 0 && (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No SME reviewed ideas pending DD review
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Revised Tab */}
                    {activeMainTab === 'revised' && (
                        <div className="space-y-4">
                            {/* Revised Sub-tabs */}
                            <div className="border-b">
                                <div className="flex gap-4">
                                    {revisedSubTabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleRevisedSubTabChange(tab.key)}
                                            className={`border-b-2 px-2 py-2 text-sm font-medium ${
                                                activeRevisedSubTab === tab.key
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Revised Sub-tab Content */}
                            {activeRevisedSubTab === 'stage2' && (
                                <>
                                    <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4 mb-4">
                                        <h3 className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Ideas sent back after DD Review
                                        </h3>
                                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                            These ideas were returned by the Deputy Director for revision and have been resubmitted by the user.
                                        </p>
                                    </div>
                                    <IdeaList
                                        ideas={stage2RevisedIdeas}
                                        emptyMessage="No ideas sent back for revision after DD review"
                                        action={renderViewButton}
                                    />
                                </>
                            )}

                            {activeRevisedSubTab === 'stage1' && (
                                <>
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                                        <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Ideas sent back after SME Review
                                        </h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            These ideas were returned by SME reviewers for revision and have been resubmitted by the user.
                                        </p>
                                    </div>
                                    <IdeaList
                                        ideas={stage1RevisedIdeas}
                                        emptyMessage="No ideas sent back for revision after SME review"
                                        action={renderViewButton}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Unlock Modal */}
            {showUnlockModal && selectedIdea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            Unlock: {selectedIdea.idea_title}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="deadline">Review Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Reviewers will be notified and can comment until this deadline
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowUnlockModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleUnlock}
                                    disabled={unlocking || !deadline}
                                >
                                    {unlocking ? 'Unlocking...' : 'Unlock'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

DdReviewIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: ideaRoutes.index(),
        },
        {
            title: 'DD Reviews',
            href: ideaRoutes.ddReview.index(),
        },
    ],
};