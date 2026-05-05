'use client';

import { Link } from '@inertiajs/react';
import {
    Lock,
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
    status_name?: string;
    stage_name?: string;
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

interface IdeaListProps {
    ideas: Idea[];
    emptyMessage: string;
    title?: string;
    showUnlockButton?: boolean;
}

export function IdeaList({ ideas, emptyMessage, title, showUnlockButton = false }: IdeaListProps) {
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [deadline, setDeadline] = useState('');
    const [unlocking, setUnlocking] = useState(false);

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
                <Card key={idea.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="line-clamp-1 text-lg">{idea.idea_title}</CardTitle>
                        <CardDescription>
                            {idea.thematic_area?.name || 'No thematic area'} • {getFullName(idea.user)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {idea.abstract || 'No abstract'}
                        </p>
                        <div className="text-xs text-muted-foreground mb-4">
                            Submitted: {formatDate(idea.created_at)}
                            {idea.dd_review?.review_deadline && (
                                <> • Deadline: {formatDate(idea.dd_review.review_deadline)}</>
                            )}
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <Link href={ideaRoutes.show(idea.slug).url} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </Link>
                            {showUnlockButton && idea.dd_review && !idea.dd_review.is_unlocked && (
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedIdea(idea);
                                        const defaultDeadline = new Date();
                                        defaultDeadline.setDate(defaultDeadline.getDate() + 14);
                                        setDeadline(defaultDeadline.toISOString().slice(0, 16));
                                        setShowUnlockModal(true);
                                    }}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Unlock
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default IdeaList;