'use client';

import { motion } from 'framer-motion';

import { Skeleton } from '@/shared/components/base/skeleton';

export function ShopLoadingShell() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto min-h-[calc(100vh-200px)] px-4 py-8"
    >
      {/* Skeleton Breadcrumb/Header */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <span className="text-neutral-300">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Main Content Area Skeleton */}
        <div className="lg:col-span-8">
          <Skeleton className="mb-8 h-10 w-64" />
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>

        {/* Sidebar/Summary Skeleton */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-neutral-100 p-6 dark:border-neutral-800">
            <Skeleton className="mb-6 h-6 w-32" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
            <Skeleton className="mt-8 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
