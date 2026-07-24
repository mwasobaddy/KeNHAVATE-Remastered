import { router, Head } from '@inertiajs/react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Button } from '@/components/ui/button';

export default function AccountDeleted() {
    return (
        <AuthSplitLayout
            title="Account Deleted"
            description="This account was previously deleted."
        >
            <Head title="Account Deleted" />

            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground text-center">
                    What would you like to do?
                </p>

                <Button
                    type="button"
                    className="w-full"
                    onClick={() =>
                        router.post('/auth/account-deleted/start-fresh')
                    }
                >
                    Start a fresh account
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.visit('/contact')}
                >
                    Request restore — Contact support
                </Button>
            </div>
        </AuthSplitLayout>
    );
}

AccountDeleted.layout = {};
