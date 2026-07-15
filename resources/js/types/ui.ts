import type { LucideIcon } from 'lucide-react';

export type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon | null;
    badge?: number;
    group?: string;
};

export type AppVariant = 'sidebar' | 'header';
