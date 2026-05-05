'use client';

import { Head, Link } from '@inertiajs/react';
import {
    Lock,
    FileText,
    ClipboardList,
    Users,
    CheckCircle,
    Lightbulb,
    BarChart3,
    TrendingUp,
    Clock,
    AlertTriangle,
    XCircle,
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

interface Counts {
    pendingUnlock: number;
    pendingSmeCompilation: number;
    pendingBoardCompilation: number;
    pendingSmeDecision: number;
    pendingBoardDecision: number;
    allActive: number;
}

interface Stats {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    inReview: number;
    draft: number;
    thematicDistribution: { name: string; count: number }[];
    deadlineStats: {
        overdue: number;
        dueSoon: number;
        onTrack: number;
    };
}

interface DdReviewIndexProps {
    counts: Counts;
    stats?: Stats;
}

interface CategoryCardProps {
    title: string;
    description: string;
    count: number;
    href: string;
    icon: React.ElementType;
    color: string;
}

function CategoryCard({ title, description, count, href, icon: Icon, color }: CategoryCardProps) {
    return (
        <Link href={href} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{title}</CardTitle>
                    <div className={`p-2 rounded-full ${color}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{count}</div>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function DdReviewIndex({ counts, stats }: DdReviewIndexProps) {
    const categories = [
        {
            title: 'Pending Unlock',
            description: 'Ideas submitted, awaiting DD to unlock',
            count: counts.pendingUnlock,
            href: ideaRoutes.ddReview.pendingUnlock().url,
            icon: Lock,
            color: 'bg-orange-500',
        },
        {
            title: 'Pending SME Compilation',
            description: 'Awaiting DD to compile SME comments',
            count: counts.pendingSmeCompilation,
            href: ideaRoutes.ddReview.pendingSmeCompilation().url,
            icon: ClipboardList,
            color: 'bg-yellow-500',
        },
        {
            title: 'Pending Board Compilation',
            description: 'Awaiting DD to compile Board comments',
            count: counts.pendingBoardCompilation,
            href: ideaRoutes.ddReview.pendingBoardCompilation().url,
            icon: ClipboardList,
            color: 'bg-amber-600',
        },
        {
            title: 'Pending SME Decision',
            description: 'Awaiting DD final decision',
            count: counts.pendingSmeDecision,
            href: ideaRoutes.ddReview.pendingSmeDecision().url,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Pending Board Decision',
            description: 'Awaiting Board scheduling/review',
            count: counts.pendingBoardDecision,
            href: ideaRoutes.ddReview.pendingBoardDecision().url,
            icon: CheckCircle,
            color: 'bg-indigo-500',
        },
        {
            title: 'All Active',
            description: 'All ideas in active workflow',
            count: counts.allActive,
            href: ideaRoutes.ddReview.active().url,
            icon: Lightbulb,
            color: 'bg-green-500',
        },
    ];

    const completionRate = stats && stats.total > 0
        ? Math.round(((stats.approved + stats.rejected) / stats.total) * 100)
        : 0;

    return (
        <>
            <Head title="DD Review Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">DD Review Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage ideas submitted for Deputy Director review
                        </p>
                    </div>
                    {stats && (
                        <Link href={ideaRoutes.ddReview.dashboard()}>
                            <Button variant="outline">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Full Analytics
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Category Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.title} {...category} />
                    ))}
                </div>

                {/* Quick Stats (only show if stats provided) */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.inReview}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.approved}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                                <XCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.rejected}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Deadline Status */}
                {stats && stats.deadlineStats && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Deadline Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{stats.deadlineStats.overdue}</div>
                                    <div className="text-sm text-red-600">Overdue</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.deadlineStats.dueSoon}</div>
                                    <div className="text-sm text-yellow-600">Due Soon (3 days)</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats.deadlineStats.onTrack}</div>
                                    <div className="text-sm text-green-600">On Track</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for Deputy Director</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Link href={ideaRoutes.ddReview.pendingUnlock().url}>
                                <Button variant="outline" size="sm">
                                    <Lock className="mr-2 h-4 w-4" />
                                    Unlock Ideas
                                </Button>
                            </Link>
                            <Link href={ideaRoutes.ddReview.pendingSmeCompilation().url}>
                                <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Compile SME
                                </Button>
                            </Link>
                            <Link href={ideaRoutes.ddReview.pendingBoardCompilation().url}>
                                <Button variant="outline" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Compile Board
                                </Button>
                            </Link>
                            <Link href={ideaRoutes.ddReview.active().url}>
                                <Button variant="outline" size="sm">
                                    <Lightbulb className="mr-2 h-4 w-4" />
                                    View Active
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}