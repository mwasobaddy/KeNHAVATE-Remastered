'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Users } from 'lucide-react';
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

export default function PendingBoardCompilation({ ideas }: Props) {
    return (
        <>
            <Head title="Pending Board Compilation - DD Review" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={ideaRoutes.ddReview.index()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Pending Board Compilation</h1>
                            <p className="text-muted-foreground">
                                Board review deadline expired; compile all comments into one response
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

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Compile Board Feedback
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Review all Board comments and dispatch feedback to the author. Decision will be: approve, reject, or revise.
                    </p>
                </div>

                <IdeaList
                    ideas={ideas}
                    emptyMessage="No ideas pending Board compilation"
                />
            </div>
        </>
    );
}