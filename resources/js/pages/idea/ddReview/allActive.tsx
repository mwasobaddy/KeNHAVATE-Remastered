'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, Lightbulb } from 'lucide-react';
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

export default function AllActive({ ideas }: Props) {
    return (
        <>
            <Head title="All Active - DD Review" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={ideaRoutes.ddReview.index()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">All Active Ideas</h1>
                            <p className="text-muted-foreground">
                                All ideas currently in active review workflow
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

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Active Workflow
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        This includes all ideas that are not in terminal state (rejected, approved, implementation, closed).
                    </p>
                </div>

                <IdeaList
                    ideas={ideas}
                    emptyMessage="No active ideas in workflow"
                />
            </div>
        </>
    );
}