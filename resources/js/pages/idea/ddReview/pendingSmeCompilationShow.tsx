'use client';

import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, User, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideaRoutes from '@/routes/idea';

interface User {
    id: number;
    first_name: string | null;
    other_names: string | null;
    email: string;
}

interface ThematicArea {
    id: number;
    name: string | null;
}

interface Status {
    id: number;
    name: string | null;
}

interface Stage {
    id: number;
    name: string | null;
}

interface DdReview {
    id: number;
    is_unlocked: boolean;
    review_deadline: string | null;
    status: string;
    feedback: string | null;
    feedback_sent_at: string | null;
}

interface SmeReview {
    id: number;
    status: string | null;
    review_comments: string | null;
    reviewer: User | null;
    created_at: string;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    created_at: string;
    user: User | null;
    thematic_area: ThematicArea | null;
    status: Status | null;
    stage: Stage | null;
    dd_review: DdReview | null;
    smeReviews: SmeReview[];
}

interface Props {
    idea: Idea;
}

export default function PendingSmeCompilationShow({ idea }: Props) {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitComment = () => {
        if (!comment.trim()) {
            return;
        }

        setSubmitting(true);
        router.post(ideaRoutes.ddReview.comment(idea.slug), {
            review_comments: comment,
        }, {
            onSuccess: () => {
                setComment('');
                setSubmitting(false);
                router.reload();
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <>
            <Head title={`Compile SME Feedback - ${idea.idea_title}`} />

            <div className="space-y-6">
                {/* Back button */}
                {/* back button. Redirect to previous history if it it not login or terms page. If it is login or terms, redirect back to http://127.0.0.1:8000/idea/dd-review */}
                <Link href={ideaRoutes.ddReview.index().url} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pending SME Compilation
                    </Button>
                </Link>

                <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 mt-2">
                            {idea.thematic_area && (
                                <Badge variant="secondary">{idea.thematic_area.name}</Badge>
                            )}
                            {idea.status && (
                                <Badge variant="outline">{idea.status.name}</Badge>
                            )}
                            {idea.stage && (
                                <Badge variant="outline">Stage: {idea.stage.name}</Badge>
                            )}
                        </div>
                    </div>

                {/* Idea Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Idea Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Abstract</Label>
                            <p className="mt-1">{idea.abstract || 'No abstract provided'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Problem Statement</Label>
                            <p className="mt-1">{idea.problem_statement || 'No problem statement provided'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Proposed Solution</Label>
                            <p className="mt-1">{idea.proposed_solution || 'No solution provided'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Cost Benefit Analysis</Label>
                            <p className="mt-1">{idea.cost_benefit_analysis || 'No analysis provided'}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{idea.user?.first_name} {idea.user?.other_names}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SME Reviews */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            SME Reviews ({idea.smeReviews?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {idea.smeReviews && idea.smeReviews.length > 0 ? (
                            <div className="space-y-4">
                                {idea.smeReviews.map((review) => (
                                    <div key={review.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {review.reviewer?.first_name} {review.reviewer?.other_names}
                                                </span>
                                            </div>
                                            <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                                                {review.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {review.review_comments || 'No comments provided'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No SME reviews yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* DD Comment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compile SME Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="comment">Add Your Compilation Comment</Label>
                            <Textarea
                                id="comment"
                                placeholder="Write your compilation of the SME feedback here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <Button 
                            onClick={handleSubmitComment}
                            disabled={!comment.trim() || submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Compilation'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}