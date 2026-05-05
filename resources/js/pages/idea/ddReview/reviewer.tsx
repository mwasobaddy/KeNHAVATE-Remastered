'use client';

import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Clock,
    MessageSquare,
    CheckCircle,
    AlertCircle,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    created_at: string;
}

interface ReviewerPageProps {
    assignedReviews: Idea[];
}

function getFullName(user: User | null): string {
    if (!user) {
return 'Unknown';
}

    return `${user.first_name} ${user.other_names || ''}`.trim();
}

function getDeadlineStatus(deadline: string | null): { text: string; color: string; canComment: boolean } {
    if (!deadline) {
return { text: 'No deadline', color: 'text-muted-foreground', canComment: false };
}

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
return { text: 'Expired', color: 'text-red-600', canComment: false };
}

    if (days === 0) {
return { text: 'Due today', color: 'text-orange-600', canComment: true };
}

    if (days <= 3) {
return { text: `${days} days left`, color: 'text-orange-600', canComment: true };
}

    return { text: `${days} days left`, color: 'text-green-600', canComment: true };
}

export default function ReviewerPage({ assignedReviews }: ReviewerPageProps) {
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);

    const submitComment = () => {
        if (!selectedIdea || !comment.trim()) {
return;
}

        setSubmitting(true);
        router.post(`/idea/${selectedIdea.slug}/dd-review/comment`, {
            review_comments: comment,
        }, {
            onSuccess: () => {
                setShowCommentModal(false);
                setComment('');
                router.reload();
            },
            onError: () => {
                console.error('Failed to submit comment');
                alert('Failed to submit comment. The deadline may have passed.');
                setSubmitting(false);
            },
        });
    };

    const openCommentModal = (idea: Idea) => {
        setSelectedIdea(idea);
        setComment('');
        setShowCommentModal(true);
    };

    return (
        <>
            <Head title="DD Review - Reviewer" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Review Assignments</h1>
                        <p className="text-muted-foreground">
                            Ideas assigned for your review
                        </p>
                    </div>
                </div>

                {assignedReviews.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No ideas assigned for review yet.</p>
                            <p className="text-sm mt-2">
                                Deputy Directors will assign ideas for review after unlocking them.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {assignedReviews.map((idea) => {
                            const deadlineStatus = getDeadlineStatus(idea.dd_review?.review_deadline || null);
                            const canAddComment = idea.dd_review?.is_unlocked && deadlineStatus.canComment;

                            return (
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

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Deadline:</span>
                                                <span className={`font-medium ${deadlineStatus.color}`}>
                                                    {deadlineStatus.text}
                                                </span>
                                            </div>

                                             {idea.dd_review?.is_unlocked ? (
                                                 <div className="flex items-center gap-2 text-sm text-green-600">
                                                     <CheckCircle className="h-4 w-4" />
                                                     <span>Open for review</span>
                                                 </div>
                                             ) : (
                                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                     <AlertCircle className="h-4 w-4" />
                                                     <span>Not yet unlocked</span>
                                                 </div>
                                             )}

                                             {idea.dd_review?.review_comments && (
                                                 <div className="text-sm">
                                                     <span className="text-muted-foreground">Your comments: </span>
                                                     <span className="line-clamp-2">
                                                         {idea.dd_review.review_comments.slice(-200)}
                                                     </span>
                                                 </div>
                                             )}

                                            <div className="flex gap-2">
                                                <Link
                                                    href={ideaRoutes.show(idea.slug).url}
                                                    className="flex-1"
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                                {canAddComment ? (
                                                    <Button
                                                        className="flex-1"
                                                        onClick={() => openCommentModal(idea)}
                                                    >
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Comment
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="flex-1"
                                                        variant="secondary"
                                                        disabled
                                                    >
                                                        {deadlineStatus.text === 'Expired' ? 'Expired' : 'Locked'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Comment Modal */}
            {showCommentModal && selectedIdea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">
                            Add Review Comment
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Idea: {selectedIdea.idea_title}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="comment">Your Comments</Label>
                                <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Enter your review comments, suggestions, or feedback..."
                                    className="min-h-32"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCommentModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={submitComment}
                                    disabled={submitting || !comment.trim()}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Comment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}