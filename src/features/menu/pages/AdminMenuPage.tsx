// src/pages/admin/Menu.tsx
import { useState, useMemo } from "react";
import { Plus, Search, Package, Check, X } from "lucide-react"; // ← added Check & X
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card"; // ← THIS WAS MISSING
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminMenuItems } from "@/features/menu/hooks/useMenuApi";
import { AdminMenuTable } from "@/features/menu/components/AdminMenuTable";
import { MenuItemFormModal } from "@/features/menu/components/MenuItemFormModal";
import { CATEGORY_LABELS, type MenuItem } from "@/features/menu/types/menu.types";

export default function AdminMenuPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError } = useAdminMenuItems();

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" ? item.isAvailable : !item.isAvailable);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [data?.items, search, categoryFilter, availabilityFilter]);

  const stats = useMemo(() => {
    if (!data?.items) return { total: 0, available: 0, unavailable: 0 };
    return {
      total: data.items.length,
      available: data.items.filter((i) => i.isAvailable).length,
      unavailable: data.items.filter((i) => !i.isAvailable).length,
    };
  }, [data?.items]);

  const handleEdit = (item: MenuItem) => {
    navigate(`/admin/menu/edit/${item._id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header & Stats */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground mt-2">Manage your restaurant menu items</p>
            </div>
            <Button onClick={() => setModalOpen(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Item
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-4xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </Card>

            <Card className="p-6 text-center border-green-200 bg-green-50 dark:bg-green-950/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {stats.available}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </Card>

            <Card className="p-6 text-center border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                <X className="h-6 w-6 text-orange-700 dark:text-orange-300" />
              </div>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {stats.unavailable}
              </p>
              <p className="text-sm text-muted-foreground">Unavailable</p>
            </Card>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-end mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={availabilityFilter}
            onValueChange={(value) => setAvailabilityFilter(value as "all" | "available" | "unavailable")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
              <SelectItem value="unavailable">Unavailable Only</SelectItem>
            </SelectContent>
          </Select>

          {(search || categoryFilter !== "all" || availabilityFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setAvailabilityFilter("all");
              }}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Table */}
        {isError ? (
          <div className="text-center py-20">
            <p className="text-xl text-destructive mb-4">Failed to load menu</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <AdminMenuTable items={filteredItems} isLoading={isLoading} onEdit={handleEdit} />
        )}
      </div>

      <MenuItemFormModal open={modalOpen} onOpenChange={setModalOpen} editItem={null} />
    </div>
  );
}
