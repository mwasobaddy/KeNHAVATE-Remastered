import { Head, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Award, Crown, Hash, Star, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import SearchInput from '@/components/search-input';
import StatsCards from '@/components/stats-cards';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { leaderboard } from '@/routes';

type User = {
    id: number;
    name: string;
    points_balance: number;
};

type SystemStats = {
    total_points_awarded: number;
    total_transactions: number;
    users_with_points: number;
    active_actions: number;
};

type Props = {
    users: User[];
    currentUserRank: number | null;
    currentUserPoints: number;
    systemStats: SystemStats;
};

export default function Leaderboard({ users, currentUserRank, currentUserPoints, systemStats }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');

    const updateSearch = (value: string) => {
        setSearch(value);
        const params = new URLSearchParams(window.location.search);

        if (value) {
params.set('search', value);
} else {
params.delete('search');
}

        const qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };

    const filteredUsers = useMemo(() => {
        if (!search.trim()) {
            return users;
        }

        const q = search.toLowerCase();

        return users.filter((user) => user.name.toLowerCase().includes(q));
    }, [users, search]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <Head title="Leaderboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col items-center gap-1 self-start">
                    <Button size="icon" variant="warning" onClick={goBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                </div>

                <Heading
                    title="Leaderboard"
                    description="Top users ranked by points"
                />

                <StatsCards
                    label="Overview"
                    summary={`${systemStats.total_points_awarded.toLocaleString()} points · ${systemStats.users_with_points} users`}
                    items={[
                        { title: 'Total Points Awarded', value: systemStats.total_points_awarded.toLocaleString(), description: 'Across all users', icon: <Award className="text-amber-600 dark:text-amber-400" /> },
                        { title: 'Active Users', value: systemStats.users_with_points, description: 'Users with points', icon: <Users className="text-sky-600 dark:text-sky-400" /> },
                        { title: 'Your Rank', value: currentUserRank !== null ? `#${currentUserRank}` : '--', description: currentUserRank !== null ? `of ${systemStats.users_with_points} users` : 'Not ranked', icon: <Trophy className="text-violet-600 dark:text-violet-400" /> },
                        { title: 'Your Points', value: currentUserPoints.toLocaleString(), description: 'Lifetime balance', icon: <Star className="text-emerald-600 dark:text-emerald-400" /> },
                    ]}
                />

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Rankings table */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle>Rankings</CardTitle>
                                <div className="sm:w-48">
                                    <SearchInput
                                        value={search}
                                        onChange={updateSearch}
                                        placeholder="Search by name..."
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="w-14 pb-3 pr-4 font-medium">#</th>
                                            <th className="pb-3 pr-4 font-medium">User</th>
                                            <th className="pb-3 pr-4 text-right font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-8 text-center text-muted-foreground">
                                                    {search
                                                        ? 'No users match your search.'
                                                        : 'No users with points yet.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => {
                                                const actualRank = users.indexOf(user) + 1;
                                                const isCurrentUser = currentUserRank === actualRank;

                                                return (
                                                    <tr
                                                        key={user.id}
                                                        className={`border-b last:border-0 transition-colors ${
                                                            isCurrentUser
                                                                ? 'bg-amber-50 dark:bg-amber-950/30'
                                                                : 'hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <td className="py-3 pr-4">
                                                            {actualRank <= 3 ? (
                                                                <span className="flex items-center justify-center">
                                                                    {actualRank === 1 && <Crown className="h-5 w-5 text-yellow-500" />}
                                                                    {actualRank === 2 && <Award className="h-5 w-5 text-gray-400" />}
                                                                    {actualRank === 3 && <Award className="h-5 w-5 text-amber-700 dark:text-amber-500" />}
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-muted-foreground">
                                                                    {actualRank}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className={
                                                                        actualRank === 1
                                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                                            : actualRank === 2
                                                                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                                                : actualRank === 3
                                                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                                                                    : ''
                                                                    }>
                                                                        {getInitials(user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium">{user.name}</span>
                                                                {isCurrentUser && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                                                            {user.points_balance.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Stats sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Activity className="h-4 w-4" />
                                    Total Transactions
                                </div>
                                <div className="mt-1 text-2xl font-bold">{systemStats.total_transactions.toLocaleString()}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Hash className="h-4 w-4" />
                                    Active Point Actions
                                </div>
                                <div className="mt-1 text-2xl font-bold">{systemStats.active_actions}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Award className="h-4 w-4" />
                                    Total Awarded
                                </div>
                                <div className="mt-1 text-2xl font-bold">{systemStats.total_points_awarded.toLocaleString()}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Leaderboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Leaderboard', href: leaderboard() },
    ],
};
