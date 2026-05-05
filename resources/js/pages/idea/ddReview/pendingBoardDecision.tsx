'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, CheckCircle } from 'lucide-react';
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

interface Props {
    ideas: Idea[];
}

export default function PendingBoardDecision({ ideas }: Props) {
    return (
        <>
            <Head title="Pending Board Decision - DD Review" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={ideaRoutes.ddReview.index()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Pending Board Decision</h1>
                            <p className="text-muted-foreground">
                                SME stage cleared; awaiting Board scheduling and review
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

                <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Awaiting Board Decision
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                        Ideas cleared from SME stage, awaiting Board scheduling and final decision.
                    </p>
                </div>

                <IdeaList
                    ideas={ideas}
                    emptyMessage="No ideas pending Board decision"
                />
            </div>
        </>
    );
}