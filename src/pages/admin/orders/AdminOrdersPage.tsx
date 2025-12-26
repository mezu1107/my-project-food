// // src/features/admin/pages/AdminOrdersPage.tsx
// // FINAL PRODUCTION — DECEMBER 27, 2025
// // Admin orders list with status filter + pagination + rider assignment + status update

// import { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination';
// import { Loader2 } from 'lucide-react';
// import { toast } from 'sonner';

// import { useAdminOrders } from '@/features/orders/hooks/useOrders';
// import { useUpdateOrderStatus, useAssignRider } from '@/features/orders/hooks/useOrders';
// import { useRiders } from '@/features/riders/hooks/useRiders'; // Assume you have this
// import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';

// export default function AdminOrdersPage() {
//   const [filters, setFilters] = useState<{ status?: string }>({});
//   const [page, setPage] = useState(1);
//   const limit = 20; // Matches backend default

//   const { data, isLoading, isFetching } = useAdminOrders({
//     status: filters.status,
//     page,
//     limit,
//   });

//   const { data: riders = [] } = useRiders(); // Fetch available riders

//   const updateStatus = useUpdateOrderStatus();
//   const assignRider = useAssignRider();

//   const totalPages = data?.pagination?.total
//     ? Math.ceil(data.pagination.total / limit)
//     : 1;

//   const handleStatusChange = (orderId: string, newStatus: string) => {
//     updateStatus.mutate(
//       { orderId, status: newStatus as any },
//       {
//         onSuccess: () => toast.success('Status updated successfully'),
//         onError: () => toast.error('Failed to update status'),
//       }
//     );
//   };

//   const handleAssignRider = (orderId: string, riderId: string) => {
//     assignRider.mutate(
//       { orderId, riderId },
//       {
//         onSuccess: () => toast.success('Rider assigned successfully'),
//         onError: () => toast.error('Failed to assign rider'),
//       }
//     );
//   };

//   const renderPaginationItems = () => {
//     const items = [];
//     const maxVisible = 5;

//     let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);

//     if (endPage - startPage + 1 < maxVisible) {
//       startPage = Math.max(1, endPage - maxVisible + 1);
//     }

//     if (startPage > 1) {
//       items.push(
//         <PaginationItem key={1}>
//           <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
//         </PaginationItem>
//       );
//       if (startPage > 2) {
//         items.push(<PaginationEllipsis key="start-ellipsis" />);
//       }
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       items.push(
//         <PaginationItem key={i}>
//           <PaginationLink
//             onClick={() => setPage(i)}
//             isActive={i === page}
//           >
//             {i}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     if (endPage < totalPages) {
//       if (endPage < totalPages - 1) {
//         items.push(<PaginationEllipsis key="end-ellipsis" />);
//       }
//       items.push(
//         <PaginationItem key={totalPages}>
//           <PaginationLink onClick={() => setPage(totalPages)}>
//             {totalPages}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     return items;
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <CardTitle className="text-2xl">All Orders</CardTitle>
//             <div className="flex items-center gap-4">
//               <Select
//                 value={filters.status || ''}
//                 onValueChange={(val) => {
//                   setFilters(val ? { status: val } : {});
//                   setPage(1); // Reset to first page on filter
//                 }}
//               >
//                 <SelectTrigger className="w-64">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="">All Status</SelectItem>
//                   {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
//                     <SelectItem key={key} value={key}>
//                       {label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {(isLoading || isFetching) ? (
//             <div className="flex justify-center py-20">
//               <Loader2 className="h-10 w-10 animate-spin" />
//             </div>
//           ) : (
//             <>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order ID</TableHead>
//                     <TableHead>Customer</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Total</TableHead>
//                     <TableHead>Rider</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {data?.orders.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
//                         No orders found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     data?.orders.map((order) => (
//                       <TableRow key={order._id}>
//                         <TableCell className="font-medium">
//                           #{order._id.slice(-6).toUpperCase()}
//                         </TableCell>
//                         <TableCell>
//                           {order.guestInfo?.name || order.customer?.name || 'Guest'}
//                         </TableCell>
//                         <TableCell>
//                           <Badge className={ORDER_STATUS_COLORS[order.status]}>
//                             {ORDER_STATUS_LABELS[order.status]}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>Rs. {order.finalAmount.toLocaleString()}</TableCell>
//                         <TableCell>
//                           {order.rider
//                             ? `${order.rider.name} (${order.rider.phone})`
//                             : 'Not assigned'}
//                         </TableCell>
//                         <TableCell className="space-x-2">
//                           {/* Status Update */}
//                           <Select
//                             disabled={updateStatus.isPending}
//                             onValueChange={(val) => handleStatusChange(order._id, val)}
//                           >
//                             <SelectTrigger className="w-40">
//                               <SelectValue placeholder="Change Status" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {[
//                                 'confirmed',
//                                 'preparing',
//                                 'out_for_delivery',
//                                 'delivered',
//                                 'rejected',
//                               ].map((st) => (
//                                 <SelectItem
//                                   key={st}
//                                   value={st}
//                                   disabled={order.status === st}
//                                 >
//                                   {ORDER_STATUS_LABELS[st as keyof typeof ORDER_STATUS_LABELS]}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>

//                           {/* Assign Rider */}
//                           {!order.rider && (
//                             <Select
//                               disabled={assignRider.isPending}
//                               onValueChange={(riderId) => handleAssignRider(order._id, riderId)}
//                             >
//                               <SelectTrigger className="w-40">
//                                 <SelectValue placeholder="Assign Rider" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {riders.map((rider) => (
//                                   <SelectItem key={rider._id} value={rider._id}>
//                                     {rider.name} ({rider.phone})
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <Pagination className="mt-8">
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         onClick={() => setPage(Math.max(1, page - 1))}
//                         className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                       />
//                     </PaginationItem>

//                     {renderPaginationItems()}

//                     <PaginationItem>
//                       <PaginationNext
//                         onClick={() => setPage(Math.min(totalPages, page + 1))}
//                         className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               )}

//               {/* Results Info */}
//               <div className="mt-4 text-sm text-muted-foreground text-center">
//                 Showing {(page - 1) * limit + 1} to{' '}
//                 {Math.min(page * limit, data?.pagination?.total || 0)} of{' '}
//                 {data?.pagination?.total || 0} orders
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }