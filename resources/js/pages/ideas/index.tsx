import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import ideas from '@/routes/ideas';

type Idea = {
    id: number;
    title: string;
    slug: string;
    status: string;
    collaboration_enabled: boolean;
    author: { id: number; name: string };
    category: { id: number; name: string };
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
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    submitted: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function IdeaIndex({ ideas: ideasData }: Props) {
    return (
        <>
            <Head title="Ideas" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Ideas"
                    description="Browse and manage innovation ideas"
                />

                <div className="flex justify-end">
                    <Button asChild>
                        <Link href={ideas.create()}>Submit New Idea</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Ideas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Title</th>
                                        <th className="pb-3 pr-4 font-medium">Category</th>
                                        <th className="pb-3 pr-4 font-medium">Author</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
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
                                                    {idea.category.name}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {idea.author.name}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                                                        {idea.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                                    {new Date(idea.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={ideas.show(idea.slug)}>View</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No ideas yet. Be the first to submit one!
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
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
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
        </>
    );
}
