import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export function useCurrentUrl() {
    const { url } = usePage();

    const currentPath = url.split('?')[0];

    const isCurrentUrl = useCallback(
        (href: string) => {
            const urlPath = new URL(href, window.location.origin).pathname;

            return currentPath === urlPath;
        },
        [currentPath],
    );

    const isCurrentOrParentUrl = useCallback(
        (href: string) => {
            const urlPath = new URL(href, window.location.origin).pathname;

            return currentPath === urlPath || currentPath.startsWith(urlPath + '/');
        },
        [currentPath],
    );

    const whenCurrentUrl = useCallback(
        (href: string) => {
            return isCurrentUrl(href) ? 'page' : undefined;
        },
        [isCurrentUrl],
    );

    return useMemo(
        () => ({ isCurrentUrl, isCurrentOrParentUrl, whenCurrentUrl }),
        [isCurrentUrl, isCurrentOrParentUrl, whenCurrentUrl],
    );
}
