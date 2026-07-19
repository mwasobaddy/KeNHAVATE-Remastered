import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { login, dashboard } from '@/routes';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props as unknown as { auth: { user?: { name: string } } };
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/explore', label: 'Explore Ideas' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span className="text-black">KeNHA</span>
                        <span className="text-foreground">VATE</span>
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow/90"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileOpen && (
                    <div className="border-t md:hidden">
                        <div className="space-y-1 px-4 py-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t pt-3 mt-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        onClick={() => setMobileOpen(false)}
                                        className="block rounded-md bg-black px-3 py-2 text-sm font-medium text-white text-center"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            href={login()}
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-md px-3 py-2 text-sm font-medium text-center text-muted-foreground hover:bg-accent"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={login()}
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-md bg-yellow px-3 py-2 text-sm font-medium text-black text-center"
                                        >
                                            Sign up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <h3 className="mb-3 text-sm font-semibold tracking-tight">KeNHAVATE</h3>
                            <p className="text-sm text-muted-foreground">
                                Kenya National Highways Authority Innovation Portal. Submit, collaborate, and implement ideas that improve our road infrastructure.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold tracking-tight">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold tracking-tight">For Idea Authors</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href={login()} className="hover:text-foreground transition-colors">Submit an Idea</Link></li>
                                <li><Link href={login()} className="hover:text-foreground transition-colors">Track Your Idea</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">Review Process</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold tracking-tight">Contact</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>KeNHA Headquarters</li>
                                <li>P.O. Box 49712-00100</li>
                                <li>Nairobi, Kenya</li>
                                <li>
                                    <a href="mailto:innovate@kenha.co.ke" className="hover:text-foreground transition-colors">
                                        innovate@kenha.co.ke
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} KeNHA. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
