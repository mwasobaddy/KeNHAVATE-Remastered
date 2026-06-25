import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TwoFactorSetupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string;
    manualSetupKey: string;
    clearSetupData: () => void;
    fetchSetupData: () => void;
    errors: Record<string, string>;
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    errors,
}: TwoFactorSetupModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {twoFactorEnabled
                            ? 'Two-factor authentication enabled'
                            : 'Set up two-factor authentication'}
                    </DialogTitle>
                    <DialogDescription>
                        Scan the QR code below with your authenticator app.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4">
                    {qrCodeSvg && (
                        <div
                            className="size-48"
                            dangerouslySetInnerHTML={{
                                __html: qrCodeSvg,
                            }}
                        />
                    )}

                    {manualSetupKey && (
                        <div className="w-full space-y-2">
                            <Label>Setup key</Label>
                            <p className="break-all rounded-md bg-muted p-2 text-sm font-mono">
                                {manualSetupKey}
                            </p>
                        </div>
                    )}

                    {requiresConfirmation && !twoFactorEnabled && (
                        <Form
                            method="post"
                            action="/user/confirmed-two-factor-authentication"
                            onSuccess={() => {
                                clearSetupData();
                                onClose();
                            }}
                            className="w-full space-y-4"
                        >
                            {({ processing, errors: confirmErrors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="2fa-code">
                                            Authentication code
                                        </Label>
                                        <Input
                                            id="2fa-code"
                                            name="code"
                                            placeholder="Enter the 6-digit code"
                                            required
                                            autoFocus
                                        />
                                        <InputError
                                            message={confirmErrors.code}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </div>

                {errors.code && (
                    <p className="text-sm text-red-600">{errors.code}</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
