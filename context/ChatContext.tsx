"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isUnread?: boolean
  kind?: 'chat' | 'notification'
  intent_classified?: string
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [unread, setUnread] = useState(0)
  const loadingRef = useRef(false)

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
      if (!token || hasLoadedHistory || loadingRef.current) return
      
      loadingRef.current = true
      setIsLoadingHistory(true)

      console.log('[ChatContext] Loading chat history...')

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
          kind: (msg.message_kind === 'notification' ? 'notification' : 'chat'),
          intent_classified: msg.intent_classified
        }))

        console.log('[ChatContext] Loaded', historyMessages.length, 'messages')
        console.log('[ChatContext] Message data sample:', historyMessages.map(msg => ({
          id: msg.id,
          isUser: msg.isUser,
          intent_classified: msg.intent_classified,
          text: msg.text.substring(0, 30) + '...'
        })))
        setMessages(historyMessages)
        setHasLoadedHistory(true)

        // Update unread count immediately based on loaded messages
        const unreadCount = historyMessages.filter(msg => msg.isUnread).length
        console.log('[ChatContext] Setting unread count to:', unreadCount)
        setUnread(unreadCount)

        // Check if there are onboarding messages and if onboarding is incomplete
        const onboardingMessages = historyMessages.filter((msg: any) => 
          !msg.isUser && msg.intent_classified === 'onboarding'
        )

        console.log('[ChatContext] Total onboarding messages found:', onboardingMessages.length)

        if (onboardingMessages.length > 0) {
          console.log('[ChatContext] Onboarding messages detected:', onboardingMessages.length)
          // Check if last message is from AI and suggests onboarding is incomplete
          const lastMessage = historyMessages[historyMessages.length - 1]
          console.log('[ChatContext] Last message:', {
            isUser: lastMessage.isUser,
            intent: lastMessage.intent_classified,
            text: lastMessage.text.substring(0, 50) + '...'
          })
          
          // Check if onboarding is completed by looking for the completion message
          const hasCompletionMessage = historyMessages.some((msg: any) => 
            !msg.isUser && msg.text.includes('What can I help you with today?')
          )
          
          const isIncompleteOnboarding = !hasCompletionMessage && onboardingMessages.length > 0
          
          console.log('[ChatContext] Has completion message:', hasCompletionMessage)
          console.log('[ChatContext] Is incomplete onboarding:', isIncompleteOnboarding)
          
          if (isIncompleteOnboarding) {
            console.log('[ChatContext] Setting onboarding state to TRUE')
            setIsOnboarding(true)
          } else {
            console.log('[ChatContext] Setting onboarding state to FALSE')
            setIsOnboarding(false)
          }
        }

        // If no chat history, trigger onboarding and load messages
        if (historyMessages.length === 0) {
          console.log('[ChatContext] No history found, triggering onboarding...')
          
          try {
            // Trigger onboarding via API
            const triggerResponse = await fetch('/api/ai-agent/trigger-onboarding', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (triggerResponse.ok) {
              const triggerData = await triggerResponse.json()
              console.log('[ChatContext] Onboarding trigger result:', triggerData)
              
              // If onboarding was triggered, reload chat history to get the welcome message
              if (triggerData.triggered) {
                console.log('[ChatContext] Reloading history after onboarding trigger...')
                const reloadResponse = await fetch('/api/ai-agent/chat-history', {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                
                if (reloadResponse.ok) {
                  const reloadData = await reloadResponse.json()
                  const reloadMessages = reloadData.messages.map((msg: any) => ({
                    id: msg.id.toString(),
                    text: msg.message_text,
                    isUser: msg.is_user_message,
                    timestamp: new Date(msg.created_at),
                    isUnread: Boolean(msg.is_unread),
                    kind: (msg.message_kind === 'notification' ? 'notification' : 'chat'),
                    intent_classified: msg.intent_classified
                  }))
                  
                  console.log('[ChatContext] Reloaded', reloadMessages.length, 'messages after trigger')
                  setMessages(reloadMessages)
                  setIsOnboarding(true)
                  
                  // Update unread count immediately after reload
                  const unreadCount = reloadMessages.filter(msg => msg.isUnread).length
                  console.log('[ChatContext] Setting unread count after reload to:', unreadCount)
                  setUnread(unreadCount)
                }
              } else {
                console.log('[ChatContext] Onboarding not triggered (already exists)')
              }
            } else {
              console.log('[ChatContext] Onboarding trigger failed, showing local message')
              // Fallback to local message if API fails
              const firstOnboarding = `Welcome to ALERA! To get started, I'd love to understand a bit about you so I can give you the best advice.\n\nFirst, what are your main goals right now? (For example: growing your audience, earning more, or getting on playlists?)`
              setMessages([{ id: 'onboarding-start', text: firstOnboarding, isUser: false, timestamp: new Date() }])
              setIsOnboarding(true)
            }
          } catch (triggerError) {
            console.error('[ChatContext] Error triggering onboarding:', triggerError)
            // Fallback to local message
            const firstOnboarding = `Welcome to ALERA! To get started, I'd love to understand a bit about you so I can give you the best advice.\n\nFirst, what are your main goals right now? (For example: growing your audience, earning more, or getting on playlists?)`
            setMessages([{ id: 'onboarding-start', text: firstOnboarding, isUser: false, timestamp: new Date() }])
            setIsOnboarding(true)
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setHasLoadedHistory(true)
    } finally {
      loadingRef.current = false
      setIsLoadingHistory(false)
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
        timer = setTimeout(tick, 10000)
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