"use client"

import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

type Task = {
  id: number
  title: string
  status: "done" | "in-progress" | "waiting"
}

type ProgressChecklistProps = {
  tasks: Task[]
}

export function ProgressChecklist({ tasks }: ProgressChecklistProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
      case "in-progress":
        return <Loader2 className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-spin" />
      case "waiting":
        return <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "done":
        return "Done"
      case "in-progress":
        return "In Progress"
      case "waiting":
        return "Waiting"
      default:
        return "Unknown"
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "in-progress":
        return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
      case "waiting":
        return "text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-[#2d2d44]"
      default:
        return "text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-[#2d2d44]"
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 dark:text-white">Progress Checklist</h4>
      <motion.ul className="space-y-3" variants={container} initial="hidden" animate="show">
        {tasks.map((task) => (
          <motion.li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-[#2d2d44] p-3 bg-white dark:bg-[#1a1a2e] hover:shadow-md transition-shadow duration-200"
            variants={item}
          >
            <div className="mt-0.5">{getStatusIcon(task.status)}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(task.status)}`}
              >
                {getStatusText(task.status)}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
