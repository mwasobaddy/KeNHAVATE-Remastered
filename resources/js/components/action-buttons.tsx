'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ViewButtonProps {
    onClick: () => void;
    title?: string;
}

export function ViewButton({ onClick, title = 'View' }: ViewButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
        >
            <Eye className="h-4 w-4" />
        </button>
    );
}

interface EditButtonProps {
    onClick: () => void;
    title?: string;
}

export function EditButton({ onClick, title = 'Edit' }: EditButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
        >
            <Pencil className="h-4 w-4" />
        </button>
    );
}

interface DeleteButtonProps {
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    disabled?: boolean;
}

export function DeleteButton({
    onConfirm,
    title = 'Delete Item',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    disabled = false,
}: DeleteButtonProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={disabled}
                title="Delete"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:hover:bg-red-950"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            {cancelText}
                        </Button>
                        <Button variant="destructive" onClick={handleConfirm} disabled={disabled}>
                            {confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}