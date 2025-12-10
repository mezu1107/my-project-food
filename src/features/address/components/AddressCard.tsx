import { Address } from '../types/address.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Briefcase, MapPin, MoreVertical, Edit, Trash2, Star } from 'lucide-react';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onSelect?: (address: Address) => void;
  isSelectable?: boolean;
}

const labelIcons = {
  Home: Home,
  Work: Briefcase,
  Other: MapPin,
};

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  isSelectable = false,
}: AddressCardProps) => {
  const LabelIcon = labelIcons[address.label];

  return (
    <Card
      className={`p-4 transition-all ${isSelectable ? 'cursor-pointer hover:border-primary hover:shadow-md' : ''} ${address.isDefault ? 'border-primary bg-primary/5' : ''}`}
      onClick={() => isSelectable && onSelect?.(address)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${address.isDefault ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <LabelIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{address.label}</span>
              {address.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
              {address.fullAddress}
            </p>
            <p className="text-xs text-muted-foreground">
              {address.area.name}, {address.area.city}
            </p>
            {address.instructions && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Note: {address.instructions}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(address); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {!address.isDefault && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetDefault(address._id); }}>
                <Star className="h-4 w-4 mr-2" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
