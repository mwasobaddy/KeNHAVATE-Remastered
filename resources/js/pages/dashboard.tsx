import { Head, Link } from '@inertiajs/react';
import { Award, CheckCircle, ClipboardCheck, Clock, Lightbulb, List, Plus, Trophy, UserPlus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { leaderboard } from '@/routes';
import ideas from '@/routes/ideas';
import points from '@/routes/points';

type Transaction = {
    id: number;
    point: { id: number; name: string } | null;
    points: number;
    created_at: string;
};

type SystemStats = {
    total_points_awarded: number;
    total_transactions: number;
    users_with_points: number;
    active_actions: number;
};

type UserIdeaStats = {
    total: number;
    drafts: number;
    under_review: number;
    approved: number;
};

type PendingInvitation = {
    id: number;
    idea: { id: number; title: string; slug: string };
    invited_by: number;
    invitedBy: { id: number; name: string };
    created_at: string;
    role: string;
    status: string;
};

type Props = {
    pointsBalance: number;
    recentTransactions: Transaction[];
    userIdeaStats: UserIdeaStats;
    pendingInvitations: PendingInvitation[];
    systemStats?: SystemStats;
    canManage?: boolean;
};

export default function Dashboard({
    pointsBalance,
    recentTransactions,
    userIdeaStats,
    pendingInvitations,
    systemStats,
    canManage,
}: Props) {
    const [tipNewIdea, setTipNewIdea] = useState(false);
    const [tipBrowse, setTipBrowse] = useState(false);
    const [tipLeaderboard, setTipLeaderboard] = useState(false);
    const [tipManagePoints, setTipManagePoints] = useState(false);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Dashboard"
                        description="Welcome to the KeNHA Innovation Portal"
                    />
                    <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipNewIdea} onOpenChange={setTipNewIdea}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.create()} onClick={() => setTipNewIdea(true)}>
                                            <Plus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New Idea</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">New Idea</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipBrowse} onOpenChange={setTipBrowse}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.index()} onClick={() => setTipBrowse(true)}>
                                            <List className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Browse Ideas</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Browse Ideas</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipLeaderboard} onOpenChange={setTipLeaderboard}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={leaderboard()} onClick={() => setTipLeaderboard(true)}>
                                            <Trophy className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Leaderboard</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Leaderboard</span>
                        </div>
                        {canManage && (
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip open={tipManagePoints} onOpenChange={setTipManagePoints}>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" asChild>
                                            <Link href={points.index()} onClick={() => setTipManagePoints(true)}>
                                                <Award className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Manage Points</TooltipContent>
                                </Tooltip>
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Manage Points</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Your Points</CardTitle>
                            <div className="rounded-full bg-amber-500/10 p-2">
                                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{pointsBalance.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total points earned</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Your Ideas</CardTitle>
                            <div className="rounded-full bg-sky-500/10 p-2">
                                <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{userIdeaStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {userIdeaStats.drafts > 0
                                    ? `${userIdeaStats.drafts} in draft`
                                    : 'Ideas submitted'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                            <div className="rounded-full bg-violet-500/10 p-2">
                                <ClipboardCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{userIdeaStats.under_review}</div>
                            <p className="text-xs text-muted-foreground">Awaiting decision</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <div className="rounded-full bg-emerald-500/10 p-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{userIdeaStats.approved}</div>
                            <p className="text-xs text-muted-foreground">Ideas approved</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Action</th>
                                            <th className="pb-2 pr-4 font-medium text-right">Points</th>
                                            <th className="pb-2 font-medium text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((tx) => (
                                                <tr key={tx.id} className="border-b last:border-0">
                                                    <td className="py-2 pr-4 text-muted-foreground">
                                                        {tx.point?.name ?? 'Deleted Action'}
                                                    </td>
                                                    <td className="py-2 pr-4 text-right">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                        >
                                                            +{tx.points}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 text-right text-xs text-muted-foreground">
                                                        {formatDate(tx.created_at)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    Complete onboarding to earn your first points!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pending Invitations</CardTitle>
                            {pendingInvitations.length > 0 && (
                                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                    {pendingInvitations.length}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            {pendingInvitations.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingInvitations.map((invitation) => (
                                        <div
                                            key={invitation.id}
                                            className="flex items-start gap-3 rounded-lg border p-3"
                                        >
                                            <div className="rounded-full bg-amber-500/10 p-1.5">
                                                <UserPlus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    <Link
                                                        href={ideas.show(invitation.idea.slug)}
                                                        className="hover:underline"
                                                    >
                                                        {invitation.idea.title}
                                                    </Link>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Invited by {invitation.invited_by.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(invitation.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">
                                        No pending invitations
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        You'll see collaboration invites here
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {systemStats && (
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                            System Overview
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-dashed">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total Awarded</CardTitle>
                                    <div className="rounded-full bg-amber-500/10 p-2">
                                        <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {systemStats.total_points_awarded.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Points across all users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-dashed">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
                                    <div className="rounded-full bg-sky-500/10 p-2">
                                        <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.active_actions}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Point-awarding actions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-dashed">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
                                    <div className="rounded-full bg-emerald-500/10 p-2">
                                        <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {systemStats.users_with_points}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Users with points
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-dashed">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                    <div className="rounded-full bg-violet-500/10 p-2">
                                        <ClipboardCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {systemStats.total_transactions.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total transactions
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
return 'Today';
}

    if (diffDays === 1) {
return 'Yesterday';
}

    if (diffDays < 7) {
return `${diffDays} days ago`;
}

    if (diffDays < 30) {
return `${Math.floor(diffDays / 7)}w ago`;
}

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
