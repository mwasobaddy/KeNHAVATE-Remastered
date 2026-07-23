import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-3 self-center font-medium"
                >
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-black bg-white shadow-[0_0_20px_rgba(255,242,0,0.3)] dark:border-yellow dark:bg-zinc-800">
                        <img
                            src="/img/logo-icon.webp"
                            alt="KeNHAVATE"
                            className="size-6 fill-current text-[#231F20] dark:text-zinc-900 hover:scale-105 transition-transform duration-300 ease-in-out h-full w-full object-cover"
                        />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
