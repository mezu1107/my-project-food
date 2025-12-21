import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerTable } from './CustomerTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const CustomerList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const {
    customers,
    pagination,
    isLoading,
    isError,
    blockCustomer,
    unblockCustomer,
    isBlocking,
    isUnblocking,
  } = useCustomers(search, page, limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isError) {
    return <div className="text-center text-red-500">Failed to load customers</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Management</CardTitle>
        <form onSubmit={handleSearch} className="flex gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <CustomerTable
                customers={customers}
                onBlock={blockCustomer}
                onUnblock={unblockCustomer}
                isBlocking={isBlocking}
                isUnblocking={isUnblocking}
              />
            </div>
            {pagination && pagination.pages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                      className={page === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Showing {customers.length} of {pagination?.total || 0} customers
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};