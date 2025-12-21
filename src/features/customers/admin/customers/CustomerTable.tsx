// src/components/admin/customers/CustomerTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlockUnblockButton } from './BlockUnblockButton';
import { Customer } from '@/types/user';
import { format } from 'date-fns';

interface Props {
  customers: Customer[];
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  isBlocking: boolean;
  isUnblocking: boolean;
}

export const CustomerTable = ({ customers, onBlock, onUnblock, isBlocking, isUnblocking }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer._id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell>{customer.email || '-'}</TableCell>
            <TableCell>{format(new Date(customer.createdAt), 'dd MMM yyyy')}</TableCell>
            <TableCell>{format(new Date(customer.lastActiveAt), 'dd MMM yyyy')}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.isActive ? 'Active' : 'Blocked'}
              </span>
            </TableCell>
            <TableCell>
              <BlockUnblockButton
                isActive={customer.isActive}
                onClick={() => (customer.isActive ? onBlock(customer._id) : onUnblock(customer._id))}
                isLoading={isBlocking || isUnblocking}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};