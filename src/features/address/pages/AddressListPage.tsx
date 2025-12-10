// src/features/address/pages/AddressListPage.tsx
'use client';

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MapPin } from 'lucide-react';
import { AddressCard } from '../components/AddressCard';
import { AddressFormModal } from '../components/AddressFormModal';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '../hooks/useAddresses';
import { Address } from '../types/address.types';
import { motion } from 'framer-motion';

export default function AddressListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data: addresses = [], isLoading, isError } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this address?')) {
      deleteAddress.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress.mutate(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  // Sort: default first, then newest
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <Helmet>
        <title>My Addresses • AM Foods</title>
        <meta name="description" content="Manage your saved delivery addresses" />
      </Helmet>

      {/* Header is already in PublicLayout — no need to include again */}
      <div className="min-h-screen bg-muted/30 pb-12 pt-8">
        <main className="container mx-auto px-4 max-w-3xl">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Addresses</h1>
              <p className="text-muted-foreground mt-2">
                Add and manage your delivery locations
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Address
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Loading your addresses...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-20 bg-card rounded-2xl border">
              <p className="text-destructive text-lg font-medium mb-4">
                Failed to load addresses
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Addresses List */}
          {!isLoading && !isError && sortedAddresses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {sortedAddresses.map((address, index) => (
                <motion.div
                  key={address._id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07, type: "spring", stiffness: 120 }}
                >
                  <AddressCard
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && addresses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-24 bg-card rounded-2xl border"
            >
              <div className="bg-muted/60 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8">
                <MapPin className="h-14 w-14 text-muted-foreground/70" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No addresses saved yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-10 px-4">
                Add your home, work, or favorite locations to make ordering faster and easier.
              </p>
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="shadow-xl hover:shadow-2xl transition-all"
              >
                <Plus className="h-6 w-6 mr-3" />
                Add Your First Address
              </Button>
            </motion.div>
          )}
        </main>

        {/* Address Form Modal */}
        <AddressFormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          address={editingAddress}
        />
      </div>
    </>
  );
}