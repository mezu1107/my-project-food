import { useState, useCallback, useEffect } from 'react';
import { LeafletMap } from '../components/LeafletMap';
import { AreaSidebar } from '../components/AreaSidebar';
import { AreaFormModal } from '../components/AreaFormModal';
import { DeliveryCheckPanel } from '../components/DeliveryCheckPanel';
import { useAdminAreasQuery } from '../hooks/useAdminAreasApi';
import type { Area } from '../types/delivery.types';

export default function AdminAreasMapPage() {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: areas = [], isLoading } = useAdminAreasQuery();

  const handleAreaClick = useCallback((area: Area) => {
    setSelectedArea(area);
    setEditArea(area);
    setIsFormOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditArea(null);
    setIsFormOpen(true);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditArea(null);
    setSelectedArea(null);
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'Delivery Areas Management | Zaika Express Admin';
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
        {/* Sidebar */}
        <AreaSidebar
          areas={areas}
          isLoading={isLoading}
          selectedAreaId={selectedArea?._id ?? null}
          onSelectArea={handleAreaClick}
          onAddNew={handleAddNew}
        />

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <LeafletMap
            areas={areas}
            selectedAreaId={selectedArea?._id ?? null}
            onAreaClick={handleAreaClick}
            onMapClick={handleMapClick}
            enableDraw={false}
          />

          {/* Floating Delivery Check Panel */}
          <div className="absolute bottom-4 right-4 z-[1000]">
            <DeliveryCheckPanel clickedCoords={clickedCoords} />
          </div>

          {/* Map Legend */}
          <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
            <h4 className="font-medium text-sm mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm bg-green-500/30 border-2 border-green-500" />
                <span>Active Delivery Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm border-2 border-destructive border-dashed" />
                <span>Inactive Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-sm bg-blue-500/30 border-2 border-blue-500" />
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>

      {/* Area Form Modal */}
      <AreaFormModal
        open={isFormOpen}
        onClose={handleCloseForm}
        editArea={editArea}
      />
    </div>
  );
}
