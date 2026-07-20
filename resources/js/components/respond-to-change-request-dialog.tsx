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

type ChangeRequest = {
    id: number;
    status: string;
    proposer: User;
};

type Props = {
    changeRequest: ChangeRequest;
    ideaSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function RespondToChangeRequestDialog({ changeRequest, ideaSlug, open, onOpenChange }: Props) {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    if (!changeRequest) {
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
                    <DialogTitle>Respond to {changeRequest.proposer.name}</DialogTitle>
                </DialogHeader>

                {!action ? (
                    <div className="flex gap-3">
                        <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => setAction('approve')}
                        >
                            Approve Changes
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setAction('reject')}
                        >
                            Reject Changes
                        </Button>
                    </div>
                ) : action === 'approve' ? (
                    <Form
                        method="post"
                        action={ideas.changes.approve([ideaSlug, changeRequest.id])}
                        onSuccess={handleSuccess}
                        className="space-y-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor={`approve-feedback-${changeRequest.id}`}>
                                        Feedback (optional)
                                    </Label>
                                    <Textarea
                                        id={`approve-feedback-${changeRequest.id}`}
                                        name="feedback"
                                        rows={2}
                                        placeholder="Optional note for the proposer..."
                                    />
                                    <InputError message={errors.feedback} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Approving...' : 'Approve Changes'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <Form
                        method="post"
                        action={ideas.changes.reject([ideaSlug, changeRequest.id])}
                        onSuccess={handleSuccess}
                        className="space-y-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor={`reject-feedback-${changeRequest.id}`}>
                                        Feedback (required)
                                    </Label>
                                    <Textarea
                                        id={`reject-feedback-${changeRequest.id}`}
                                        name="feedback"
                                        rows={2}
                                        required
                                        placeholder="Explain why the changes are not accepted..."
                                    />
                                    <InputError message={errors.feedback} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                        Back
                                    </Button>
                                    <Button type="submit" variant="destructive" disabled={processing}>
                                        {processing ? 'Rejecting...' : 'Reject Changes'}
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
