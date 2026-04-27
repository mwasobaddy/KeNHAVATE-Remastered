import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({
    email,
    status,
}: {
    email: string;
    status?: string;
}) {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCooldown(60);
        }
    }, [status]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);

            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    return (
        <AuthSplitLayout
            title="Verify Email"
            description="Please verify your email address to continue"
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <p className="mx-auto mb-6 max-w-md text-sm text-green-600">
                    A new verification link has been sent to <strong>{email}</strong>. Please
                    check your inbox and click the link.
                </p>
            )}

            {status !== 'verification-link-sent' && (
                <p className="mx-auto mb-6 max-w-md text-sm text-green-600">
                    We sent a verification link to <strong>{email}</strong>. Please
                    check your inbox and click the link.
                </p>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing || cooldown > 0}
                            variant="secondary"
                            className="bg-[#231F20] text-white hover:bg-[#231F20]/90"
                            type="submit"
                        >
                            {processing && <Spinner />}
                            {cooldown > 0
                                ? `Resend in ${cooldown}s`
                                : 'Resend verification email'}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm text-red-600 hover:text-red-800"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
