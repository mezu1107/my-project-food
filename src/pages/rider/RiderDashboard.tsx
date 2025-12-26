// // src/features/rider/pages/RiderDashboard.tsx
// // Rider sees assigned orders and can update status

// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
// import { useMyOrders } from '@/features/orders/hooks/useOrders';

// export default function RiderDashboard() {
//   const { data: orders = [] } = useMyOrders();
//   const updateStatus = useUpdateOrderStatus();

//   const activeOrder = orders.find(o => o.status === 'out_for_delivery' && o.rider?._id === user.id);

//   if (!activeOrder) {
//     return <div className="text-center py-20 text-xl">No active delivery</div>;
//   }

//   return (
//     <Card className="max-w-md mx-auto mt-10">
//       <CardHeader>
//         <CardTitle>Current Delivery</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div>Order #{activeOrder._id.slice(-6).toUpperCase()}</div>
//         <div>Address: {activeOrder.addressDetails.fullAddress}</div>
//         {activeOrder.addressDetails.floor && <div>Floor: {activeOrder.addressDetails.floor}</div>}
//         {activeOrder.instructions && <div>Note: {activeOrder.instructions}</div>}

//         <Button
//           size="lg"
//           className="w-full"
//           onClick={() => updateStatus.mutate({ orderId: activeOrder._id, status: 'delivered' })}
//           disabled={updateStatus.isPending}
//         >
//           Mark as Delivered
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }