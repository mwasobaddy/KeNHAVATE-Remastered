import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { login, dashboard } from '@/routes';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const { auth } = props as unknown as { auth: { user?: { name: string } } };
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/explore', label: 'Explore Ideas' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return url === '/';
        }

        return url.startsWith(href);
    };

    const activeClasses =
        'text-black dark:text-yellow after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-black dark:after:bg-yellow';

    const inactiveClasses =
        'text-muted-foreground hover:text-foreground';

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <img src="/img/logo-icon.webp" alt="KeNHA logo" className="h-9 w-9" />
                        <span className="text-foreground">KeNHAVATE</span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive(link.href) ? activeClasses : inactiveClasses
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="group inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-all hover:bg-black/90 dark:bg-yellow dark:text-black dark:hover:bg-yellow/90"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="group inline-flex items-center gap-2 rounded-full bg-yellow px-5 py-2 text-sm font-medium text-black transition-all hover:bg-yellow/90"
                            >
                                <span>Get Started</span>
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
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

                {/* Mobile overlay backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile drawer — slides from left */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border/50 bg-background shadow-2xl transition-transform duration-300 ease-out md:hidden h-screen ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {/* Drawer header */}
                    <div className="flex h-16 items-center justify-between border-b border-border/50 px-5">
                        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
                            <img src="/img/logo-icon.webp" alt="KeNHA logo" className="h-9 w-9" />
                            <span className="text-foreground">KeNHAVATE</span>
                        </Link>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent"
                            aria-label="Close menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav links */}
                    <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive(link.href)
                                        ? 'text-black dark:text-yellow bg-yellow/10 dark:bg-yellow/5'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-yellow" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth section */}
                    <div className="border-t border-border/50 px-4 py-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white text-center"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                onClick={() => setMobileOpen(false)}
                                className="group flex items-center justify-center gap-2 rounded-full bg-yellow px-5 py-2.5 text-sm font-medium text-black text-center"
                            >
                                <span>Get Started</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="border-t border-border/50 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <img src="/img/logo-icon.webp" alt="KeNHA logo" className="h-7 w-7" />
                                <h3 className="text-sm font-semibold tracking-tight">KeNHAVATE</h3>
                            </div>
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
                    <div className="mt-8 border-t border-border/50 pt-6">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} KeNHA. All rights reserved.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <Link href="/terms" className="hover:text-foreground transition-colors">
                                    Terms &amp; Conditions
                                </Link>
                                <span className="text-muted-foreground/30">|</span>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
