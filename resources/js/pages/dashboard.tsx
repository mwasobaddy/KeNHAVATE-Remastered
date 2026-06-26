import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import points from '@/routes/points';
import { leaderboard } from '@/routes';

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

type Props = {
    pointsBalance: number;
    recentTransactions: Transaction[];
    systemStats?: SystemStats;
    canManage?: boolean;
};

export default function Dashboard({
    pointsBalance,
    recentTransactions,
    systemStats,
    canManage,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Dashboard"
                    description="Welcome to the KeNHA Innovation Portal"
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Your Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {pointsBalance.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total points earned
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Awarded
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {systemStats
                                    ? systemStats.total_points_awarded.toLocaleString()
                                    : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Points across all users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {systemStats ? systemStats.active_actions : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Point-awarding actions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Users with Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {systemStats ? systemStats.users_with_points : '—'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active participants
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
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
                                                        <Badge variant="default">+{tx.points}</Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="py-4 text-center text-muted-foreground"
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

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    See how you rank against other participants.
                                </p>
                                <Button asChild>
                                    <Link href={leaderboard()}>View Leaderboard</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {canManage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={points.index()}>
                                            Manage Point Actions
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={points.transactions()}>
                                            View Transaction Log
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
