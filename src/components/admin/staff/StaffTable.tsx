// src/components/admin/staff/StaffTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Props {
  users: any[];
  onOpenDialog: (user: any) => void;
}

const roleBadge: Record<string, string> = {
  customer: 'bg-gray-100 text-gray-800',
  rider: 'bg-blue-100 text-blue-800',
  kitchen: 'bg-orange-100 text-orange-800',
  delivery_manager: 'bg-purple-100 text-purple-800',
  support: 'bg-green-100 text-green-800',
  finance: 'bg-indigo-100 text-indigo-800',
};

export const StaffTable = ({ users, onOpenDialog }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.email || '-'}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={roleBadge[user.role] || ''}>
                {user.role.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>{format(new Date(user.createdAt), 'dd MMM yyyy')}</TableCell>
            <TableCell>
              <Button size="sm" onClick={() => onOpenDialog(user)}>
                {['kitchen', 'delivery_manager', 'support', 'finance'].includes(user.role)
                  ? 'Demote'
                  : 'Promote'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};