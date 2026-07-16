import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/points';

type Point = {
    id: number;
    name: string;
    description: string | null;
    points: number;
    is_active: boolean;
    created_by: { id: number; name: string } | null;
    deleted_at: string | null;
    created_at: string;
};

type Props = {
    points: {
        data: Point[];
        meta: any;
    };
};

export default function PointIndex({ points }: Props) {
    const handleDelete = (point: Point) => {
        if (confirm(`Are you sure you want to delete "${point.name}"?`)) {
            router.delete(routes.destroy({ point: point.id }));
        }
    };

    const handleToggle = (point: Point) => {
        router.patch(routes.toggle({ point: point.id }));
    };

    return (
        <>
            <Head title="Point Actions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Point Actions"
                        description="Manage actions that award points to users"
                    />
                    <Button asChild>
                        <Link href={routes.create()}>Create New</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Point Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Name</th>
                                        <th className="pb-3 pr-4 font-medium">Points</th>
                                        <th className="pb-3 pr-4 font-medium">Status</th>
                                        <th className="pb-3 pr-4 font-medium">Created By</th>
                                        <th className="pb-3 pr-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {points.data.map((point) => (
                                        <tr key={point.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">{point.name}</div>
                                                {point.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {point.description}
                                                    </div>
                                                )}
                                                {point.deleted_at && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        Deleted
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">{point.points}</td>
                                            <td className="py-3 pr-4">
                                                <Badge
                                                    variant={point.is_active ? 'default' : 'secondary'}
                                                >
                                                    {point.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {point.created_by?.name ?? '—'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-0.5">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="border-green-500/30" asChild>
                                                                 <Link href={routes.edit({ point: point.id })}>
                                                                     <Pencil className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className={point.is_active ? 'border-amber-500/30' : 'border-green-500/30'}
                                                                onClick={() => handleToggle(point)}
                                                            >
                                                                {point.is_active
                                                                    ? <PowerOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                    : <Power className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                }
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {point.is_active ? 'Deactivate' : 'Activate'}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {!point.deleted_at && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                            <Button
                                                                 variant="outline"
                                                                 size="icon"
                                                                 className="border-red-500/30"
                                                                 onClick={() => handleDelete(point)}
                                                             >
                                                                 <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
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

PointIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Point Actions', href: '/points' },
    ],
};
