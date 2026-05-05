'use client';

import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    BarChart3,
    PieChart,
    Calendar,
} from 'lucide-react';
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
}

interface ThematicArea {
    id: number;
    name: string;
}

interface DdReview {
    id: number;
    is_unlocked: boolean;
    review_deadline: string | null;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    status: string;
    user: User | null;
    thematic_area: ThematicArea | null;
    dd_review: DdReview | null;
}

interface DeadlineStats {
    overdue: number;
    dueSoon: number;
    onTrack: number;
}

interface ThematicDistribution {
    name: string;
    count: number;
}

interface Stats {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    inReview: number;
    draft: number;
    thematicDistribution: ThematicDistribution[];
    deadlineStats: DeadlineStats;
}

interface DdReviewDashboardProps {
    inReviewIdeas: Idea[];
    stats: Stats;
}

export default function DdReviewDashboard({
    inReviewIdeas,
    stats,
}: DdReviewDashboardProps) {
    const maxThematicCount = Math.max(
        ...stats.thematicDistribution.map((t) => t.count),
        1
    );

    const completionRate = stats.total > 0
        ? Math.round(((stats.approved + stats.rejected) / stats.total) * 100)
        : 0;

    const reviewProgress = stats.inReview > 0
        ? Math.round(((stats.approved + stats.rejected) / (stats.approved + stats.rejected + stats.inReview)) * 100)
        : 0;

    return (
        <>
            <Head title="DD Review Stats" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            DD Review Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Overview of Deputy Director review performance
                        </p>
                    </div>
                    <Link href={ideaRoutes.ddReview.index()}>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View All Reviews
                        </Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Ideas
                            </CardTitle>
                            <FileText className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.pending} pending review
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Approved
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {completionRate}% completion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Rejected
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% rejection rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                In Review
                            </CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">{stats.inReview}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.draft} drafts waiting
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress & Deadline Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Review Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Review Progress
                            </CardTitle>
                            <CardDescription>
                                Overall review completion status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Completion</span>
                                    <span className="font-medium">{reviewProgress}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                        style={{ width: `${reviewProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                                    <div className="text-xs text-muted-foreground">Approved</div>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                                    <div className="text-2xl font-bold text-orange-600">{stats.inReview}</div>
                                    <div className="text-xs text-muted-foreground">In Review</div>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                                    <div className="text-xs text-muted-foreground">Rejected</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deadline Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Deadline Status
                            </CardTitle>
                            <CardDescription>
                                Current review deadline overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-red-600">{stats.deadlineStats.overdue}</div>
                                    <div className="text-sm text-muted-foreground">Overdue</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                                <Clock className="h-8 w-8 text-orange-500" />
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-orange-600">{stats.deadlineStats.dueSoon}</div>
                                    <div className="text-sm text-muted-foreground">Due within 3 days</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-green-600">{stats.deadlineStats.onTrack}</div>
                                    <div className="text-sm text-muted-foreground">On track</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Thematic Area Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Ideas by Thematic Area
                        </CardTitle>
                        <CardDescription>
                            Distribution of ideas across thematic categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.thematicDistribution.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No thematic data available
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.thematicDistribution.map((thematic, index) => {
                                    const percentage = Math.round((thematic.count / maxThematicCount) * 100);
                                    const colors = [
                                        'bg-blue-500',
                                        'bg-purple-500',
                                        'bg-pink-500',
                                        'bg-indigo-500',
                                        'bg-teal-500',
                                        'bg-amber-500',
                                    ];
                                    const color = colors[index % colors.length];

                                    return (
                                        <div key={thematic.name} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{thematic.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {thematic.count} ({stats.total > 0 ? Math.round((thematic.count / stats.total) * 100) : 0}%)
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full ${color} transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats Summary */}
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-400">Review Efficiency</p>
                                <p className="text-3xl font-bold">{completionRate}%</p>
                                <p className="text-xs text-slate-400">
                                    {stats.approved + stats.rejected} of {stats.total} ideas processed
                                </p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-sm text-slate-400">Pending Action</p>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-slate-400">
                                    {stats.draft} drafts + {stats.inReview} in review
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Preview */}
                {inReviewIdeas.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent In-Review Ideas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {inReviewIdeas.slice(0, 5).map((idea) => (
                                    <div
                                        key={idea.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{idea.idea_title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {idea.thematic_area?.name || 'No thematic area'}
                                            </p>
                                        </div>
                                        <Link href={ideaRoutes.ddReview.show(idea.dd_review?.id || 0).url}>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

DdReviewDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: ideaRoutes.index(),
        },
        {
            title: 'DD Reviews',
            href: ideaRoutes.ddReview.index(),
        },
        {
            title: 'Analytics',
            href: '#',
        },
    ],
};