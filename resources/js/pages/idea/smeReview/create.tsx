import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

export default function IdeaSmeReviewCreate() {
    return (
        <>
            <Head title="Create SME Review" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Create SME Review</h1>
                        <p className="mt-2 text-muted-foreground">Submit a new SME review</p>
                    </div>
                </div>
            </div>
        </>
    );
}

IdeaSmeReviewCreate.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
        {
            title: 'SME Reviews',
            href: idea.smeReview.index(),
        },
        {
            title: 'Create Review',
            href: idea.smeReview.create(),
        },
    ],
};
