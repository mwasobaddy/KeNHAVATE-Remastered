'use client';

import { Head, Link, router } from '@inertiajs/react';
import { Lock, ClipboardList, Users, Lightbulb, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ideaRoutes from '@/routes/idea';

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
    pendingSmeCompilationIdeas: Idea[];
    pendingBoardCompilationIdeas: Idea[];
    pendingSmeDecisionIdeas: Idea[];
    pendingBoardDecisionIdeas: Idea[];
    allActiveIdeas: Idea[];
}

const tabs = [
    { id: 'unlock', label: 'Pending Unlock', icon: Lock, getCount: (c: Counts) => c.pendingUnlock },
    { id: 'sme-compilation', label: 'Pending SME Compilation', icon: ClipboardList, getCount: (c: Counts) => c.pendingSmeCompilation },
    { id: 'board-compilation', label: 'Pending Board Compilation', icon: ClipboardList, getCount: (c: Counts) => c.pendingBoardCompilation },
    { id: 'sme-decision', label: 'Pending SME Decision', icon: Users, getCount: (c: Counts) => c.pendingSmeDecision },
    { id: 'board-decision', label: 'Pending Board Decision', icon: Users, getCount: (c: Counts) => c.pendingBoardDecision },
    { id: 'active', label: 'All Active', icon: Lightbulb, getCount: (c: Counts) => c.allActive },
];

function getDeadlineOptions() {
    const options = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        if (date.getDay() !== 0 && date.getDay() !== 6) {
            options.push(date.toISOString().split('T')[0]);
        }
    }

    return options.slice(0, 14);
}

export default function DdReviewIndex({ counts, pendingUnlockIdeas, pendingSmeCompilationIdeas, pendingBoardCompilationIdeas, pendingSmeDecisionIdeas, pendingBoardDecisionIdeas, allActiveIdeas }: Props) {
    const [activeTab, setActiveTab] = useState('unlock');
    const [searchQuery, setSearchQuery] = useState('');
    const [unlockingId, setUnlockingId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [reviewDeadline, setReviewDeadline] = useState('');

    const ideasMap: Record<string, Idea[]> = {
        unlock: pendingUnlockIdeas,
        'sme-compilation': pendingSmeCompilationIdeas,
        'board-compilation': pendingBoardCompilationIdeas,
        'sme-decision': pendingSmeDecisionIdeas,
        'board-decision': pendingBoardDecisionIdeas,
        active: allActiveIdeas,
    };

    const deadlineOptions = getDeadlineOptions();

    const currentIdeas = ideasMap[activeTab]?.filter((idea) =>
        idea.idea_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.thematic_area?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleUnlock = () => {
        if (!selectedIdea || !reviewDeadline) {
            return;
        }

        setUnlockingId(selectedIdea.id);
        
        router.post(ideaRoutes.ddReview.unlock(selectedIdea.slug), {
            review_deadline: reviewDeadline,
        }, {
            onSuccess: () => {
                setDialogOpen(false);
                setSelectedIdea(null);
                setReviewDeadline('');
                setUnlockingId(null);
                router.reload();
            },
            onError: () => {
                setUnlockingId(null);
            },
        });
    };

    const openUnlockDialog = (idea: Idea) => {
        setSelectedIdea(idea);
        setDialogOpen(true);
    };

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
                    <nav className="flex gap-4 overflow-x-auto">
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentIdeas.map((idea) => (
                            <Card key={idea.id} className="hover:shadow-md transition-shadow flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg line-clamp-2">
                                            <Link
                                                href={ideaRoutes.ddReview.show(idea.id)}
                                                className="hover:text-primary"
                                            >
                                                {idea.idea_title}
                                            </Link>
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="line-clamp-1">
                                        {idea.user?.first_name} {idea.user?.other_names}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pt-0">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        {idea.thematic_area && (
                                            <Badge variant="secondary">{idea.thematic_area.name}</Badge>
                                        )}
                                        {idea.status && (
                                            <Badge variant="outline">{idea.status.name}</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        Created {new Date(idea.created_at).toLocaleDateString()}
                                    </div>
                                    
                                    {activeTab === 'unlock' ? (
                                        <Button 
                                            className="w-full" 
                                            size="sm"
                                            onClick={() => openUnlockDialog(idea)}
                                            disabled={unlockingId === idea.id}
                                        >
                                            {unlockingId === idea.id ? (
                                                <>Unlocking...</>
                                            ) : (
                                                <>
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    Unlock for Review
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Link 
                                            href={
                                                activeTab === 'sme-compilation' ? ideaRoutes.ddReview.pendingSmeCompilation.show({ slug: idea.slug }).url :
                                                activeTab === 'board-compilation' ? ideaRoutes.ddReview.pendingBoardCompilation().url :
                                                activeTab === 'sme-decision' ? ideaRoutes.ddReview.pendingSmeDecision().url :
                                                activeTab === 'board-decision' ? ideaRoutes.ddReview.pendingBoardDecision().url :
                                                activeTab === 'active' ? ideaRoutes.ddReview.active().url :
                                                ideaRoutes.ddReview.show(idea.id)
                                            } 
                                            className="block"
                                        >
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Unlock Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unlock Idea for Review</DialogTitle>
                        <DialogDescription>
                            Set a review deadline for {selectedIdea?.idea_title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="deadline">Review Deadline</Label>
                        <Select value={reviewDeadline} onValueChange={setReviewDeadline}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select a deadline" />
                            </SelectTrigger>
                            <SelectContent>
                                {deadlineOptions.map((date) => (
                                    <SelectItem key={date} value={date}>
                                        {new Date(date).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUnlock} 
                            disabled={!reviewDeadline || unlockingId !== null}
                        >
                            {unlockingId ? 'Unlocking...' : 'Unlock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}