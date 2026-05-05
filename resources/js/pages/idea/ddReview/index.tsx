'use client';

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Lock, ClipboardList, Users, Lightbulb, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ideaRoutes from '@/routes/idea';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    first_name: string;
    other_names: string;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Status {
    id: number;
    name: string;
}

interface DdReview {
    id: number;
    review_deadline: string | null;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    created_at: string;
    user: User | null;
    thematic_area: ThematicArea | null;
    status: Status | null;
    dd_review: DdReview | null;
}

interface Counts {
    pendingUnlock: number;
    pendingSmeCompilation: number;
    pendingBoardCompilation: number;
    pendingSmeDecision: number;
    pendingBoardDecision: number;
    allActive: number;
}

interface Props {
    counts: Counts;
    pendingUnlockIdeas: Idea[];
    pendingCompilationIdeas: Idea[];
    pendingDecisionIdeas: Idea[];
    allActiveIdeas: Idea[];
}

const tabs = [
    { id: 'unlock', label: 'Pending Unlock', icon: Lock, getCount: (c: Counts) => c.pendingUnlock },
    { id: 'compilation', label: 'Pending Compilation', icon: ClipboardList, getCount: (c: Counts) => c.pendingSmeCompilation + c.pendingBoardCompilation },
    { id: 'decision', label: 'Pending Decision', icon: Users, getCount: (c: Counts) => c.pendingSmeDecision + c.pendingBoardDecision },
    { id: 'active', label: 'All Active', icon: Lightbulb, getCount: (c: Counts) => c.allActive },
];

export default function DdReviewIndex({ counts, pendingUnlockIdeas, pendingCompilationIdeas, pendingDecisionIdeas, allActiveIdeas }: Props) {
    const [activeTab, setActiveTab] = useState('unlock');
    const [searchQuery, setSearchQuery] = useState('');

    const ideasMap: Record<string, Idea[]> = {
        unlock: pendingUnlockIdeas,
        compilation: pendingCompilationIdeas,
        decision: pendingDecisionIdeas,
        active: allActiveIdeas,
    };

    const currentIdeas = ideasMap[activeTab]?.filter((idea) =>
        idea.idea_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.thematic_area?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const activeTabData = tabs.find((t) => t.id === activeTab);

    return (
        <>
            <Head title="DD Review" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">DD Review</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage ideas through the Deputy Director review process
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <nav className="flex gap-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const count = tab.getCount(counts);
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {count > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {count}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search ideas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {currentIdeas.length} ideas
                    </span>
                </div>

                {/* Ideas List */}
                {currentIdeas.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-center">
                                <p className="text-muted-foreground">No ideas found</p>
                                {searchQuery && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Try adjusting your search
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {currentIdeas.map((idea) => (
                            <Card key={idea.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={ideaRoutes.ddReview.show(idea.slug)}
                                                className="text-lg font-medium hover:text-primary truncate block"
                                            >
                                                {idea.idea_title}
                                            </Link>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>{idea.user?.first_name} {idea.user?.other_names}</span>
                                                {idea.thematic_area && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{idea.thematic_area.name}</span>
                                                    </>
                                                )}
                                                {idea.status && (
                                                    <>
                                                        <span>•</span>
                                                        <Badge variant="outline">{idea.status.name}</Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {idea.dd_review?.review_deadline && (
                                                <span className="text-sm text-muted-foreground">
                                                    Due: {new Date(idea.dd_review.review_deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                            <Link href={ideaRoutes.ddReview.show(idea.slug)}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}