// src/components/admin/customers/BlockUnblockButton.tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  isActive: boolean;
  onClick: () => void;
  isLoading: boolean;
}

export const BlockUnblockButton = ({ isActive, onClick, isLoading }: Props) => {
  return (
    <Button
      size="sm"
      variant={isActive ? 'destructive' : 'outline'}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? 'Block' : 'Unblock'}
    </Button>
  );
};