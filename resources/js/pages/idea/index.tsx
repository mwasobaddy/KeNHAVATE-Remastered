import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { ViewButton, EditButton } from '@/components/action-buttons';
import idea from '@/routes/idea';
import comments from '@/routes/idea/comments';

type ThematicArea = {
    name: string;
};

type TeamMember = {
    id: number;
    role: string | null;
    permissions: 'view' | 'edit';
};

type IdeaItem = {
    id: number;
    idea_title: string;
    status: string;
    thematic_area?: ThematicArea;
    slug: string;
    team_members?: TeamMember[];
    likes_count?: number;
    comments_count?: number;
    user_has_liked?: boolean;
};

type IdeasProp = {
    data: IdeaItem[];
    links?: Record<string, string>;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
};

interface IdeaIndexProps {
    ideas: IdeasProp;
    thematicAreas: ThematicArea[];
    activeTab: string;
    tabCounts: Record<string, number>;
}

export default function IdeaIndex({ ideas, activeTab, tabCounts }: IdeaIndexProps) {
    const [likingStates, setLikingStates] = useState<Record<number, boolean>>({});

    const tabs = [
        { key: 'mine', label: `Mine (${tabCounts?.mine ?? 0})` },
        { key: 'team', label: `Team (${tabCounts?.team ?? 0})` },
        { key: 'public', label: `Public (${tabCounts?.public ?? 0})` },
        { key: 'public', label: `Collabo (${tabCounts?.public ?? 0})` },
    ];

    const handleTabChange = (tab: string) => {
        router.get(idea.index().url, { tab }, { preserveState: true });
    };

    const getTeamMemberForIdea = (ideaItem: IdeaItem): TeamMember | null => {
        if (!ideaItem.team_members || ideaItem.team_members.length === 0) {
            return null;
        }

        return ideaItem.team_members[0];
    };

    const toggleLike = (ideaItem: IdeaItem) => {
        setLikingStates(prev => ({ ...prev, [ideaItem.id]: true }));

        axios.post('/likes', {
            likeable_type: 'idea',
            likeable_id: ideaItem.id,
        })
    .then(() => {
        router.reload({ only: ['ideas'] });
    })
        .catch(() => {
            // Handle error silently
        })
        .finally(() => {
            setLikingStates(prev => {
                
                const newState = { ...prev };
                delete newState[ideaItem.id];

                return newState;
            });
        });
    };

    return (
        <>
            <Head title="Ideas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Ideas</h1>
                                <p className="mt-2 text-muted-foreground">Manage and browse all ideas</p>
                            </div>
                            {activeTab !== 'public' && (
                                <Link href={idea.create().url}>
                                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                        Create Idea
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="mt-6 border-b">
                            <div className="flex gap-4 flex-between">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`border-b-2 px-2 py-2 text-sm font-medium ${
                                            activeTab === tab.key
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            {ideas.data.length === 0 ? (
                                <p className="text-muted-foreground">No ideas found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ideas.data.map((ideaItem: IdeaItem) => {
                                        const teamMember = getTeamMemberForIdea(ideaItem);

                                        return (
                                            <div key={ideaItem.id} className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{ideaItem.idea_title}</h3>
                                                            {teamMember && (
                                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                                    {teamMember.role || 'Team Member'} ({teamMember.permissions})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Status: {ideaItem.status}
                                                        </p>
                                                        {ideaItem.thematic_area && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {ideaItem.thematic_area.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {/* Like Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleLike(ideaItem)}
                                                            disabled={likingStates[ideaItem.id]}
                                                            className={`flex items-center gap-1 ${
                                                                ideaItem.user_has_liked ? 'text-red-500' : 'text-muted-foreground'
                                                            } hover:text-red-500 transition-colors`}
                                                        >
                                                            <Heart className={`h-5 w-5 ${ideaItem.user_has_liked ? 'fill-current' : ''}`} />
                                                            <span className="text-sm">{ideaItem.likes_count ?? 0}</span>
                                                        </button>

                                                        {/* Comment Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => router.visit(comments.index({ idea: ideaItem.slug }).url)}
                                                            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            <MessageCircle className="h-5 w-5" />
                                                            <span className="text-sm">{ideaItem.comments_count ?? 0}</span>
                                                        </button>

                                                        <div className="flex items-center gap-1">
                                                            <ViewButton onClick={() => router.visit(idea.show(ideaItem.slug).url)} />
                                                            {(activeTab !== 'public' && teamMember?.permissions === 'edit') || activeTab === 'mine' ? (
                                                                <EditButton onClick={() => router.visit(idea.edit(ideaItem.slug).url)} />
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

IdeaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
    ],
};
