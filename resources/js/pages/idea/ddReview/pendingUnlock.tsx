'use client';

import { Head, Link } from '@inertiajs/react';
import { Lock, ArrowLeft, Users } from 'lucide-react';
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

export default function PendingUnlock({ ideas }: Props) {
    return (
        <>
            <Head title="Pending Unlock - DD Review" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={ideaRoutes.ddReview.index()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Pending Unlock</h1>
                            <p className="text-muted-foreground">
                                Ideas submitted; awaiting DD action to unlock for review
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

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Action Required
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Click "Unlock" on each idea to open it for SME review. Set a review deadline when unlocking.
                    </p>
                </div>

                <IdeaList
                    ideas={ideas}
                    emptyMessage="No ideas waiting to be unlocked"
                    showUnlockButton={true}
                />
            </div>
        </>
    );
}