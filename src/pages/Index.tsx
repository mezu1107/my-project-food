import { useState, useEffect } from "react";
import ServiceAreaModal from "@/components/ServiceAreaModal"; // default import
import Home from "./Home";
import { useStore } from "@/lib/store";

const Index = () => {
  const [showAreaModal, setShowAreaModal] = useState(false);
  const selectedArea = useStore((state) => state.selectedArea);

  useEffect(() => {
    if (!selectedArea) {
      setShowAreaModal(true);
    }
  }, [selectedArea]);

  return (
    <>
      <ServiceAreaModal
        isOpen={showAreaModal}
        onClose={() => setShowAreaModal(false)}
      />
      <Home openAreaChecker={() => setShowAreaModal(true)} />
    </>
  );
};

export default Index;
