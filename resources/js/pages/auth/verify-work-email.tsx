import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { logout } from '@/routes';
import { resend as workEmailResend } from '@/routes/work-email/verify';

export default function VerifyWorkEmail({
    workEmail,
    status,
}: {
    workEmail: string;
    status?: string;
}) {
    const [coolown, setCooldown] = useState(0);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            setCooldown(60);
        }
    }, [status]);

    useEffect(() => {
        if (coolown > 0) {
            const timer = setTimeout(() => setCooldown(coolown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [coolown]);

    return (
        <AuthSplitLayout
            title="Verify Work Email"
            description="Please verify your work email address to continue"
        >
            <Head title="Verify work email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to your work email.
                </div>
            )}

            <p className="mx-auto mb-6 max-w-md text-sm text-green-600">
                We sent a verification link to <strong>{workEmail}</strong>.
                Please check your inbox and click the link.
            </p>

            <Form {...workEmailResend.form()} className="space-y-6 text-center">
                {({ processing }) => {
                    // Start cooldown when form starts processing (resend clicked)
                    useEffect(() => {
                        if (processing && coolown === 0) {
                            setCooldown(60);
                        }
                    }, [processing]);

                    return (
                        <>
                            <Button
                                disabled={processing || coolown > 0}
                                variant="secondary"
                                className="bg-[#231F20] text-white hover:bg-[#231F20]/90"
                                type="submit"
                            >
                                {processing && <Spinner />}
                                {coolown > 0
                                    ? `Resend in ${coolown}s`
                                    : 'Resend verification email'}
                            </Button>

                            <TextLink
                                href={logout()}
                                className="mx-auto block text-sm text-red-600 hover:text-red-800"
                            >
                                Log out
                            </TextLink>
                        </>
                    );
                }}
            </Form>
        </AuthSplitLayout>
    );
}

VerifyWorkEmail.layout = {
    title: 'Verify work email',
    description: '',
};
