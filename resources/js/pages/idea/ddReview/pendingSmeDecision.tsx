'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ideaRoutes from '@/routes/idea';
import IdeaList from './components/IdeaList';

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

interface Props {
    ideas: Idea[];
}

export default function PendingSmeDecision({ ideas }: Props) {
    return (
        <>
            <Head title="Pending SME Decision - DD Review" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={ideaRoutes.ddReview.index()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Pending SME Decision</h1>
                            <p className="text-muted-foreground">
                                Delegated SME has reviewed; awaiting DD final call
                            </p>
                        </div>
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

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Hourglass className="h-4 w-4" />
                        Awaiting Decision
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Review the delegated SME feedback and make final decision: Approve, Reject, or Request Revision.
                    </p>
                </div>

                <IdeaList
                    ideas={ideas}
                    emptyMessage="No ideas pending SME decision"
                />
            </div>
        </>
    );
}