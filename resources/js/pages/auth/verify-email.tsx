import { Form, Head } from '@inertiajs/react';
import { useReducer, useEffect } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

function cooldownReducer(state: number, action: { type: 'start' } | { type: 'tick' }): number {
    switch (action.type) {
        case 'start':
            return 60;
        case 'tick':
            return state - 1;
    }
}

export default function VerifyEmail({
    email,
    status,
}: {
    email: string;
    status?: string;
}) {
    const [cooldown, dispatch] = useReducer(cooldownReducer, 0);

    useEffect(() => {
        if (status === 'verification-link-sent') {
            dispatch({ type: 'start' });
        }
    }, [status]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => dispatch({ type: 'tick' }), 1000);

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
                    A new verification link has been sent to <strong>{email}</strong>.
                </p>
            )}

            <Form method="post" action="/email/verification-notification" className="space-y-6 text-center">
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
                            href="/logout"
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
