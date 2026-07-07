import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ideas from '@/routes/ideas';

type PaginatedData = {
    data: Array<{
        id: number;
        title: string;
        slug: string;
        status: string;
        created_at: string;
        author: { id: number; name: string };
        category: { id: number; name: string } | null;
        assigned_officer?: { id: number; name: string } | null;
    }>;
    meta: { current_page: number; last_page: number; total: number };
};

type Props = {
    currentTab: string;
    pendingAssignment: PaginatedData | null;
    myAssignments: PaginatedData | null;
    canAssign: boolean;
    canClassify: boolean;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    submitted: 'default',
    assigned: 'secondary',
    resubmitted: 'warning' as any,
};

const tabs = [
    { key: 'pending-assignment', label: 'Pending Assignment', gate: 'canAssign' as const },
    { key: 'my-assignments', label: 'My Assignments', gate: 'canClassify' as const },
];

function switchTab(tab: string) {
    router.get(ideas.review(), { tab }, { preserveState: true, preserveScroll: true });
}

export default function ReviewIndex({ currentTab, pendingAssignment, myAssignments, canAssign, canClassify }: Props) {
    const availableTabs = tabs.filter((t) => ({ canAssign, canClassify }[t.gate]));
    const currentData = { 'pending-assignment': pendingAssignment, 'my-assignments': myAssignments }[currentTab] ?? null;
    const visibleTabs = availableTabs.length > 1;

    return (
        <>
            <Head title="Review Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading title="Review Dashboard" description="Manage ideas in the review pipeline" />

                {visibleTabs && (
                    <div className="flex gap-1 rounded-lg bg-muted p-1">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => switchTab(tab.key)}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    currentTab === tab.key
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {currentData && currentData.data.length > 0 ? (
                    <div className="space-y-4">
                        {currentData.data.map((idea) => (
                            <Card key={idea.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                <Link href={ideas.show(idea.slug)} className="hover:underline">
                                                    {idea.title}
                                                </Link>
                                            </CardTitle>
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                By {idea.author.name}
                                                {idea.category ? ` • ${idea.category.name}` : ''}
                                            </p>
                                        </div>
                                        <Badge variant={statusVariants[idea.status] ?? 'outline'}>
                                            {idea.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Submitted {new Date(idea.created_at).toLocaleDateString()}
                                        </span>
                                        {idea.assigned_officer && (
                                            <span className="text-muted-foreground">
                                                Officer: {idea.assigned_officer.name}
                                            </span>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={ideas.show(idea.slug)}>Review</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {currentData.meta.last_page > 1 && (
                            <div className="flex justify-center gap-2 text-sm">
                                {currentData.meta.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => switchTab(currentTab)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                <span className="flex items-center text-muted-foreground">
                                    Page {currentData.meta.current_page} of {currentData.meta.last_page}
                                </span>
                                {currentData.meta.current_page < currentData.meta.last_page && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => switchTab(currentTab)}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-12">
                            <p className="text-lg font-medium">No ideas in this section</p>
                            <p className="text-sm text-muted-foreground">
                                Ideas will appear here when they reach this stage of the review pipeline.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
