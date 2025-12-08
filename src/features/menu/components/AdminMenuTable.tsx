// src/features/menu/components/AdminMenuTable.tsx
import { useState } from 'react';
import { Pencil, Trash2, MoreHorizontal, Globe, MapPin } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { useToggleMenuAvailability, useDeleteMenuItem, useAvailableAreas } from '../hooks/useMenuApi';
import { CATEGORY_LABELS, type MenuItem } from '../types/menu.types';

interface AdminMenuTableProps {
  items: MenuItem[];
  isLoading: boolean;
  onEdit: (item: MenuItem) => void;
}

export function AdminMenuTable({ items, isLoading, onEdit }: AdminMenuTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleMutation = useToggleMenuAvailability();
  const deleteMutation = useDeleteMenuItem();

  const { data: areasData } = useAvailableAreas();
  const areaNameMap = new Map<string, string>();
  areasData?.areas.forEach((area) => {
    areaNameMap.set(area.id, area.name);
  });

  const handleToggle = (id: string, current: boolean) => {
    toggleMutation.mutate({ id, isAvailable: !current });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No menu items found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center w-20">Veg</TableHead>
                <TableHead className="text-center w-20">Spicy</TableHead>
                <TableHead className="min-w-48">Available In</TableHead>
                <TableHead className="text-center w-24">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="h-12 w-12 rounded-md object-cover border border-border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </TableCell>

                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {item.description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    Rs. {item.price}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.isVeg ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Veg
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Non-Veg</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.isSpicy && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Spicy
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {item.availableInAreas.length === 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Everywhere
                      </Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.availableInAreas.slice(0, 3).map((areaId) => {
                          const name = areaNameMap.get(areaId) || 'Unknown Area';
                          return (
                            <Badge key={areaId} variant="outline" className="text-xs gap-1">
                              <MapPin className="h-3 w-3" />
                              {name}
                            </Badge>
                          );
                        })}
                        {item.availableInAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.availableInAreas.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggle(item._id, item.isAvailable)}
                      disabled={toggleMutation.isPending}
                      aria-label={`Toggle availability for ${item.name}`}
                    />
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(item._id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}