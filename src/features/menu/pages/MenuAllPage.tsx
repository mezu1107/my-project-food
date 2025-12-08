// src/features/menu/pages/MenuAllPage.tsx
import { useState, useMemo } from "react";
import { useFullMenuCatalog } from "../hooks/useMenuApi";
import { MenuItemCard } from "../components/MenuItemCard";
import { MenuPageSkeleton } from "../components/MenuSkeleton";
import { MenuCategory, CATEGORY_LABELS } from "../types/menu.types";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const allCategories: (MenuCategory | "all")[] = [
  "all",
  "breakfast",
  "lunch",
  "dinner",
  "desserts",
  "beverages",
];

export const MenuAllPage = () => {
  const { data, isLoading, error } = useFullMenuCatalog();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (!data?.menu) return [];
    if (selectedCategory === "all") return data.menu;
    return data.menu.filter((item) => item.category === selectedCategory);
  }, [data?.menu, selectedCategory]);

  // Count items per category for badges (optional enhancement)
  const categoryCounts = useMemo(() => {
    const counts: Record<MenuCategory, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      desserts: 0,
      beverages: 0,
    };
    data?.menu?.forEach((item) => {
      counts[item.category]++;
    });
    return counts;
  }, [data?.menu]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Complete Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore all our delicious dishes — freshly prepared and ready to satisfy your cravings
          </p>
          {data && (
            <p className="text-lg text-muted-foreground mt-4">
              <strong>{data.totalItems}</strong> items available
            </p>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-3">
            {allCategories.map((cat) => {
              const count = cat === "all" ? data?.totalItems || 0 : categoryCounts[cat as MenuCategory];
              const isActive = selectedCategory === cat;

              return (
                <Button
                  key={cat}
                  variant={isActive ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedCategory(cat)}
                  className={`capitalize font-medium transition-all duration-200 ${
                    isActive
                      ? "shadow-md"
                      : "hover:shadow-sm hover:bg-accent/50"
                  }`}
                >
                  {cat === "all" ? "All Items" : CATEGORY_LABELS[cat as MenuCategory]}
                  <span className="ml-2 text-xs font-bold opacity-80">
                    ({count})
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <MenuPageSkeleton />
        ) : error ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-2xl font-semibold text-destructive mb-4">
              Failed to load menu
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-muted/50 rounded-2xl">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">
              No items found in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <MenuItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAllPage;