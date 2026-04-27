import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { acceptTerms } from '@/routes/terms';

export default function Terms() {
    const submit = () => {
        router.post(acceptTerms());
    };

    return (
        <AuthSplitLayout
            title="Terms and Conditions"
            description="Please read and accept our terms and conditions to continue"
        >
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
                    <CardDescription>
                        Please read and accept our terms and conditions to access the system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-h-96 overflow-y-auto rounded-lg border border-border p-4 text-sm">
                        <h3 className="mb-2 text-lg font-semibold">1. Acceptance of Terms</h3>
                        <p className="mb-4 text-muted-foreground">
                            By accessing and using the KeNHAVATE system, you accept and agree to be bound by the terms
                            and provision of this agreement.
                        </p>

                        <h3 className="mb-2 text-lg font-semibold">2. Use License</h3>
                        <p className="mb-4 text-muted-foreground">
                            KeNHA grants you a non-exclusive, non-transferable, revocable license to access and
                            use the system in accordance with your role and permissions within the organization.
                        </p>

                        <h3 className="mb-2 text-lg font-semibold">3. User Obligations</h3>
                        <p className="mb-4 text-muted-foreground">
                            You agree to provide accurate information during registration and onboarding. You are responsible
                            for maintaining the confidentiality of your account credentials.
                        </p>

                        <h3 className="mb-2 text-lg font-semibold">4. Data Privacy</h3>
                        <p className="mb-4 text-muted-foreground">
                            We are committed to protecting your personal information in accordance with the Data Protection Act.
                            Your data will only be used for official Kenya National Highways Authority purposes.
                        </p>

                        <h3 className="mb-2 text-lg font-semibold">5. Intellectual Property</h3>
                        <p className="mb-4 text-muted-foreground">
                            All content, logos, and materials within the KeNHAVATE system are the property of KeNHA
                            and are protected by intellectual property laws.
                        </p>

                        <h3 className="mb-2 text-lg font-semibold">6. Termination</h3>
                        <p className="text-muted-foreground">
                            KeNHA reserves the right to terminate or suspend access to the system for violations of these terms
                            or for any other reason at its sole discretion.
                        </p>
                    </div>

                    <form onSubmit={submit} className="flex justify-center">
                        <Button type="submit" className="bg-[#231F20] hover:bg-[#231F20]/90">
                            I Accept Terms and Conditions
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}
