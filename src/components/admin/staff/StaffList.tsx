// src/components/admin/staff/StaffList.tsx
import { useState } from 'react';
import { useStaff } from '@/hooks/useStaff';
import { StaffTable } from './StaffTable';
import { PromoteDemoteDialog } from './PromoteDemoteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

export const StaffList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    users,
    pagination,
    isLoading,
    isError,
    promoteUser,
    demoteUser,
    isPromoting,
    isDemoting,
  } = useStaff(search, page, 50);

  const handleOpenDialog = (user: any) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handlePromote = (id: string, role: string) => {
    promoteUser(id, role);
    setDialogOpen(false);
  };

  const handleDemote = (id: string) => {
    demoteUser(id);
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500">Failed to load users</div>
        ) : (
          <>
            <div className="rounded-md border">
              <StaffTable users={users} onOpenDialog={handleOpenDialog} />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Showing {users.length} of {pagination?.total || 0} users
            </p>
          </>
        )}
      </CardContent>

      {selectedUser && (
        <PromoteDemoteDialog
          user={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onPromote={handlePromote}
          onDemote={handleDemote}
          isLoading={isPromoting || isDemoting}
        />
      )}
    </Card>
  );
};