import { Document, Page, pdfjs } from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// eslint-disable-next-line import/order
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Use the React-PDF recommended CDN worker URL for pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
    file: File;
}

export default function PdfPreview({ file }: PdfPreviewProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageWidth, setPageWidth] = useState<number>(400);
    const [error, setError] = useState<string | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setError(null);
        toast.success(`PDF loaded: ${numPages} pages`);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF Error:', error);
        setError(error.message);
        toast.error('Failed to load PDF: ' + error.message);
    };

    // Reset on file change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNumPages(null);
        setPageNumber(1);
        setError(null);
    }, [file]);

    if (error) {
        return (
            <div className="rounded-lg border p-4 bg-destructive/10">
                <div className="text-sm text-destructive mb-2">PDF Error:</div>
                <pre className="text-xs break-all whitespace-pre-wrap">{error}</pre>
                <div className="mt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            <div className="bg-muted p-3 flex flex-col sm:flex-row gap-2">
                <div className="text-sm text-muted-foreground flex-1">
                    {file.name} {numPages && `(Page ${pageNumber} / ${numPages})`}
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="range"
                        min={1}
                        max={numPages || 1}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(parseInt(e.target.value))}
                        disabled={!numPages}
                        className="w-20 h-8"
                        aria-label="PDF Page"
                    />
                    <Input
                        type="number"
                        min={100}
                        max={800}
                        value={pageWidth}
                        onChange={(e) => setPageWidth(parseInt(e.target.value))}
                        disabled={!numPages}
                        className="w-20 h-8 text-center"
                        aria-label="PDF Width"
                    />
                    <span className="text-xs text-muted-foreground hidden sm:inline">px</span>
                </div>
            </div>

            <div className="py-4 flex justify-center overflow-auto bg-white/50">
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<div className="p-8 text-center">Loading PDF...</div>}
                    error={<div className="p-8 text-destructive">Failed to load PDF.</div>}
                    noData="No PDF file"
                >
                    {numPages ? (
                        <Page
                            pageNumber={pageNumber}
                            width={pageWidth}
                            loading="Loading page..."
                            error="Failed to load page"
                        />
                    ) : (
                        <div className="p-8 text-center">Loading PDF...</div>
                    )}
                </Document>
            </div>
        </div>
    );
}