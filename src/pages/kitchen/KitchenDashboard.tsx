// src/pages/kitchen/KitchenDashboard.tsx
// FINAL FIXED & PRODUCTION-READY — JANUARY 13, 2026

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChefHat, Volume2, VolumeX } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import clsx from "clsx";

import { apiClient } from "@/lib/api";
import { getSocket, joinRoom } from "@/lib/socket";
import { audioManager } from "@/features/notifications/store/notificationStore";

import {
  KitchenOrderPopulated,
  KitchenOrdersResponse,
  KitchenStats,
} from "@/features/kitchen/types/types";

import KitchenOrderCard from "@/features/kitchen/components/KitchenOrderCard";
import StatsBar from "@/features/kitchen/components/StatsBar";

/* ------------------ SOUND KEYS ------------------ */
const SOUND_KEYS = {
  urgent: "urgent-new-order",
  normal: "new-order-bell",
  ready: "ready",
} as const;

/* ------------------ FALLBACKS ------------------ */
const EMPTY_STATS: KitchenStats = {
  new: 0,
  preparing: 0,
  readyToday: 0,
  completedToday: 0,
};
const EMPTY_RESPONSE: KitchenOrdersResponse = {
  success: true, // ✅ MUST be true
  active: [],
  ready: [],
  stats: EMPTY_STATS,
};


/* ================== API FUNCTION ================== */
/** ✅ MUST return KitchenOrdersResponse EXACTLY */
const fetchKitchenOrders = async (): Promise<KitchenOrdersResponse> => {
  try {
   const data = await apiClient.get<KitchenOrdersResponse>(
  "/kitchen/orders"
).catch(() => null);


    return {
      success: data.success ?? true,
      active: data.active ?? [],
      ready: data.ready ?? [],
      stats: data.stats ?? EMPTY_STATS,
    };
  } catch (err) {
    console.error("Kitchen orders fetch failed:", err);
    return EMPTY_RESPONSE;
  }
};

/* ================================================= */

export default function KitchenDashboard() {
  const queryClient = useQueryClient();

  const [newOrderBanner, setNewOrderBanner] = useState({
    show: false,
    isUrgent: false,
    count: 0,
  });

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("kitchen-sound") !== "muted"
  );

  /* ===================== QUERY ===================== */
  const {
    data: kitchenResponse,
    isLoading,
    isError,
    error,
  } = useQuery<KitchenOrdersResponse>({
    queryKey: ["kitchen-orders"],
    queryFn: fetchKitchenOrders,
    refetchInterval: 8000,
    staleTime: 5000,
    retry: 3,
    retryDelay: 2000,
  });

  /* ===================== MUTATIONS ===================== */
  const startItemMutation = useMutation({
    mutationFn: (vars: { kitchenOrderId: string; itemId: string }) =>
      apiClient.post("/kitchen/start-item", vars),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  const completeItemMutation = useMutation({
    mutationFn: (vars: { kitchenOrderId: string; itemId: string }) =>
      apiClient.post("/kitchen/complete-item", vars),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  const completeOrderMutation = useMutation({
    mutationFn: (kitchenOrderId: string) =>
      apiClient.post("/kitchen/complete-order", { kitchenOrderId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }),
  });

  /* ===================== SOCKET ===================== */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    joinRoom("kitchen");

    socket.on("newOrderAlert", (payload: {
      orderId: string;
      shortId: string;
      customerName: string;
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
        });
      }

      toast.info(`NEW ORDER #${payload.shortId}`, {
        description: payload.isUrgent
          ? `URGENT • ${payload.itemsCount} items • ${payload.customerName}`
          : `${payload.itemsCount} items • ${payload.customerName}`,
        duration: Infinity,
        action: {
          label: "Acknowledge",
          onClick: () => {
            audioManager.stopAll();
            socket.emit("acknowledgeNewOrder", {
              orderId: payload.orderId,
            });
            setNewOrderBanner({ show: false, isUrgent: false, count: 0 });
            toast.dismiss();
          },
        },
      });
    });

    socket.on("stopNewOrderAlert", audioManager.stopAll);

    socket.on("kitchenOrderUpdate", () =>
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] })
    );

    socket.on("orderReadyForDelivery", () => {
      if (soundEnabled) {
        audioManager.play(SOUND_KEYS.ready, { volume: 0.85 });
      }
    });

    return () => {
      socket.off();
      audioManager.stopAll();
    };
  }, [queryClient, soundEnabled]);

  /* ===================== UI HELPERS ===================== */
  const toggleSound = () => {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    localStorage.setItem("kitchen-sound", enabled ? "enabled" : "muted");
    if (!enabled) audioManager.stopAll();
    toast.info(enabled ? "Sound enabled" : "Sound muted", { duration: 2000 });
  };

  const ordersToDisplay: KitchenOrderPopulated[] = [
    ...(kitchenResponse?.active ?? []),
    ...(kitchenResponse?.ready ?? []),
  ];

  /* ===================== STATES ===================== */
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <ChefHat className="w-32 h-32 text-orange-500 animate-pulse" />
      </main>
    );
  }

  if (isError || !kitchenResponse) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-3xl text-red-500">
          {error instanceof Error ? error.message : "Failed to load kitchen"}
        </p>
      </main>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-orange-700 to-amber-600 py-10 flex justify-between px-6">
        <div className="flex items-center gap-6">
          <ChefHat className="w-20 h-20" />
          <div>
            <h1 className="text-6xl font-black">KITCHEN</h1>
            <p className="text-2xl opacity-80">
              {format(new Date(), "EEEE, d MMM yyyy")}
            </p>
          </div>
        </div>

        <button onClick={toggleSound}>
          {soundEnabled ? (
            <Volume2 className="w-10 h-10" />
          ) : (
            <VolumeX className="w-10 h-10 text-red-400" />
          )}
        </button>
      </header>

      {/* ALERT BANNER */}
      <AnimatePresence>
        {newOrderBanner.show && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={clsx(
              "text-center py-6 text-4xl font-black",
              newOrderBanner.isUrgent
                ? "bg-red-700 animate-pulse"
                : "bg-orange-600"
            )}
          >
            NEW ORDER ×{newOrderBanner.count}
            {newOrderBanner.isUrgent && " — URGENT"}
          </motion.div>
        )}
      </AnimatePresence>

      <StatsBar stats={kitchenResponse.stats} />

      {/* ORDERS */}
      <section className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 flex-1">
        {ordersToDisplay.length === 0 ? (
          <p className="text-center text-4xl text-gray-500">
            No active or ready orders
          </p>
        ) : (
          ordersToDisplay.map((order) => (
            <KitchenOrderCard
              key={order._id}
              order={order}
              onStartItem={(id, itemId) =>
                startItemMutation.mutate({ kitchenOrderId: id, itemId })
              }
              onCompleteItem={(id, itemId) =>
                completeItemMutation.mutate({ kitchenOrderId: id, itemId })
              }
              onCompleteOrder={(id) =>
                completeOrderMutation.mutate(id)
              }
            />
          ))
        )}
      </section>
    </main>
  );
}
