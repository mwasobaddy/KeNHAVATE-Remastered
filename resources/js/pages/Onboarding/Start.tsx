import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { step1 } from '@/routes/onboarding';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function OnboardingStart() {
    return (
        <AuthSplitLayout
            title="Welcome to the Platform"
            description="Complete your profile to get started"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome to the Platform</CardTitle>
                    <CardDescription>Complete your profile to get started</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-[#9B9EA4]">
                        Please complete your profile setup to access all features.
                    </p>
                    <Link href={step1.url()}>
                        <Button size="lg" className="w-full bg-[#231F20] hover:bg-[#231F20]/90">
                            Get Started
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}

OnboardingStart.layout = (page: any) => page;