// src/components/admin/inventory/IngredientTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit, Trash2 } from 'lucide-react';
import type { Ingredient } from '@/types/inventory';

interface Props {
  ingredients: Ingredient[];
  onEdit: (i: Ingredient) => void;
  onDelete: (i: Ingredient) => void;
  onAddStock: (i: Ingredient) => void;
  onWaste: (i: Ingredient) => void;
}

const categoryColors: Record<string, string> = {
  meat: 'bg-red-100 text-red-800',
  vegetables: 'bg-green-100 text-green-800',
  spices: 'bg-orange-100 text-orange-800',
  dairy: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

export const IngredientTable = ({ ingredients, onEdit, onDelete, onAddStock, onWaste }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Cost/Unit</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredients.map((i) => (
          <TableRow key={i._id} className={i.isLowStock ? 'bg-red-50' : ''}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {i.isLowStock && <AlertCircle className="h-4 w-4 text-red-600" />}
                {i.name}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className={categoryColors[i.category] || ''}>
                {i.category}
              </Badge>
            </TableCell>
            <TableCell>
              <span className={i.isLowStock ? 'text-red-600 font-bold' : ''}>
                {i.currentStock} {i.unit}
              </span>
            </TableCell>
            <TableCell>{i.unit}</TableCell>
            <TableCell>Rs. {i.costPerUnit.toFixed(2)}</TableCell>
            <TableCell>{i.supplier || '-'}</TableCell>
            <TableCell className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(i)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAddStock(i)}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => onWaste(i)}>Waste</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};