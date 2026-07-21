import { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
    FileIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    ImageIcon,
    UploadIcon,
    XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
} from '@/components/ui/attachment';
import InputError from '@/components/input-error';

function fileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';

    if (['pdf', 'doc', 'docx'].includes(ext)) {
        return <FileTextIcon className="h-4 w-4" />;
    }

    if (['xls', 'xlsx'].includes(ext)) {
        return <FileSpreadsheetIcon className="h-4 w-4" />;
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return <ImageIcon className="h-4 w-4" />;
    }

    return <FileIcon className="h-4 w-4" />;
}

function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extLabel(name: string): string {
    return (name.split('.').pop()?.toUpperCase() ?? 'Unknown');
}

type SingleProps = {
    multiple?: false;
    file: File | null;
    onFileChange: (file: File | null) => void;
};

type MultiProps = {
    multiple: true;
    files: File[];
    onFilesChange: Dispatch<SetStateAction<File[]>>;
};

type FileUploadProps = {
    accept: string;
    label: string;
    required?: boolean;
    error?: string;
} & (SingleProps | MultiProps);

export function FileUpload({ accept, label, required, error, ...rest }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isMulti: boolean = (rest as MultiProps).multiple === true;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }

        if (isMulti) {
            const newFiles = Array.from(e.target.files);
            (rest as MultiProps).onFilesChange((prev) => [...prev, ...newFiles]);
        } else {
            (rest as SingleProps).onFileChange(e.target.files[0] ?? null);
        }

        e.target.value = '';
    };

    const triggerInput = () => inputRef.current?.click();

    return (
        <div className="grid gap-2">
            <Label>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>

            <input
                type="file"
                ref={inputRef}
                accept={accept}
                multiple={isMulti}
                className="hidden"
                onChange={handleChange}
            />

            {isMulti ? (
                <>
                    <Button type="button" variant="outline" onClick={triggerInput}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Add documents
                    </Button>
                    {(rest as MultiProps).files.length > 0 && (
                        <AttachmentGroup>
                            {(rest as MultiProps).files.map((f, i) => (
                                <Attachment key={`f-${i}`}>
                                    <AttachmentMedia>{fileIcon(f.name)}</AttachmentMedia>
                                    <AttachmentContent>
                                        <AttachmentTitle>{f.name}</AttachmentTitle>
                                        <AttachmentDescription>
                                            {extLabel(f.name)} · {formatSize(f.size)}
                                        </AttachmentDescription>
                                    </AttachmentContent>
                                    <AttachmentActions>
                                        <AttachmentAction
                                            aria-label={`Remove ${f.name}`}
                                            onClick={() =>
                                                (rest as MultiProps).onFilesChange(
                                                    (prev) => prev.filter((_, j) => j !== i),
                                                )
                                            }
                                        >
                                            <XIcon />
                                        </AttachmentAction>
                                    </AttachmentActions>
                                </Attachment>
                            ))}
                        </AttachmentGroup>
                    )}
                </>
            ) : (
                <>
                    {!(rest as SingleProps).file ? (
                        <Button type="button" variant="outline" onClick={triggerInput}>
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Choose file
                        </Button>
                    ) : (
                        <Attachment>
                            <AttachmentMedia>{fileIcon((rest as SingleProps).file.name)}</AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle>{(rest as SingleProps).file.name}</AttachmentTitle>
                                <AttachmentDescription>
                                    {extLabel((rest as SingleProps).file.name)} · {formatSize((rest as SingleProps).file.size)}
                                </AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                                <AttachmentAction
                                    aria-label={`Remove ${(rest as SingleProps).file.name}`}
                                    onClick={() => {
                                        (rest as SingleProps).onFileChange(null);
                                        if (inputRef.current) {
                                            inputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <XIcon />
                                </AttachmentAction>
                            </AttachmentActions>
                        </Attachment>
                    )}
                </>
            )}

            {error && <InputError message={error} />}
        </div>
    );
}
