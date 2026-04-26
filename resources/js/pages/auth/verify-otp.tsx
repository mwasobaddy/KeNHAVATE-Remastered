import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { resend as otpResend } from '@/routes/otp';
import { submit as otpVerifySubmit } from '@/routes/otp/verify';

type Props = {
    email: string;
    status?: string;
};

export default function VerifyOtp({ email, status }: Props) {
    const [resendCooldown, setResendCooldown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Countdown timer for resend
    useEffect(() => {
        if (!canResend && resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (resendCooldown === 0 && !canResend) {
            setCanResend(true);
        }
    }, [resendCooldown, canResend]);

    // Reset countdown when a new OTP is sent
    const handleResend = () => {
        if (!canResend || isResending) return;

        setIsResending(true);
        resendPost(otpResend.post().url, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setCanResend(false);
                setResendCooldown(60);
                setOtpValue('');
                setErrorMessage(null);
                setIsResending(false);
            },
            onError: () => {
                setIsResending(false);
            },
            onFinish: () => {
                setIsResending(false);
            },
        });
    };

    const submitOtp = () => {
        if (!otpValue || otpValue.length !== 6) return;

        setIsProcessing(true);
        setErrorMessage(null);

        router.post(otpVerifySubmit.post().url, { otp: otpValue }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
            },
            onError: (errors) => {
                setOtpValue('');
                if (errors.otp) {
                    setErrorMessage(errors.otp);
                }
                setIsProcessing(false);
            },
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    };

    const handleOtpChange = (value: string) => {
        setOtpValue(value);
        setErrorMessage(null);

        if (value.length === 6) {
            submitOtp();
        }
    };

    const { post: resendPost } = useForm({});

    return (
        <AuthSplitLayout
            title="Check Your Email"
            description="Enter the verification code sent to your email"
        >
            <Head title="Verify Code" />

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-[#231F20]">
                        Check Your Email
                    </CardTitle>
                    <CardDescription>
                        We sent a verification code to <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitOtp();
                        }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <InputOTP
                                maxLength={6}
                                value={otpValue}
                                onChange={handleOtpChange}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>

                            {errorMessage ? (
                                <div className="mt-2 w-full">
                                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                                        <svg
                                            className="h-4 w-4 shrink-0"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM7.25 5a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0V5zm.75 6.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{errorMessage}</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#231F20] hover:bg-[#231F20]/90"
                            disabled={isProcessing || otpValue.length !== 6}
                            variant={errorMessage ? 'destructive' : 'default'}
                        >
                            {isProcessing ? 'Verifying...' : 'Verify Code'}
                        </Button>

                        <div className="text-center text-sm text-[#9B9EA4]">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendProcessing || isResending}
                                    className="text-[#231F20] hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {resendProcessing || isResending
                                        ? 'Sending...'
                                        : 'Resend code'}
                                </button>
                            ) : (
                                <span>
                                    Resend code in{' '}
                                    <span className="font-medium text-[#231F20]">
                                        {resendCooldown}s
                                    </span>
                                </span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}

VerifyOtp.layout = {
    title: 'Verify your email',
    description: 'Enter the verification code sent to your email',
};
