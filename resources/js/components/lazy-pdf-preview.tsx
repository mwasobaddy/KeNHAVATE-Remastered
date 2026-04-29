import { useState, startTransition, Suspense } from 'react';

interface LazyPdfPreviewProps {
    file: File;
}

export default function LazyPdfPreview({ file }: LazyPdfPreviewProps) {
    const [Preview, setPreview] = useState<React.ComponentType<{ file: File }> | null>(null);

    // Load only when file changes and not null
    if (file && !Preview) {
        startTransition(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            import('./pdf-preview.tsx')
                .then((mod) => setPreview(() => mod.default))
                .catch((err) => console.error('Failed to load PDF Preview:', err));
        });
    }

    if (!file) {
        return null;
    }

    if (!Preview) {
        return <div className="p-4 text-center text-muted-foreground">Loading PDF viewer...</div>;
    }

    return (
        <Suspense fallback={<div className="p-4 text-center">Loading PDF viewer...</div>}>
            <Preview file={file} />
        </Suspense>
    );
}