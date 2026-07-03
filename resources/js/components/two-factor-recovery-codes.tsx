import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type TwoFactorRecoveryCodesProps = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => void;
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
}: TwoFactorRecoveryCodesProps) {
    return (
        <div className="space-y-4">
            {recoveryCodesList.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">
                        Recovery codes
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Store these recovery codes in a secure password
                        manager. They can be used to recover access to your
                        account if your two-factor authentication device is
                        lost.
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                        {recoveryCodesList.map((code, i) => (
                            <code
                                key={i}
                                className="rounded bg-muted px-2 py-1 text-xs"
                            >
                                {code}
                            </code>
                        ))}
                    </div>
                </div>
            )}

            <Form
                method="post"
                action="/user/two-factor-recovery-codes"
                onSuccess={() => fetchRecoveryCodes()}
            >
                {({ processing }) => (
                    <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={processing}
                    >
                        Regenerate codes
                    </Button>
                )}
            </Form>
        </div>
    );
}
