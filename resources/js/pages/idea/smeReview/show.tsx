import { Head } from '@inertiajs/react';
import idea from '@/routes/idea';

export default function IdeaSmeReviewShow() {
    return (
        <>
            <Head title="SME Review Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">SME Review Details</h1>
                        <p className="mt-2 text-muted-foreground">View SME review details</p>
                    </div>
                </div>
            </div>
        </>
    );
}

IdeaSmeReviewShow.layout = {
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
            title: 'Review Details',
            href: idea.smeReview.show({ smeReview: 0 }),
        },
    ],
};
