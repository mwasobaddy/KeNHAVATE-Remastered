import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const password = (fd.get('password') as string);
        if (!password) errs.password = 'Password is required.';

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Permanently delete your account"
            />

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Please enter your password to
                    confirm.
                </p>

                <Dialog
                    open={confirmingUserDeletion}
                    onOpenChange={(open) => {
                        setConfirmingUserDeletion(open);

                        if (!open) {
passwordInput.current?.focus();
}
                    }}
                >
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete account</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Are you sure you want to delete your account?
                            </DialogTitle>
                            <DialogDescription>
                                Once your account is deleted, all of its
                                resources and data will be permanently deleted.
                                Please enter your password to confirm you would
                                like to permanently delete your account.
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            method="delete"
                            action="/settings/profile"
                            ref={formRef}
                            onSuccess={() =>
                                setConfirmingUserDeletion(false)
                            }
                            onError={() => passwordInput.current?.focus()}
                            className="space-y-4"
                            onSubmit={(e) => {
                                setClientErrors({});
                                if (!validate(e.currentTarget)) e.preventDefault();
                            }}
                        >
                            {({ errors, processing }) => {
                                const allErrors = { ...clientErrors, ...errors };
                                return (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="delete-password"
                                            className="sr-only"
                                        >
                                            Password
                                        </Label>
                                        <PasswordInput
                                            id="delete-password"
                                            ref={passwordInput}
                                            name="password"
                                            placeholder="Password"
                                            autoFocus
                                        />
                                        <InputError
                                            message={allErrors.password}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setConfirmingUserDeletion(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Delete account
                                        </Button>
                                    </DialogFooter>
                                </>
                            );
                            }}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
