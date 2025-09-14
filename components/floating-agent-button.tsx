"use client"

import { useRef, useEffect, useState } from "react"
import { MessageSquareText, X, Send, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"

const SUGGESTED_PROMPTS = [
  "How much did I make this month?",
  "Which song performed best last week?",
  "Where are most of my fans?",
  "When was my last payout?",
  "What's my total streaming revenue?",
  "Show me my top performing countries"
]

export function FloatingAgentButton() {
  const [isClient, setIsClient] = useState(false)
  const { isAuthenticated } = useAuth()
  const { 
    isOpen, 
    messages, 
    inputValue, 
    isLoading, 
    isOnboarding,
    setIsOpen, 
    setInputValue, 
    setIsLoading, 
    setIsOnboarding,
    addMessage,
    loadChatHistory,
    unread
  } = useChat()
  
  const [isMobile, setIsMobile] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load chat history when component mounts and user is authenticated
  useEffect(() => {
    if (isClient && isAuthenticated && messages.length === 0) {
      loadChatHistory()
    }
  }, [isClient, isAuthenticated, messages.length]) // Removed loadChatHistory from dependencies

  // Expose open function globally for mobile navigation
  useEffect(() => {
    if (!isClient) return
    
    const handleOpenChat = () => {
      // Only open chat if user is authenticated
      if (isAuthenticated) {
        setIsOpen(true)
      }
    }
    
    // Use custom event instead of global function
    window.addEventListener('openAleraChat', handleOpenChat)
    
    return () => {
      window.removeEventListener('openAleraChat', handleOpenChat)
    }
  }, [setIsOpen, isClient, isAuthenticated])

  // Check if mobile on mount and resize
  useEffect(() => {
    if (!isClient) return
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!isClient) return
    scrollToBottom()
  }, [messages, isClient])

  useEffect(() => {
    if (!isClient) return
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, isClient])

  // Don't render until client-side
  if (!isClient) {
    return null
  }

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ message: text.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        }

        addMessage(aiMessage)
        
        // Handle onboarding responses
        if (data.isOnboarding) {
          setIsOnboarding(true)
        }
      } else if (response.status === 429) {
        // Handle subscription limit errors
        const errorData = await response.json()
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: `${errorData.error} ${errorData.upgradeRequired ? `Upgrade to ${errorData.upgradeRequired.charAt(0).toUpperCase() + errorData.upgradeRequired.slice(1)} for unlimited access.` : ''}`,
          isUser: false,
          timestamp: new Date()
        }
        addMessage(errorMessage)
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: new Date()
        }
        addMessage(errorMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt)
  }

  return (
    <>
      {/* Desktop floating button only */}
      <motion.button
        className="!hidden md:!flex fixed bottom-6 right-6 z-50 h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-yellow-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative">
          <MessageSquareText className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-bold">
              {unread}
            </span>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed z-50 ${
              isMobile 
                ? 'inset-4 w-auto h-auto' 
                : 'bottom-24 right-6 w-80 md:w-96 h-[500px]'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 dark:border-0 shadow-xl dark:bg-[#0f0f1a] h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-yellow-500 flex items-center justify-center">
                    <MessageSquareText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-lg dark:text-white">ALERA Agent</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 pt-2 min-h-0">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => {
                      // Detect onboarding messages - check for completion message first
                      const messageText = message.text.toLowerCase()
                      const isCompletionMessage = messageText.includes('what can i help you with today?')
                      const isOnboardingMessage = !message.isUser && !isCompletionMessage && (
                        message.intent_classified === 'onboarding' ||
                        (isOnboarding && message.intent_classified !== 'notification')
                      )
                      
                      // Debug logging
                      if (!message.isUser) {
                        console.log('[FloatingAgent] AI Message:', {
                          id: message.id,
                          intent_classified: message.intent_classified,
                          isOnboarding,
                          isOnboardingMessage,
                          text: message.text.substring(0, 50) + '...'
                        })
                      }
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              message.isUser
                                ? 'bg-gradient-to-r from-purple-600 to-yellow-500 text-white'
                                : isOnboardingMessage
                                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border border-green-400/50'
                                  : (message as any).kind === 'notification'
                                    ? 'bg-yellow-500/10 border border-yellow-400/30 dark:text-white'
                                    : 'bg-muted/50 dark:bg-[#1a1a2e] dark:text-white'
                            }`}
                          >
                            {isOnboardingMessage && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-white/90">ONBOARDING</span>
                              </div>
                            )}
                            {!message.isUser && !isOnboardingMessage && (message as any).kind === 'notification' && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-yellow-400">NOTIFICATION</span>
                              </div>
                            )}
                            <div 
                              className="text-sm"
                              dangerouslySetInnerHTML={{ 
                                __html: message.text.replace(/\n/g, '<br>') 
                              }}
                            />
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 dark:bg-[#1a1a2e] rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm dark:text-white">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Invisible div for auto-scrolling */}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex-shrink-0">
                <div className="w-full space-y-3">
                  {/* Suggested Prompts */}
                  {messages.length === 1 && !isOnboarding && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground dark:text-gray-400">Try asking:</p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 dark:bg-[#1a1a2e] dark:border-[#2d2d44]"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
