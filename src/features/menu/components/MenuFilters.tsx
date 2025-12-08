import { Search, Leaf, Flame, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CATEGORY_LABELS, CATEGORY_ICONS, type MenuCategory } from '../types/menu.types';

interface MenuFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: MenuCategory | null;
  onCategoryChange: (category: MenuCategory | null) => void;
  isVeg: boolean | null;
  onVegChange: (value: boolean | null) => void;
  isSpicy: boolean | null;
  onSpicyChange: (value: boolean | null) => void;
}

const categories: MenuCategory[] = ['breakfast', 'lunch', 'dinner', 'desserts', 'beverages'];

export function MenuFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  isVeg,
  onVegChange,
  isSpicy,
  onSpicyChange,
}: MenuFiltersProps) {
  const hasActiveFilters = selectedCategory || isVeg !== null || isSpicy !== null;

  const clearFilters = () => {
    onCategoryChange(null);
    onVegChange(null);
    onSpicyChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>

      {/* Category Tabs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat)}
              className="shrink-0 gap-1.5"
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isVeg === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => onVegChange(isVeg === true ? null : true)}
          className={`gap-1.5 ${isVeg === true ? 'bg-accent hover:bg-accent/90' : ''}`}
        >
          <Leaf className="h-3.5 w-3.5" />
          Veg Only
        </Button>
        <Button
          variant={isSpicy === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSpicyChange(isSpicy === true ? null : true)}
          className={`gap-1.5 ${isSpicy === true ? 'bg-destructive hover:bg-destructive/90' : ''}`}
        >
          <Flame className="h-3.5 w-3.5" />
          Spicy
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
