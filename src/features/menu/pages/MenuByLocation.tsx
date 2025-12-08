// src/features/menu/pages/MenuByLocationPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Share2, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";

import { useMenuByArea } from "../hooks/useMenuApi";
import { MenuHeader } from "../components/MenuHeader";
import { MenuFilters } from "../components/MenuFilters";
import { MenuItemCard } from "../components/MenuItemCard";
import { MenuPageSkeleton } from "../components/MenuSkeleton";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { CATEGORY_LABELS, type MenuCategory, type MenuItem } from "../types/menu.types";

export default function MenuByLocationPage() {
  const navigate = useNavigate();
  const { areaId: paramAreaId } = useParams<{ areaId?: string }>();

  // Support: /menu/area/:id  OR  ?area=xxx  OR  localStorage
  const urlAreaId = paramAreaId || new URLSearchParams(location.search).get("area");
  const storedAreaId = localStorage.getItem("selectedAreaId");
  const areaId = urlAreaId || storedAreaId;

  const { data, isLoading, error } = useMenuByArea(areaId || undefined);
  const { getItemCount, subtotal } = useCartStore();
  const itemCount = getItemCount();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isVeg, setIsVeg] = useState<boolean | null>(null);
  const [isSpicy, setIsSpicy] = useState<boolean | null>(null);

  // Persist area & redirect if missing
  useEffect(() => {
    if (!areaId) {
      navigate("/menu/area/:areaId", { replace: true });
    } else {
      localStorage.setItem("selectedAreaId", areaId);
    }
  }, [areaId, navigate]);

  const menuItems = data?.menu || [];
  const area = data?.area;

  // Client-side filtering
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.isAvailable) return false;

      if (search) {
        const q = search.toLowerCase().trim();
        if (!item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q))
          return false;
      }

      if (selectedCategory && item.category !== selectedCategory) return false;
      if (isVeg !== null && item.isVeg !== isVeg) return false;
      if (isSpicy !== null && item.isSpicy !== isSpicy) return false;

      return true;
    });
  }, [menuItems, search, selectedCategory, isVeg, isSpicy]);

  // Group by category
  const groupedItems = useMemo<Record<MenuCategory, MenuItem[]>>(() => {
    const groups: Record<MenuCategory, MenuItem[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      desserts: [],
      beverages: [],
    };
    filteredItems.forEach((item) => groups[item.category].push(item));
    return groups;
  }, [filteredItems]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Menu link copied!");
  };

  if (isLoading) return <MenuPageSkeleton />;

  if (error || !area) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-destructive">
            {error?.message || "Delivery not available in this area"}
          </p>
          <Button size="lg" onClick={() => navigate("/")}>
            Choose Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{area.name} Menu • Order Food in {area.city}</title>
        <meta
          name="description"
          content={`Order from ${menuItems.length}+ items in ${area.name}, ${area.city}. Fast delivery in 35-45 mins.`}
        />
        <meta property="og:title" content={`${area.name} Menu - Order Now`} />
        <meta property="og:image" content={menuItems[0]?.image || "/og-default.jpg"} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <MenuHeader
          areaName={area.name}
          city={area.city}
          deliveryFee={149}
          estimatedTime="35-50 min"
          onChangeLocation={() => navigate("/")}
        />

        {/* Share button separately */}
        <div className="container mx-auto px-4 py-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Menu
          </Button>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 py-6">
          <MenuFilters
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isVeg={isVeg}
            onVegChange={setIsVeg}
            isSpicy={isSpicy}
            onSpicyChange={setIsSpicy}
          />
        </div>

        {/* Menu Content */}
        <div className="container mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-muted/50 rounded-2xl">
              <p className="text-xl text-muted-foreground mb-6">
                No items match your filters in <strong>{area.name}</strong>
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                  setIsVeg(null);
                  setIsSpicy(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : selectedCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {(Object.keys(groupedItems) as MenuCategory[]).map((cat) => {
                const items = groupedItems[cat];
                if (!items.length) return null;

                return (
                  <section key={cat}>
                    <h2 className="text-3xl font-bold mb-6 flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        {CATEGORY_LABELS[cat]}
                        <Badge variant="secondary" className="text-lg px-3">
                          {items.length}
                        </Badge>
                      </span>
                      {items.some((i) => i.availableInAreas.length === 0) && (
                        <Badge variant="outline" className="gap-1 flex items-center">
                          <Globe className="h-3 w-3" />
                          Available Everywhere
                        </Badge>
                      )}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {items.map((item) => (
                        <MenuItemCard key={item._id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Cart */}
        {itemCount > 0 && (
          <div className="fixed inset-x-0 bottom-6 px-4 z-50 pointer-events-none">
            <div className="max-w-lg mx-auto pointer-events-auto">
              <Button
                onClick={() => navigate("/cart")}
                size="lg"
                className="w-full h-16 text-lg font-bold shadow-2xl rounded-xl hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between w-full px-6">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6" />
                    <span>
                      {itemCount} item{itemCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="font-bold">Rs. {subtotal}</span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
