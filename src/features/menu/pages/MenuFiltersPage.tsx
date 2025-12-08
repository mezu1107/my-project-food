// src/pages/MenuFiltersPage.tsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Filter, Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

import { useMenuFilters } from "@/features/menu/hooks/useMenuApi";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { MenuItemCard } from "@/features/menu/components/MenuItemCard";
import { CATEGORY_LABELS, type MenuCategory } from "@/features/menu/types/menu.types";

export default function MenuFiltersPage() {
  const navigate = useNavigate();
  const { getItemCount, subtotal } = useCartStore();
  const itemCount = getItemCount();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MenuCategory | "">("");
  const [isVeg, setIsVeg] = useState<"true" | "false" | "">("");
  const [isSpicy, setIsSpicy] = useState<"true" | "false" | "">("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "name_asc" | "newest">("price_asc");

  // Price Range
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sliderValue, setSliderValue] = useState<number[]>([0, 2000]);

  const [debouncedMin, setDebouncedMin] = useState<number | undefined>();
  const [debouncedMax, setDebouncedMax] = useState<number | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMin(minPrice === "" ? undefined : Number(minPrice));
      setDebouncedMax(maxPrice === "" ? undefined : Number(maxPrice));
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useMenuFilters({
    search: search || undefined,
    category: category || undefined,
    isVeg: isVeg ? isVeg === "true" : undefined,
    isSpicy: isSpicy ? isSpicy === "true" : undefined,
    sort,
    availableOnly: true,
    minPrice: debouncedMin,
    maxPrice: debouncedMax,
  });

  const allItems = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data?.pages]);
  const totalResults = data?.pages[0]?.pagination.total ?? 0;

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight - 600) {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const hasActiveFilters = search || category || isVeg || isSpicy || debouncedMin !== undefined || debouncedMax !== undefined;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setIsVeg("");
    setIsSpicy("");
    setSort("price_asc");
    setMinPrice("");
    setMaxPrice("");
    setSliderValue([0, 2000]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Explore Menu</h1>
              <p className="text-muted-foreground">
                {totalResults > 0 ? `${totalResults} delicious items` : "Find your favorite food"}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-5 py-2">
              {allItems.length} loaded
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={isVeg} onValueChange={(v) => setIsVeg(v as any)}>
              <SelectTrigger><SelectValue placeholder="Diet" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Veg</SelectItem>
                <SelectItem value="false">Non-Veg</SelectItem>
              </SelectContent>
            </Select>

            <Select value={isSpicy} onValueChange={(v) => setIsSpicy(v as any)}>
              <SelectTrigger><SelectValue placeholder="Spice" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="true">Spicy</SelectItem>
                <SelectItem value="false">Mild</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Button variant={hasActiveFilters ? "default" : "outline"} onClick={clearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>

          {/* Price Range */}
          <div className="bg-card border rounded-xl p-6 shadow-inner">
            <Label className="text-lg font-semibold mb-4 block">Price Range</Label>
            <Slider value={sliderValue} onValueChange={setSliderValue} max={3000} step={50} className="mb-6" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label>Min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMinPrice(val === "" ? "" : Number(val));
                    if (val) setSliderValue([Number(val), sliderValue[1]]);
                  }}
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex-1">
                <Label>Max</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxPrice(val === "" ? "" : Number(val));
                    if (val) setSliderValue([sliderValue[0], Number(val)]);
                  }}
                />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Rs. {sliderValue[0]} — Rs. {sliderValue[1]}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <p className="text-2xl text-destructive mb-6">Failed to load menu</p>
            <Button size="lg" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-32 bg-muted/50 rounded-3xl">
            <Filter className="h-24 w-24 mx-auto mb-8 text-muted-foreground/40" />
            <p className="text-2xl font-semibold text-muted-foreground mb-6">No items match your filters</p>
            <Button size="lg" onClick={clearFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allItems.map((item) => (
                <div key={item._id} className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>

            {isFetchingNextPage && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={`load-${i}`} className="h-96 rounded-2xl" />)}
              </div>
            )}

            {!hasNextPage && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">You've seen all {allItems.length} items</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button onClick={() => navigate("/cart")} size="lg" className="h-16 px-8 text-lg font-bold shadow-2xl rounded-full">
            <ShoppingCart className="mr-3 h-6 w-6" />
            <span className="mr-6">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
            <span className="font-bold">Rs. {subtotal}</span>
          </Button>
        </div>
      )}
    </div>
  );
}