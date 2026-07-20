import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideas from '@/routes/ideas';

type User = { id: number; name: string };

type CollaborationRequest = {
    id: number;
    status: string;
    message: string;
    user: User;
    idea: { slug: string; title: string };
};

type Props = {
    request: CollaborationRequest;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function RespondToCollaborationDialog({ request, open, onOpenChange }: Props) {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    if (!request) {
        return null;
    }

    const reset = () => {
        setAction(null);
        onOpenChange(false);
    };

    const handleSuccess = () => {
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Respond to {request.user.name}</DialogTitle>
                </DialogHeader>

                <div className="mb-2 rounded-md bg-muted p-3 text-sm">
                    <p className="mb-1 font-medium text-foreground">{request.idea.title}</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{request.message}</p>
                </div>

                {!action ? (
                    <div className="flex gap-3">
                        <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => setAction('approve')}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setAction('reject')}
                        >
                            Reject
                        </Button>
                    </div>
                ) : action === 'approve' ? (
                    <Form
                        method="post"
                        action={ideas.collaborations.approve([request.idea.slug, request.id])}
                        onSuccess={handleSuccess}
                        className="space-y-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor={`approve-feedback-${request.id}`}>
                                        Feedback (optional)
                                    </Label>
                                    <Textarea
                                        id={`approve-feedback-${request.id}`}
                                        name="feedback"
                                        rows={2}
                                        placeholder="Optional note for the requester..."
                                    />
                                    <InputError message={errors.feedback} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Approving...' : 'Approve'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <Form
                        method="post"
                        action={ideas.collaborations.reject([request.idea.slug, request.id])}
                        onSuccess={handleSuccess}
                        className="space-y-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor={`reject-feedback-${request.id}`}>
                                        Feedback (required)
                                    </Label>
                                    <Textarea
                                        id={`reject-feedback-${request.id}`}
                                        name="feedback"
                                        rows={2}
                                        required
                                        placeholder="Explain why the request is being rejected..."
                                    />
                                    <InputError message={errors.feedback} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                        Back
                                    </Button>
                                    <Button type="submit" variant="destructive" disabled={processing}>
                                        {processing ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
