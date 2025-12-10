import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryStore } from '../store/deliveryStore';
import { DeliveryChecker } from './DeliveryChecker';

export const DeliveryCheckerModal = () => {
  const { showModal, setShowModal, hasChecked, isInService } = useDeliveryStore();

  // Show modal on first visit if no area selected
  useEffect(() => {
    const hasVisited = localStorage.getItem('zaika-has-visited');
    if (!hasVisited && !hasChecked) {
      setShowModal(true);
      localStorage.setItem('zaika-has-visited', 'true');
    }
  }, [hasChecked, setShowModal]);

  const handleSuccess = () => {
    if (isInService) {
      setTimeout(() => setShowModal(false), 1500);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={() => setShowModal(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Header graphic */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-t-3xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Where should we deliver?
              </h2>
              <p className="text-white/80 mt-2">
                Enter your location to see if we deliver to your area
              </p>
            </div>

            {/* Checker form */}
            <div className="bg-background rounded-b-3xl">
              <DeliveryChecker onSuccess={handleSuccess} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
