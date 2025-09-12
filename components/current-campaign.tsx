"use client"

import { motion } from "framer-motion"
import { Clock, Music } from "lucide-react"

// Task status types
type TaskStatus = "Done" | "On Progress" | "Waiting"

// Task data
const tasks = [
  { id: 1, name: "Platforms Distributions", status: "Done" as TaskStatus },
  { id: 2, name: "Assets Managmend", status: "Done" as TaskStatus },
  { id: 3, name: "DSP Credits Managemtns", status: "Done" as TaskStatus },
  { id: 4, name: "Campaign Links", status: "On Progress" as TaskStatus },
  { id: 5, name: "Playlist Pitching", status: "Waiting" as TaskStatus },
  { id: 6, name: "TikTok Music Integration", status: "Waiting" as TaskStatus },
  { id: 7, name: "Social Media Campaign", status: "Waiting" as TaskStatus },
]

// Progress bars data - first 10 are completed (red/orange), rest are incomplete (gray)
const progressBars = Array(40)
  .fill(null)
  .map((_, i) => ({
    completed: i < 10,
    color: i < 5 ? "#FF5757" : i < 10 ? "#FF8C42" : "#E5E5E5",
  }))

export function CurrentCampaign() {
  // Function to get badge color based on status
  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "Done":
        return "bg-[#BFFF00] text-black"
      case "On Progress":
        return "bg-orange-400 text-white"
      case "Waiting":
        return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#333] dark:text-white">Single Song</h3>
          <p className="text-sm text-[#666] dark:text-gray-400">Currently distribution to platforms</p>
        </div>

        <div className="flex items-center gap-2 text-orange-500">
          <Clock className="h-5 w-5" />
          <span className="text-xl font-bold">01:21:32</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Music className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-[#555] dark:text-gray-300">Album Name/ EP Title</span>
      </div>

      {/* Progress bars visualization */}
      <div className="flex items-end gap-[2px] h-12 mb-6">
        {progressBars.map((bar, index) => (
          <motion.div
            key={index}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: bar.color,
              height: `${Math.random() * 60 + 40}%`,
              opacity: bar.completed ? 1 : index < 20 ? 0.7 : 0.5,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 60 + 40}%` }}
            transition={{ duration: 0.5, delay: index * 0.01 }}
          />
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 dark:text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#555] dark:text-gray-300">{task.name}</span>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadgeClass(task.status)}`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
