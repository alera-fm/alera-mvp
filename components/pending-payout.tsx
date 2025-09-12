"use client"

import { motion } from "framer-motion"

export function PendingPayout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-3 px-2 text-sm font-medium text-[#555] dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-[#555] dark:text-gray-400">Method</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-[#555] dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-[#555] dark:text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">May 15, 2025</td>
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">Bank Transfer</td>
              <td className="py-3 px-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </span>
              </td>
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">$1,234.56</td>
            </tr>
            <tr>
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">June 15, 2025</td>
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">PayPal</td>
              <td className="py-3 px-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Processing
                </span>
              </td>
              <td className="py-3 px-2 text-sm text-[#333] dark:text-white">$2,345.67</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
