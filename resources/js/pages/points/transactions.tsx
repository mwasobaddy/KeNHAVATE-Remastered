import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import points from '@/routes/points';

type Transaction = {
    id: number;
    user: { id: number; name: string };
    point: { id: number; name: string } | null;
    points: number;
    created_at: string;
};

type Props = {
    transactions: {
        data: Transaction[];
        meta: any;
    };
};

export default function Transactions({ transactions }: Props) {
    return (
        <>
            <Head title="Point Transactions" />

            <div className="space-y-6">
                <Heading
                    title="Point Transactions"
                    description="View all point awards across the system"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">User</th>
                                        <th className="pb-3 pr-4 font-medium">Action</th>
                                        <th className="pb-3 pr-4 font-medium">Points</th>
                                        <th className="pb-3 pr-4 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4 font-medium">
                                                {tx.user.name}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {tx.point?.name ?? 'Deleted Action'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="default">
                                                    +{tx.points}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {new Date(tx.created_at).toLocaleDateString(
                                                    'en-KE',
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Point Transactions', href: points.transactions() },
    ],
};
