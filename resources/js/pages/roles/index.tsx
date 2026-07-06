import { Head, Link, router, usePage } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import routes from '@/routes/roles';
import type { Auth } from '@/types/auth';

type Role = {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions_count: number;
    is_protected: boolean;
};

export default function RoleIndex({ roles }: { roles: Role[] }) {
    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const permissions = user?.permissions ?? [];
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        if (!deletingRole) {
return;
}

        setDeleting(true);
        setDeleteError('');

        router.delete(`/roles/${deletingRole.id}`, {
            data: { password: deletePassword },
            preserveState: true,
            onSuccess: () => {
                setDeletingRole(null);
                setDeletePassword('');
            },
            onError: (errors) => {
                setDeleteError(errors.password || errors.error || 'Failed to delete role.');
                passwordInput.current?.focus();
                setDeleting(false);
            },
        });
    };

    return (
        <>
            <Head title="Role Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Role Management"
                        description="Create, edit, and delete roles with granular permission assignments"
                    />
                    {permissions.includes('role.create') && (
                        <Button asChild>
                            <Link href={routes.create()}>Create Role</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Role</th>
                                        <th className="pb-3 pr-4 font-medium">Users</th>
                                        <th className="pb-3 pr-4 font-medium">Permissions</th>
                                        <th className="pb-3 pr-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.is_protected && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Protected
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">{role.users_count}</td>
                                            <td className="py-3 pr-4">{role.permissions_count}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex gap-2">
                                                    {permissions.includes('role.edit') && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={routes.edit({ role: role.id })}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {permissions.includes('role.delete') && !role.is_protected && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeletingRole(role)}
                                                        >
                                                            Delete
                                                        </Button>
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

            <Dialog open={deletingRole !== null} onOpenChange={(open) => {
                if (!open) {
                    setDeletingRole(null);
                    setDeletePassword('');
                    setDeleteError('');
                    setDeleting(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role "{deletingRole?.name}"?
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
                                setDeletingRole(null);
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
                            {deleting ? 'Deleting...' : 'Delete Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RoleIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Role Management', href: '/roles' },
    ],
};
