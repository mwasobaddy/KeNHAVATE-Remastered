import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/routes';

type Props = {
    invitation: {
        idea_title: string;
        invited_by: string;
        token: string;
    };
};

export default function IdeaInvitation({ invitation }: Props) {
    return (
        <>
            <Head title="Idea Invitation" />

            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">
                            You're Invited!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-muted-foreground">
                            <strong>{invitation.invited_by}</strong> has invited you to
                            contribute to the idea:
                        </p>

                        <p className="text-lg font-semibold">
                            {invitation.idea_title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Sign in to accept the invitation and join the team as a contributor.
                        </p>

                        <Button asChild className="w-full">
                            <Link href={login()}>
                                Sign in to Accept
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

IdeaInvitation.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Invitation', href: '#' },
    ],
};