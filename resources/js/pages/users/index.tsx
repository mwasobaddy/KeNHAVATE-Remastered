import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2, User as UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/users';
import type { Auth } from '@/types/auth';

export default function UserIndex({ users }: { users: { id: number; name: string; email: string; role: string; is_staff: boolean; created_at: string }[] }) {
    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const permissions = user?.permissions ?? [];
    const [deletingUser, setDeletingUser] = useState<typeof users[0] | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        if (!deletingUser) {
return;
}

        setDeleting(true);
        setDeleteError('');

        router.delete(`/users/${deletingUser.id}`, {
            data: { password: deletePassword },
            preserveState: true,
            onSuccess: () => {
                setDeletingUser(null);
                setDeletePassword('');
            },
            onError: (errors) => {
                setDeleteError(errors.password || errors.error || 'Failed to delete user.');
                passwordInput.current?.focus();
                setDeleting(false);
            },
        });
    };

    return (
        <>
            <Head title="User Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="User Management"
                        description="Create, edit, and delete users with role assignments"
                    />
                    {permissions.includes('user.create') && (
                        <Button asChild>
                            <Link href={routes.create()}>Create User</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">User</th>
                                        <th className="pb-3 pr-4 font-medium">Role</th>
                                        <th className="pb-3 pr-4 font-medium">Staff</th>
                                        <th className="pb-3 pr-4 font-medium">Created</th>
                                        <th className="pb-3 pr-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{u.name}</div>
                                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="outline">{u.role}</Badge>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {u.is_staff ? <Badge>Staff</Badge> : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">{u.created_at}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-0.5">
                                                    {permissions.includes('user.edit') && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="border-green-500/30" asChild>
                                                                     <Link href={routes.edit({ user: u.id })}>
                                                                         <Pencil className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {permissions.includes('user.delete') && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                     variant="outline"
                                                                     size="icon"
                                                                     className="border-red-500/30"
                                                                     onClick={() => setDeletingUser(u)}
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

            <Dialog open={deletingUser !== null} onOpenChange={(open) => {
                if (!open) {
                    setDeletingUser(null);
                    setDeletePassword('');
                    setDeleteError('');
                    setDeleting(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the user "{deletingUser?.name}"?
                            Please enter your password to confirm.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="delete-password" className="sr-only">Password</Label>
                            <Input
                                id="delete-password"
                                ref={passwordInput}
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                autoFocus
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !deleting) {
                                        handleDelete();
                                    }
                                }}
                            />
                            <InputError message={deleteError} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDeletingUser(null);
                                setDeletePassword('');
                                setDeleteError('');
                                setDeleting(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            type="button"
                            disabled={deleting || !deletePassword}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'User Management', href: '/users' },
    ],
};
