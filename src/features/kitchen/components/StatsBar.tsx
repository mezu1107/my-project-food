// src/components/StatsBar.tsx

import { KitchenStats } from '../types/types';
import { Package, Clock, CheckCircle, Archive } from 'lucide-react';

interface Props {
  stats: KitchenStats;
}

export default function StatsBar({ stats }: Props) {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">

        {/* New Orders */}
        <StatCard
          color="bg-orange-600"
          label="New"
          value={stats.new}
          Icon={Package}
        />

        {/* Preparing */}
        <StatCard
          color="bg-blue-600"
          label="Preparing"
          value={stats.preparing}
          Icon={Clock}
        />

        {/* Ready Today */}
        <StatCard
          color="bg-green-600"
          label="Ready"
          value={stats.readyToday}
          Icon={CheckCircle}
        />

        {/* Completed Today */}
        <StatCard
          color="bg-purple-600"
          label="Completed"
          value={stats.completedToday}
          Icon={Archive}
        />

      </div>
    </div>
  );
}

/* ==================== */
/* Reusable Card */
/* ==================== */

interface StatCardProps {
  color: string;
  label: string;
  value: number;
  Icon: React.ElementType;
}

function StatCard({ color, label, value, Icon }: StatCardProps) {
  return (
    <div
      className={`${color} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 text-center shadow-xl lg:shadow-2xl`}
    >
      <Icon
        className="
          mx-auto mb-3 sm:mb-4 md:mb-6
          w-10 h-10
          sm:w-12 sm:h-12
          md:w-16 md:h-16
          lg:w-20 lg:h-20
        "
      />

      <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl">
        {label}
      </div>

      <div
        className="
          mt-2 sm:mt-3 md:mt-4
          font-black
          text-3xl
          sm:text-4xl
          md:text-5xl
          lg:text-6xl
          xl:text-7xl
        "
      >
        {value}
      </div>
    </div>
  );
}
