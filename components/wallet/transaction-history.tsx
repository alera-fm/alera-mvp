"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ExternalLink, ArrowDownLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Transaction {
  date: string;
  type: string;
  source: string;
  amount: number;
  status: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  withdrawals?: any[];
}

export function TransactionHistory({
  transactions,
  withdrawals,
}: TransactionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[18px] md:text-[24px] text-[#333] dark:text-white">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4 text-[#333] dark:text-white">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {transaction.type}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            {transaction.source}
                          </span>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#333] dark:text-white">
                        ${Number(transaction.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`${getStatusColor(transaction.status)} border-0`}
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#333] dark:text-white">
                      {transaction.type}
                    </span>
                    <Badge
                      className={`${getStatusColor(transaction.status)} border-0`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="text-[#333] dark:text-white">
                        {transaction.type === "Streaming" ||
                        transaction.type === "Tips" ||
                        transaction.type === "Merch" ||
                        transaction.type === "Subscriptions"
                          ? new Date(transaction.date).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long" },
                            )
                          : new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Source:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#333] dark:text-white">
                          {transaction.source}
                        </span>
                        {transaction.type !== "Streaming" &&
                          transaction.type !== "Tips" &&
                          transaction.type !== "Merch" &&
                          transaction.type !== "Subscriptions" && (
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Amount:
                      </span>
                      <span className="font-semibold text-[#333] dark:text-white">
                        ${Number(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
