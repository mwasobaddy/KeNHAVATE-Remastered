import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leaderboard } from '@/routes';

type User = {
    id: number;
    name: string;
    points_balance: number;
};

type Props = {
    users: User[];
    currentUserRank: number | null;
    currentUserPoints: number;
};

export default function Leaderboard({ users, currentUserRank, currentUserPoints }: Props) {
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

            <div className="space-y-6">
                <Heading
                    title="Leaderboard"
                    description="Top users ranked by points"
                />

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Rankings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 pr-4 font-medium w-12">#</th>
                                            <th className="pb-3 pr-4 font-medium">User</th>
                                            <th className="pb-3 pr-4 font-medium text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4">
                                                    <span className="font-bold text-muted-foreground">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">
                                                            {user.name}
                                                        </span>
                                                        {currentUserRank === index + 1 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                You
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold">
                                                    {user.points_balance.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No users with points yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-3xl font-bold">
                                    {currentUserPoints.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Points
                                </div>
                            </div>
                            {currentUserRank && (
                                <div>
                                    <div className="text-3xl font-bold">
                                        #{currentUserRank}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Your Rank
                                    </div>
                                </div>
                            )}
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
