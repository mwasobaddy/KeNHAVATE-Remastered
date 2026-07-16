export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary">
                <span className="text-base leading-none font-bold text-sidebar-primary-foreground">K</span>
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-sidebar-foreground">
                    KeNHA
                </span>
                <span className="truncate text-xs" style={{ color: '#9B9EA4' }}>
                    Innovation Portal
                </span>
            </div>
        </>
    );
}
