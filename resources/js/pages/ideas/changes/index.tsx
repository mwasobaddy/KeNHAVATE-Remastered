import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, FileEdit, Plus, Trash2 } from 'lucide-react';
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
    canProposeChanges: boolean;
};

const statusStyles: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

function ChangeRequestCard({
    cr,
    ideaSlug,
    onDelete,
    onHide,
    onUnhide,
}: {
    cr: ChangeRequest;
    ideaSlug: string;
    onDelete: (cr: ChangeRequest) => void;
    onHide: (cr: ChangeRequest) => void;
    onUnhide: (cr: ChangeRequest) => void;
}) {
    const user = (usePage().props as { auth?: Auth }).auth?.user;
    const [tipReview, setTipReview] = useState(false);
    const [tipDelete, setTipDelete] = useState(false);
    const [tipHide, setTipHide] = useState(false);

    return (
        <Card className={cr.hidden_by_user ? 'opacity-40' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <CardTitle className="truncate text-base">
                            {cr.proposer.name} &mdash; {(cr.proposed_data ?? []).length} field{(cr.proposed_data ?? []).length !== 1 ? 's' : ''} changed
                        </CardTitle>
                        <Badge variant="outline" className={(statusStyles[cr.status] ?? '') + ' shrink-0'}>
                            {cr.status}
                        </Badge>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                        <div className="flex flex-col items-center gap-1">
                            <Tooltip open={tipReview} onOpenChange={setTipReview}>
                                <TooltipTrigger asChild>
                                    <Button size="icon" asChild>
                                        <Link href={ideas.changes.show([ideaSlug, cr.id])} onClick={() => setTipReview(true)}>
                                            <FileEdit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Review</TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Review</span>
                        </div>
                        {cr.status === 'pending' && cr.user_id === user?.id && (
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip open={tipDelete} onOpenChange={setTipDelete}>
                                    <TooltipTrigger asChild>
                                        <Button variant="destructive" size="icon" onClick={() => {
 setTipDelete(true); onDelete(cr); 
}}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                                <span className="text-[10px] leading-tight text-muted-foreground text-center">Delete</span>
                            </div>
                        )}
                        {cr.status !== 'pending' && (
                            <div className="flex flex-col items-center gap-1">
                                {cr.hidden_by_user ? (
                                    <Tooltip open={tipHide} onOpenChange={setTipHide}>
                                        <TooltipTrigger asChild>
                                            <Button variant="info" size="icon" onClick={() => {
 setTipHide(true); onUnhide(cr); 
}}>
                                                <EyeOff className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Unhide</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Tooltip open={tipHide} onOpenChange={setTipHide}>
                                        <TooltipTrigger asChild>
                                            <Button variant="info" size="icon" onClick={() => {
 setTipHide(true); onHide(cr); 
}}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Hide</TooltipContent>
                                    </Tooltip>
                                )}
                                <span className="text-[10px] leading-tight text-muted-foreground text-center">
                                    {cr.hidden_by_user ? 'Unhide' : 'Hide'}
                                </span>
                            </div>
                        )}
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
            </CardContent>
        </Card>
    );
}

export default function ChangeRequestIndex({ idea, changeRequests, canProposeChanges }: Props) {
    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.show(idea.slug));
        }
    };

    const [deletingCr, setDeletingCr] = useState<ChangeRequest | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const handleDelete = async () => {
        if (!deletingCr) {
            return;
        }

        if (!deletePassword) {
            setDeleteError('Password is required.');
            return;
        }
        setDeleteError('');

        setDeleting(true);

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

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start gap-4 justify-between">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                    {canProposeChanges && (
                        <div className="flex flex-col items-center gap-1">
                            <Button size="icon" asChild>
                                <Link href={ideas.changes.create(idea.slug)}>
                                    <Plus className="h-5 w-5" />
                                </Link>
                            </Button>
                            <span className="text-[10px] leading-tight text-muted-foreground text-center">Propose Changes</span>
                        </div>
                    )}
                </div>

                <div className="flex items-start justify-between">
                    <Heading
                        title="Change Requests"
                        description={`For: ${idea.title}`}
                    />
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
                            <ChangeRequestCard
                                key={cr.id}
                                cr={cr}
                                ideaSlug={idea.slug}
                                onDelete={setDeletingCr}
                                onHide={handleHide}
                                onUnhide={handleUnhide}
                            />
                        ))}
                    </div>
                )}

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

ChangeRequestIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Changes', href: '#' },
    ],
};
