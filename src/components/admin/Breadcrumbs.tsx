// src/components/admin/Breadcrumbs.tsx
// FINAL RESPONSIVE PRODUCTION COMPONENT — JANUARY 14, 2026
// Mobile-first breadcrumbs with truncation, icons, dark mode support

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import clsx from 'clsx';

interface BreadcrumbItem {
  label: string;
  path?: string;       // undefined = current page (non-clickable)
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]; // optional — auto-generates if empty
  className?: string;
}

export default function Breadcrumbs({ items = [], className }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs if none provided
  const fullItems: BreadcrumbItem[] = items.length > 0
    ? items
    : [
        { label: 'Dashboard', path: '/admin', icon: Home },
        { label: getPageTitle(location.pathname) },
      ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'flex items-center flex-wrap gap-1.5 sm:gap-2 text-sm md:text-base',
        'py-3 px-4 sm:px-6 lg:px-8 bg-card border-b border-border',
        className
      )}
    >
      {fullItems.map((item, index) => {
        const isLast = index === fullItems.length - 1;
        const isClickable = !!item.path && !isLast;

        return (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Separator */}
            {index > 0 && (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            )}

            {/* Link or current page */}
            {isClickable ? (
              <Link
                to={item.path!}
                className={clsx(
                  'flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors',
                  'max-w-[160px] sm:max-w-none truncate'
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </Link>
            ) : (
              <span
                className={clsx(
                  'flex items-center gap-1.5 sm:gap-2 text-foreground font-medium',
                  'max-w-[200px] sm:max-w-none truncate'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Helper: auto-detect page title (same logic as AdminLayout)
function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/riders')) {
    if (pathname === '/admin/riders') return 'All Riders';
    if (pathname.includes('/blocked')) return 'Blocked Riders';
    if (pathname.includes('/permanently-banned')) return 'Permanently Banned';
    if (pathname.includes('/assign')) return 'Force Assign Orders';
    if (pathname.includes('/promote')) return 'Promote to Rider';
    return 'Rider Details';
  }

  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/orders')) return 'Orders';

  return 'Admin Panel';
}