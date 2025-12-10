import { useState } from 'react';
import { Search, Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { Area } from '../types/delivery.types';
import { cn } from '@/lib/utils';

interface AreaSidebarProps {
  areas: Area[];
  isLoading: boolean;
  selectedAreaId: string | null;
  onSelectArea: (area: Area) => void;
  onAddNew: () => void;
}

export const AreaSidebar = ({
  areas,
  isLoading,
  selectedAreaId,
  onSelectArea,
  onAddNew,
}: AreaSidebarProps) => {
  const [search, setSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(search.toLowerCase()) ||
    area.city.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = areas.filter((a) => a.isActive).length;
  const inactiveCount = areas.filter((a) => !a.isActive).length;

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 56 : 320 }}
      className="h-full bg-card border-r border-border flex flex-col relative"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Delivery Areas</h2>
                    <p className="text-xs text-muted-foreground">
                      {activeCount} active · {inactiveCount} inactive
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search areas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Add New Button */}
            <div className="p-4 border-b border-border">
              <Button onClick={onAddNew} className="w-full gap-2" size="lg">
                <Plus className="w-4 h-4" />
                Add New Area
              </Button>
            </div>

            {/* Area List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                ) : filteredAreas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No areas found</p>
                  </div>
                ) : (
                  filteredAreas.map((area) => (
                    <motion.button
                      key={area._id}
                      onClick={() => onSelectArea(area)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        selectedAreaId === area._id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{area.name}</p>
                          <p className="text-sm text-muted-foreground">{area.city}</p>
                        </div>
                        <Badge
                          variant={area.isActive ? 'default' : 'secondary'}
                          className={cn(
                            'shrink-0',
                            area.isActive 
                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                              : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          )}
                        >
                          {area.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-4"
          >
            <button
              onClick={onAddNew}
              className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="w-8 h-px bg-border" />
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col items-center gap-2 px-2">
                {filteredAreas.slice(0, 10).map((area) => (
                  <button
                    key={area._id}
                    onClick={() => onSelectArea(area)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors',
                      selectedAreaId === area._id
                        ? 'bg-primary text-primary-foreground'
                        : area.isActive
                        ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    title={area.name}
                  >
                    {area.name.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
