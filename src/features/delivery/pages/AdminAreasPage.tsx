import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { AdminAreaList } from '../components/AdminAreaList';
import { AdminAreaForm } from '../components/AdminAreaForm';
import { Area } from '../types/area.types';

export const AdminAreasPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);

  const handleEdit = (area: Area) => {
    setEditArea(area);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditArea(null);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditArea(null);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Delivery Areas</h1>
            <p className="text-muted-foreground">Manage delivery coverage zones</p>
          </div>
        </div>

        <AdminAreaList onEdit={handleEdit} onCreate={handleCreate} />
        <AdminAreaForm open={formOpen} onClose={handleClose} editArea={editArea} />
      </div>
    </div>
  );
};
