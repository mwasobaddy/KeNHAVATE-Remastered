import { Head, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Award, ChevronDown, ChevronUp, Crown, Hash, Search, Star, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
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

    const [search, setSearch] = useState('');

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
                    <Button size="icon" variant="info" onClick={goBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                </div>

                <Heading
                    title="Leaderboard"
                    description="Top users ranked by points"
                />

                {/* Stat cards (collapsible) */}
                <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                        <button className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                            <Activity className="h-4 w-4" />
                            Overview
                            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                                {systemStats.total_points_awarded.toLocaleString()} points &middot; {systemStats.users_with_points} users
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:hidden" />
                            <ChevronUp className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]/collapsible:hidden" />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="mt-3 grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Total Points Awarded</CardTitle>
                                    <div className="rounded-full bg-amber-500/10 p-2">
                                        <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold lg:text-2xl">{systemStats.total_points_awarded.toLocaleString()}</div>
                                    <p className="hidden text-xs text-muted-foreground lg:block">Across all users</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <div className="rounded-full bg-sky-500/10 p-2">
                                        <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold lg:text-2xl">{systemStats.users_with_points}</div>
                                    <p className="hidden text-xs text-muted-foreground lg:block">Users with points</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
                                    <div className="rounded-full bg-violet-500/10 p-2">
                                        <Trophy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold lg:text-2xl">
                                        {currentUserRank !== null ? `#${currentUserRank}` : '--'}
                                    </div>
                                    <p className="hidden text-xs text-muted-foreground lg:block">
                                        {currentUserRank !== null ? `of ${systemStats.users_with_points} users` : 'Not ranked'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Your Points</CardTitle>
                                    <div className="rounded-full bg-emerald-500/10 p-2">
                                        <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold lg:text-2xl">{currentUserPoints.toLocaleString()}</div>
                                    <p className="hidden text-xs text-muted-foreground lg:block">Lifetime balance</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Rankings table */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle>Rankings</CardTitle>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-8 w-full pl-9 text-sm sm:w-48"
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
