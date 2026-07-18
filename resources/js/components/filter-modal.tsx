import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Category = {
    id: number;
    name: string;
};

type FilterModalProps = {
    statuses: readonly string[];
    categories: Category[];
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClear: () => void;
    hasActiveFilters: boolean;
};

export default function FilterModal({
    statuses,
    categories,
    filters,
    onFilterChange,
    onClear,
    hasActiveFilters,
}: FilterModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                    {hasActiveFilters && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {statuses.length > 0 && (
                        <>
                            <div>
                                <h4 className="mb-2 text-sm font-medium">Status</h4>
                                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                                    {statuses.map((status) => (
                                        <label
                                            key={status}
                                            className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted"
                                        >
                                            <Checkbox
                                                checked={filters.status?.split(',').includes(status)}
                                                onCheckedChange={(checked) => {
                                                    const current = (filters.status ?? '').split(',').filter(Boolean);
                                                    const next = checked
                                                        ? [...current, status]
                                                        : current.filter((s) => s !== status);

                                                    onFilterChange('status', next.join(','));
                                                }}
                                            />
                                            {status.replace(/_/g, ' ')}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {categories.length > 0 && (
                        <>
                            <div>
                                <h4 className="mb-2 text-sm font-medium">Category</h4>
                                <Select
                                    value={filters.category_id ?? ''}
                                    onValueChange={(value) => onFilterChange('category_id', value === '_all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                        </>
                    )}

                    <div>
                        <h4 className="mb-2 text-sm font-medium">Date Range</h4>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Label htmlFor="filter-date-from" className="text-xs text-muted-foreground">From</Label>
                                <Input
                                    id="filter-date-from"
                                    type="date"
                                    value={filters.date_from ?? ''}
                                    onChange={(e) => onFilterChange('date_from', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="filter-date-to" className="text-xs text-muted-foreground">To</Label>
                                <Input
                                    id="filter-date-to"
                                    type="date"
                                    value={filters.date_to ?? ''}
                                    onChange={(e) => onFilterChange('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-2">
                        <Button variant="outline" size="sm" onClick={onClear}>
                            Clear filters
                        </Button>
                        <DialogClose asChild>
                            <Button size="sm">Apply filters</Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
