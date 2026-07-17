import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ideas from '@/routes/ideas';
import type { Auth } from '@/types/auth';

type User = { id: number; name: string };

type ChangeRequest = {
    id: number;
    status: string;
    proposed_data: { field: string; old_value: string; new_value: string }[];
    notes: string | null;
    feedback: string | null;
    created_at: string;
    proposer: User;
    reviewer: User | null;
    user_id: number;
    hidden_by_user: boolean;
};

type Props = {
    idea: { slug: string; title: string; author: User };
    changeRequests: { data: ChangeRequest[] };
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
};

export default function ChangeRequestIndex({ idea, changeRequests }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.show(idea.slug));
        }
    };

    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const [deletingCr, setDeletingCr] = useState<ChangeRequest | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        if (!deletingCr) {
            return;
        }

        setDeleting(true);
        setDeleteError('');

        router.delete(ideas.changes.destroy([idea.slug, deletingCr.id]), {
            data: { password: deletePassword },
            preserveState: true,
            onSuccess: () => {
                setDeletingCr(null);
                setDeletePassword('');
            },
            onError: (errors) => {
                setDeleteError(errors.password || errors.error || 'Failed to delete change request.');
                passwordInput.current?.focus();
                setDeleting(false);
            },
        });
    };

    const handleHide = (cr: ChangeRequest) => {
        router.post(
            ideas.changes.hide([idea.slug, cr.id]),
            {},
            { preserveState: true },
        );
    };

    const handleUnhide = (cr: ChangeRequest) => {
        router.post(
            ideas.changes.unhide([idea.slug, cr.id]),
            {},
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title={`Changes - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Change Requests"
                        description={`For: ${idea.title}`}
                    />
                    <Button asChild>
                        <Link href={ideas.changes.create(idea.slug)}>
                            Propose Changes
                        </Link>
                    </Button>
                </div>

                {changeRequests.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No change requests yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {[...changeRequests.data].sort((a, b) => Number(a.hidden_by_user) - Number(b.hidden_by_user)).map((cr) => (
                            <Card key={cr.id} className={cr.hidden_by_user ? 'opacity-40' : ''}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">
                                            {cr.proposer.name} &mdash; {(cr.proposed_data ?? []).length} field{(cr.proposed_data ?? []).length !== 1 ? 's' : ''} changed
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusVariant[cr.status] ?? 'outline'}>
                                                {cr.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {cr.notes && (
                                        <p className="mb-2 text-sm text-muted-foreground">{cr.notes}</p>
                                    )}
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {(cr.proposed_data ?? []).map((c, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {c.field}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{cr.created_at}</span>
                                        {cr.reviewer && (
                                            <span>Reviewed by {cr.reviewer.name}</span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={ideas.changes.show([idea.slug, cr.id])}>
                                                Review
                                            </Link>
                                        </Button>
                                        {cr.status === 'pending' && cr.user_id === user?.id && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeletingCr(cr)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                        {cr.status !== 'pending' && cr.hidden_by_user && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnhide(cr)}
                                            >
                                                <EyeOff className="mr-1 h-4 w-4" />
                                                Unhide
                                            </Button>
                                        )}
                                        {cr.status !== 'pending' && !cr.hidden_by_user && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleHide(cr)}
                                            >
                                                <Eye className="mr-1 h-4 w-4" />
                                                Hide
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex flex-col items-center gap-1 self-start">
                    <Button size="icon" variant="info" onClick={goBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                </div>
            </div>

            <Dialog open={deletingCr !== null} onOpenChange={(open) => {
                if (!open) {
                    setDeletingCr(null);
                    setDeletePassword('');
                    setDeleteError('');
                    setDeleting(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Change Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this change request? Enter your password to confirm.
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
                                setDeletingCr(null);
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
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
