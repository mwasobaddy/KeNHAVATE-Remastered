import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FilterModal from '@/components/filter-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SearchInput from '@/components/search-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/users';
import type { Auth } from '@/types/auth';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_staff: boolean;
    avatar_url: string | null;
    created_at: string;
};

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

type Props = {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string | null;
    filters: Record<string, string>;
};

export default function UserIndex({ users, filters: initialFilters, search: initialSearch }: Props) {
    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const permissions = user?.permissions ?? [];
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [searchValue, setSearchValue] = useState(initialSearch ?? '');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(initialFilters);
    const [activeTips, setActiveTips] = useState<Record<string, boolean>>({});
    const [tipBack, setTipBack] = useState(false);
    const [tipNew, setTipNew] = useState(false);

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const navigateWithFilters = (searchVal: string, filterOverrides?: Record<string, string>) => {
        const params = new URLSearchParams();
        const filters = filterOverrides ?? activeFilters;

        if (searchVal) {
            params.set('search', searchVal);
        }

        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                params.set(key, value);
            }
        }

        const qs = params.toString();

        router.get(window.location.pathname + (qs ? `?${qs}` : ''), {}, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => navigateWithFilters(value), 300);
    };

    const updateFilter = (key: string, value: string) => {
        const next = { ...activeFilters };

        if (value) {
            next[key] = value;
        } else {
            delete next[key];
        }

        setActiveFilters(next);
        navigateWithFilters(searchValue, next);
    };

    const clearFilters = () => {
        const cleared: Record<string, string> = {};
        setActiveFilters(cleared);
        navigateWithFilters(searchValue, cleared);
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    const hasSearch = searchValue.length > 0;
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) {
            return;
        }

        if (!deletePassword) {
            setDeleteError('Password is required.');
            return;
        }
        setDeleteError('');

        setDeleting(true);

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

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Tooltip open={tipBack} onOpenChange={setTipBack}>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="warning" onClick={() => {
 setTipBack(true); goBack(); 
}}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Back</TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>

                    {permissions.includes('user.create') && (
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipNew} onOpenChange={setTipNew}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={routes.create()} onClick={() => setTipNew(true)}>
                                            <Plus className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>New User</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">New User</span>
                        </div>
                    )}
                </div>

                <Heading
                    title="User Management"
                    description="Create, edit, and delete users with role assignments"
                />

                <div className="flex items-center gap-2">
                    <SearchInput
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, or role..."
                    />
                    <FilterModal
                        statuses={[]}
                        categories={[]}
                        filters={activeFilters}
                        onFilterChange={updateFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
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
                                    {users.data.length > 0 ? (
                                        users.data.map((u) => (
                                            <tr key={u.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-8">
                                                            {u.avatar_url ? (
                                                                <AvatarImage src={u.avatar_url} alt={u.name} />
                                                            ) : null}
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                                {initials(u.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
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
                                                    <div className="flex items-start gap-2">
                                                        {permissions.includes('user.edit') && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${u.id}-edit`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${u.id}-edit`]: o }))}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="success" size="icon" asChild>
                                                                            <Link href={routes.edit({ user: u.id })} onClick={() => setActiveTips((p) => ({ ...p, [`${u.id}-edit`]: true }))}>
                                                                                <SquarePen className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Edit</TooltipContent>
                                                                </Tooltip>
                                                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Edit</span>
                                                            </div>
                                                        )}
                                                        {permissions.includes('user.delete') && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Tooltip open={activeTips[`${u.id}-delete`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${u.id}-delete`]: o }))}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                             variant="destructive"
                                                                             size="icon"
                                                                             onClick={() => {
                                                                                 setActiveTips((p) => ({ ...p, [`${u.id}-delete`]: true }));
                                                                                 setDeletingUser(u);
                                                                             }}
                                                                         >
                                                                             <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete</TooltipContent>
                                                                </Tooltip>
                                                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Delete</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                {hasSearch || hasActiveFilters ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 text-muted-foreground/50" />
                                                        <p>No users match your search.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p>No users found.</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {hasSearch || hasActiveFilters
                                        ? `Showing ${users.data.length} entries`
                                        : `Showing ${users.from} to ${users.to} of ${users.total} entries`
                                    }
                                </p>
                                {!hasSearch && !hasActiveFilters && (
                                    <div className="flex gap-2">
                                        {users.links.map((link, i) => {
                                            if (!link.url || link.label === '...') {
                                                return (
                                                    <span key={i} className="px-2 py-1 text-sm text-muted-foreground">
                                                        {link.label}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                                    <Link href={link.url} preserveState preserveScroll>
                                                        {link.label}
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
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
