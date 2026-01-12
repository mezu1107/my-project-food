// src/pages/kitchen/KitchenDashboard.tsx
// FINAL FIXED & PRODUCTION-READY — JANUARY 12, 2026

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChefHat, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import clsx from "clsx"; // For cn utility (make sure it's installed: npm i clsx)

import { apiClient } from "@/lib/api";
import { getSocket, joinRoom } from "@/lib/socket"; // ← Make sure this file exports both
import { audioManager } from "@/features/notifications/store/notificationStore";

import {
  KitchenOrderPopulated,
  KitchenOrdersResponse,
} from "@/features/kitchen/types/types";

import KitchenOrderCard from "@/features/kitchen/components/KitchenOrderCard";
import StatsBar from "@/features/kitchen/components/StatsBar";

// Define sound keys that actually exist in your SOUND_MAP
const SOUND_KEYS = {
  urgent: "urgent-new-order",
  normal: "new-order-bell",
  ready: "ready", // Make sure this exists in your AudioManager SOUND_MAP!
} as const;

export default function KitchenDashboard() {
  const queryClient = useQueryClient();

  const [newOrderBanner, setNewOrderBanner] = useState<{
    show: boolean;
    isUrgent: boolean;
    count: number;
  }>({ show: false, isUrgent: false, count: 0 });

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("kitchen-sound") !== "muted"
  );

  // Query for kitchen orders
  const { data: kitchenResponse, isLoading, isError } = useQuery<KitchenOrdersResponse>({
    queryKey: ["kitchen-orders"],
    queryFn: async () => {
      const res = await apiClient.get("/kitchen/orders");
      return res.data; // ← FIXED: axios returns data in .data
    },
    refetchInterval: 8000,
    staleTime: 5000,
  });

  const startItemMutation = useMutation({
    mutationFn: async (vars: { kitchenOrderId: string; itemId: string }) => {
      await apiClient.post("/kitchen/start-item", vars);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  const completeItemMutation = useMutation({
    mutationFn: async (vars: { kitchenOrderId: string; itemId: string }) => {
      await apiClient.post("/kitchen/complete-item", vars);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  const completeOrderMutation = useMutation({
    mutationFn: async (kitchenOrderId: string) => {
      await apiClient.post("/kitchen/complete-order", { kitchenOrderId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    joinRoom("kitchen");

    socket.on("newOrderAlert", (payload: {
      orderId: string;
      shortId: string;
      customerName: string;
      total: number;
      itemsCount: number;
      isUrgent: boolean;
    }) => {
      setNewOrderBanner((prev) => ({
        show: true,
        isUrgent: payload.isUrgent,
        count: prev.count + 1,
      }));

      if (soundEnabled) {
        audioManager.play(
          payload.isUrgent ? SOUND_KEYS.urgent : SOUND_KEYS.normal,
          { loop: true, volume: payload.isUrgent ? 0.95 : 0.8 }
        );
      }

      if (payload.isUrgent) {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#ff0000", "#ff4444", "#ff7777"],
        });
      }

      toast.info(`NEW ORDER #${payload.shortId}!`, {
        description: payload.isUrgent
          ? `URGENT! ${payload.itemsCount} items • ${payload.customerName}`
          : `${payload.itemsCount} items • ${payload.customerName}`,
        duration: Infinity,
        style: {
          background: payload.isUrgent ? "#b91c1c" : "#c2410c",
          color: "white",
          fontSize: "1.3rem",
          padding: "1.5rem 2rem",
          borderRadius: "1rem",
        },
        action: {
          label: "Acknowledge",
          onClick: () => {
            audioManager.stopAll();
            socket.emit("acknowledgeNewOrder", { orderId: payload.orderId });
            setNewOrderBanner({ show: false, isUrgent: false, count: 0 });
            toast.dismiss();
          },
        },
      });
    });

    socket.on("stopNewOrderAlert", () => {
      audioManager.stopAll();
    });

    socket.on("kitchenOrderUpdate", () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    });

    socket.on("kitchenStatsUpdate", () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    });

    socket.on("orderReadyForDelivery", () => {
      if (soundEnabled && SOUND_KEYS.ready) {
        audioManager.play(SOUND_KEYS.ready, { volume: 0.85 });
      }
    });

    return () => {
      socket.off("newOrderAlert");
      socket.off("stopNewOrderAlert");
      socket.off("kitchenOrderUpdate");
      socket.off("kitchenStatsUpdate");
      socket.off("orderReadyForDelivery");
      audioManager.stopAll();
    };
  }, [queryClient, soundEnabled]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem("kitchen-sound", newState ? "enabled" : "muted");
    if (!newState) audioManager.stopAll();
    toast.info(newState ? "Sound enabled" : "Sound muted", { duration: 2000 });
  };

  const ordersToDisplay = [
    ...(kitchenResponse?.active ?? []),
    ...(kitchenResponse?.ready ?? []),
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-10 px-4">
        <ChefHat className="w-32 h-32 md:w-48 md:h-48 text-orange-500 animate-pulse" />
        <p className="text-4xl md:text-6xl font-black text-gray-300 text-center">
          Loading Kitchen...
        </p>
      </main>
    );
  }

  if (isError || !kitchenResponse) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-32 h-32 text-red-600 mx-auto mb-8" />
          <p className="text-5xl font-black text-red-500">Connection Error</p>
          <p className="text-2xl text-gray-400 mt-4">
            Please check network or contact tech support
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 py-8 md:py-12 shadow-2xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <ChefHat className="w-20 h-20 md:w-28 md:h-28 text-white animate-pulse" />
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight">KITCHEN</h1>
              <p className="text-2xl md:text-3xl opacity-90 mt-2">
                {format(new Date(), "EEEE, d MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={soundEnabled ? "Mute alerts" : "Enable alerts"}
          >
            {soundEnabled ? (
              <Volume2 className="w-10 h-10" />
            ) : (
              <VolumeX className="w-10 h-10 text-red-400" />
            )}
          </button>
        </div>
      </header>

      {/* New Order Alert Banner */}
      <AnimatePresence>
        {newOrderBanner.show && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={clsx(
              "sticky top-0 z-50 py-6 text-center text-3xl md:text-5xl font-black shadow-2xl",
              newOrderBanner.isUrgent
                ? "bg-gradient-to-r from-red-700 to-rose-800 text-white animate-pulse"
                : "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            )}
          >
            <div className="container mx-auto px-6 flex items-center justify-center gap-8">
              <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 animate-bounce" />
              <div>
                NEW ORDER ALERT! ×{newOrderBanner.count}
                {newOrderBanner.isUrgent && (
                  <span className="ml-4 text-yellow-300 font-extrabold"> URGENT!</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <StatsBar stats={kitchenResponse.stats} />

      {/* Main Orders Grid */}
      <section className="container mx-auto px-4 py-12 lg:py-16 flex-1">
        {ordersToDisplay.length === 0 ? (
          <div className="text-center py-32">
            <div className="bg-gray-900/70 backdrop-blur-lg rounded-3xl p-16 inline-block max-w-4xl mx-auto border border-gray-700">
              <ChefHat className="w-40 h-40 mx-auto text-gray-600 mb-10" />
              <h2 className="text-6xl md:text-8xl font-black text-gray-400">
                All Caught Up!
              </h2>
              <p className="text-4xl md:text-5xl mt-8 text-gray-500">
                No active or ready orders right now
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-12">
            {ordersToDisplay.map((order) => (
              <KitchenOrderCard
                key={order._id}
                order={order}
                onStartItem={(kitchenOrderId, itemId) =>
                  startItemMutation.mutate({ kitchenOrderId, itemId })
                }
                onCompleteItem={(kitchenOrderId, itemId) =>
                  completeItemMutation.mutate({ kitchenOrderId, itemId })
                }
                onCompleteOrder={(kitchenOrderId) =>
                  completeOrderMutation.mutate(kitchenOrderId)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-xl md:text-2xl bg-gray-900/80 border-t border-gray-800">
        Real-time • Last update: {format(new Date(), "h:mm:ss a")}
      </footer>
    </main>
  );
}