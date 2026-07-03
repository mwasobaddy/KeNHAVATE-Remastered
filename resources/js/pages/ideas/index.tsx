import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Idea = {
    id: number;
    title: string;
    slug: string;
    status: string;
    collaboration_enabled: boolean;
    collaboration_status?: 'pending' | 'approved' | 'rejected' | null;
    author: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    created_at: string;
};

type PaginatedData = {
    data: Idea[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    ideas: PaginatedData;
    currentTab: string;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

const collabVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

const collabLabels: Record<string, string> = {
    pending: 'Requested',
    approved: 'Approved',
    rejected: 'Declined',
};

const TABS = [
    { key: 'my-ideas', label: 'My Ideas' },
    { key: 'open-for-collaboration', label: 'Open for Collaboration' },
    { key: 'my-contributions', label: 'My Contributions' },
] as const;

export default function IdeaIndex({ ideas: ideasData, currentTab }: Props) {
    const colSpan = currentTab === 'my-ideas' ? 5 : 7;
    const [deleteIdea, setDeleteIdea] = useState<Idea | null>(null);

    const confirmDelete = () => {
        if (!deleteIdea) {
            return;
        }

        router.delete(ideas.destroy(deleteIdea.slug).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteIdea(null),
        });
    };

    return (
        <TooltipProvider>
            <>
                <Head title="Ideas" />

                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <Heading
                            title="Ideas"
                            description="Browse and manage innovation ideas"
                        />
                        <Button asChild>
                            <Link href={ideas.create()}>Submit New Idea</Link>
                        </Button>
                    </div>

                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {TABS.map((tab) => (
                            <Link
                                key={tab.key}
                                href={ideas.index().url + (tab.key !== 'my-ideas' ? `?tab=${tab.key}` : '')}
                                preserveState
                                preserveScroll
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    currentTab === tab.key
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {TABS.find((t) => t.key === currentTab)?.label ?? 'Ideas'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium">Title</th>
                                            <th className="pb-3 pr-4 font-medium">Category</th>
                                            {currentTab !== 'my-ideas' && (
                                                <th className="pb-3 pr-4 font-medium">Author</th>
                                            )}
                                            <th className="pb-3 pr-4 font-medium">Status</th>
                                            {currentTab === 'open-for-collaboration' && (
                                                <th className="pb-3 pr-4 font-medium">Collaboration</th>
                                            )}
                                            {currentTab === 'my-contributions' && (
                                                <th className="pb-3 pr-4 font-medium">Role</th>
                                            )}
                                            <th className="pb-3 pr-4 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ideasData.data.length > 0 ? (
                                            ideasData.data.map((idea) => (
                                                <tr key={idea.id} className="border-b last:border-0">
                                                    <td className="py-3 pr-4 font-medium">
                                                        {idea.title}
                                                    </td>
                                                    <td className="py-3 pr-4 text-muted-foreground">
                                                        {idea.category?.name ?? 'Uncategorized'}
                                                    </td>
                                                    {currentTab !== 'my-ideas' && (
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {idea.author?.name ?? 'Unknown'}
                                                        </td>
                                                    )}
                                                    <td className="py-3 pr-4">
                                                        <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                                                            {idea.status}
                                                        </Badge>
                                                    </td>
                                                    {currentTab === 'open-for-collaboration' && (
                                                        <td className="py-3 pr-4">
                                                            {idea.collaboration_status ? (
                                                                <Badge
                                                                    variant={collabVariants[idea.collaboration_status] ?? 'outline'}
                                                                >
                                                                    {collabLabels[idea.collaboration_status] ?? idea.collaboration_status}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">Open</Badge>
                                                            )}
                                                        </td>
                                                    )}
                                                    {currentTab === 'my-contributions' && (
                                                        <td className="py-3 pr-4">
                                                            <Badge variant="secondary">Contributor</Badge>
                                                        </td>
                                                    )}
                                                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                                        {new Date(idea.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-0.5">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" asChild>
                                                                        <Link href={ideas.show(idea.slug)}>
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View</TooltipContent>
                                                            </Tooltip>

                                                            {currentTab === 'my-ideas' && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" asChild>
                                                                                <Link href={ideas.edit(idea.slug)}>
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => setDeleteIdea(idea)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Delete</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}

                                                            {currentTab === 'open-for-collaboration' && !idea.collaboration_status && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" asChild>
                                                                            <Link href={ideas.show(idea.slug)}>
                                                                                <UserPlus className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Request to Collaborate</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                                                    {currentTab === 'my-ideas'
                                                        ? "You haven't submitted any ideas yet."
                                                        : currentTab === 'open-for-collaboration'
                                                          ? 'No ideas open for collaboration right now.'
                                                          : "You haven't been invited as a contributor to any ideas."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {ideasData.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {ideasData.from} to {ideasData.to} of {ideasData.total} entries
                                    </p>
                                    <div className="flex gap-2">
                                        {ideasData.links.map((link, i) => {
                                            if (!link.url || link.label === '...') {
                                                return (
                                                    <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                        {link.label}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                                    <Link href={link.url} preserveState preserveScroll>
                                                        {link.label}
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={deleteIdea !== null} onOpenChange={(open) => {
 if (!open) {
setDeleteIdea(null);
} 
}}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Idea</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete &ldquo;{deleteIdea?.title}&rdquo;? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteIdea(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        </TooltipProvider>
    );
}
