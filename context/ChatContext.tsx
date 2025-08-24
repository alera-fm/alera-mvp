"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isUnread?: boolean
  kind?: 'chat' | 'notification'
}

interface ChatContextType {
  isOpen: boolean
  messages: Message[]
  inputValue: string
  isLoading: boolean
  isOnboarding: boolean
  unread: number
  setIsOpen: (open: boolean) => void
  setMessages: (messages: Message[]) => void
  setInputValue: (value: string) => void
  setIsLoading: (loading: boolean) => void
  setIsOnboarding: (onboarding: boolean) => void
  addMessage: (message: Message) => void
  clearMessages: () => void
  loadChatHistory: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
  const [unread, setUnread] = useState(0)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const loadChatHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token || hasLoadedHistory) return

      const response = await fetch('/api/ai-agent/chat-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const historyMessages = data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.message_text,
          isUser: msg.is_user_message,
          timestamp: new Date(msg.created_at),
          isUnread: Boolean(msg.is_unread),
          kind: (msg.message_kind === 'notification' ? 'notification' : 'chat')
        }))

        setMessages(historyMessages)
        setHasLoadedHistory(true)

        // If no chat history, show the exact first onboarding message locally (no API call)
        if (historyMessages.length === 0) {
          const firstOnboarding = `Welcome to ALERA! To get started, I'd love to understand a bit about you so I can give you the best advice.\n\nFirst, what are your main goals right now? (For example: growing your audience, earning more, or getting on playlists?)`
          setMessages([{ id: 'onboarding-start', text: firstOnboarding, isUser: false, timestamp: new Date() }])
          setIsOnboarding(true)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setHasLoadedHistory(true)
    }
  }, [hasLoadedHistory])

  // Fetch unread count periodically
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    let timer: any
    const tick = async () => {
      try {
        const res = await fetch('/api/ai-agent/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnread(data.unread || 0)
        }
      } catch {}
      finally {
        timer = setTimeout(tick, 30000)
      }
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  // Mark notifications as read when chat opens
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    if (isOpen && unread > 0) {
      fetch('/api/ai-agent/notifications/mark-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => setUnread(0)).catch(() => {})
    }
  }, [isOpen])

  const value = {
    isOpen,
    messages,
    inputValue,
    isLoading,
    isOnboarding,
    unread,
    setIsOpen,
    setMessages,
    setInputValue,
    setIsLoading,
    setIsOnboarding,
    addMessage,
    clearMessages,
    loadChatHistory
  }

  // Don't render context until client-side
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    // Return a default context instead of throwing error
    return {
      isOpen: false,
      messages: [],
      inputValue: "",
      isLoading: false,
      isOnboarding: false,
      unread: 0,
      setIsOpen: () => {},
      setMessages: () => {},
      setInputValue: () => {},
      setIsLoading: () => {},
      setIsOnboarding: () => {},
      addMessage: () => {},
      clearMessages: () => {},
      loadChatHistory: async () => {}
    }
  }
  return context
} 