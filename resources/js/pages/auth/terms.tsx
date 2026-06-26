import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';

type Props = {
    title: string;
    text: string;
};

export default function Terms({ title, text }: Props) {
    return (
        <AuthCardLayout title={title} description="Please review and accept our terms to continue.">
            <Head title={title} />

            <Form method="post" action="/auth/terms" className="flex flex-col gap-6">
                {({ processing }) => (
                    <div className="grid gap-6">
                        <div className="prose prose-sm max-h-80 overflow-y-auto rounded-md border bg-muted/50 p-4 text-muted-foreground">
                            {text.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Please wait...' : 'Accept Terms & Conditions'}
                        </Button>
                    </div>
                )}
            </Form>
        </AuthCardLayout>
    );
}

Terms.layout = {};
