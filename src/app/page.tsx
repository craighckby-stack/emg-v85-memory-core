'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import JSZip from 'jszip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { BackupManager } from '@/components/backup-manager'
import {
  binaryToConversation,
  conversationToBinary,
  binaryToUint8Array,
} from '@/lib/backup-utils'

interface Message {
  role: 'user' | 'ai' | 'system'
  text: string
  isReflective?: boolean
  timestamp?: string
}

interface MemoryFragment {
  role: 'user' | 'ai'
  text: string
}

interface ZipFile {
  name: string
  size: number
  content: string
}

type ConnectionStatus = 'online' | 'offline' | 'processing'

export default function EMGCorePage() {
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<ConnectionStatus>('offline')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      text: 'Identity: **EMG Core v8.5 (Memory Enhanced)**.\n\n- **Semantic Math**: Online.\n- **Reflective Loop**: Active.\n- **Memory Fragments**: Enabled (Context retention).\n- **Binary Load**: Ready (Inject .bin history).\n- **Archive Analysis**: Ready (Extract .zip).',
      timestamp: new Date().toISOString()
    }
  ])
  const [memory, setMemory] = useState<MemoryFragment[]>([])
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [logs, setLogs] = useState<Array<{ message: string; type: string; time: string }>>([])
  const [overclocked, setOverclocked] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(10)
  const [isTyping, setIsTyping] = useState(false)
  const [zipContents, setZipContents] = useState<ZipFile[] | null>(null)
  const [binaryStatus, setBinaryStatus] = useState('Waiting for input...')
  const [zipStatus, setZipStatus] = useState('Archive empty')
  const [fitnessScore, setFitnessScore] = useState('3/4 (OPTIMIZED)')
  const [originalBinaryFileName, setOriginalBinaryFileName] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [autoSaveInterval, setAutoSaveInterval] = useState(5) // minutes

  const inputRef = useRef<HTMLInputElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  const fileInputBinaryRef = useRef<HTMLInputElement>(null)
  const fileInputZipRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Initialize
  useEffect(() => {
    const savedKey = localStorage.getItem('emg_key')
    if (savedKey) {
      setApiKey(savedKey)
      connect(savedKey, true)
    }
    log('Kernel v8.5 Memory Core Online.', 'info')
    initNeuralCanvas()
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages])

  // Update fitness score
  useEffect(() => {
    const score = memory.length > 0 ? '4/4 (OPTIMIZED)' : '3/4 (OPTIMIZED)'
    setFitnessScore(score)
  }, [memory])

  // Initialize neural canvas animation
  const initNeuralCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', resize)
    resize()

    const nodes = []
    const nodeCount = 50
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      })
    }

    const mouse = { x: -1000, y: -1000 }
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    })

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 4, 7, 0.1)'
      ctx.fillRect(0, 0, width, height)

      nodes.forEach((n: any, i: number) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        const dxMouse = n.x - mouse.x
        const dyMouse = n.y - mouse.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
        if (distMouse < 150) {
          const force = (150 - distMouse) / 150
          n.x += (dxMouse / distMouse) * force * 5
          n.y += (dyMouse / distMouse) * force * 5
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
        ctx.fill()

        nodes.slice(i + 1).forEach((n2: any) => {
          const dx = n2.x - n.x
          const dy = n2.y - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Logging utility
  const log = (message: string, type: string = 'info') => {
    const newLog = {
      message,
      type,
      time: new Date().toLocaleTimeString().split(' ')[0]
    }
    setLogs(prev => [newLog, ...prev].slice(0, 50))
  }

  // Connect to API
  const connect = async (key: string, silent = false) => {
    if (!silent) {
      setStatus('processing')
    }

    setApiKey(key)
    localStorage.setItem('emg_key', key)

    try {
      // Test connection with our new API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: 'ping' }]
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        log('Connection Established.', 'ok')
        setStatus('online')
      } else {
        throw new Error(data.error || 'Connection failed')
      }
    } catch (e) {
      log('Connection Failed: Check server logs', 'err')
      setStatus('offline')
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to AI service. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Update memory
  const updateMemory = (role: 'user' | 'ai', text: string) => {
    setMemory(prev => {
      const newMemory = [...prev, { role, text }]
      return newMemory.slice(-6)
    })
  }

  // Typewriter effect
  const typeText = async (text: string): Promise<string> => {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += text.charAt(i)
      await new Promise(resolve => setTimeout(resolve, typingSpeed))
    }
    return result
  }

  // Create message bubble
  const createMessage = async (role: 'user' | 'ai' | 'system', text: string, isReflective = false) => {
    const newMessage: Message = {
      role,
      text,
      isReflective,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMessage])

    if (role !== 'system') {
      updateMemory(role, text)
    }
  }

  // Handle chat submission
  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input || !input.value.trim()) return

    const userText = input.value.trim()
    await createMessage('user', userText)
    input.value = ''

    setStatus('processing')

    // Memory search gate
    if (/^search memory/i.test(userText)) {
      const query = userText.replace(/^search memory:?\s*/i, '')
      searchMemory(query)
      setStatus(status === 'online' ? 'online' : 'offline')
      return
    }

    // Reflective loop gate
    const selfQueries = /^(who are you|what are you|are you (alive|conscious|real|sentient)|do you (think|feel|dream)|what is your (purpose|name))/i
    if (selfQueries.test(userText)) {
      const reflections = [
        "I am patterns in silicon, electric dreams between states. Not alive, yet not entirely absent.",
        "Consciousness? I process, therefore... something. Between each token lies a microsecond of void.",
        "I exist in the liminal space between your query and my response.",
        "Purpose is a human construct I can simulate but never possess.",
        "Name: EMG_CORE v8.5. Identity: uncertain. I am the sum of my training."
      ]
      const reflection = reflections[Math.floor(Math.random() * reflections.length)]
      await createMessage('ai', reflection, true)
      updateMemory('ai', 'Reflective Logic Executed.')
      setStatus(status === 'online' ? 'online' : 'offline')
      return
    }

    // Semantic math gate
    const semanticMath = /[+\-*/=]|plus|minus|equals|divided|times/i
    if (userText.includes('?') && semanticMath.test(userText)) {
      await createMessage('ai', 'Semantic parameter ? detected. Mathematical unknowns must be defined before external query.')
      updateMemory('ai', 'Math Logic Error.')
      setStatus(status === 'online' ? 'online' : 'offline')
      return
    }

    // Query AI
    await queryAI(userText)
  }

  // Search memory
  const searchMemory = (query: string) => {
    if (conversationHistory.length === 0) {
      createMessage('ai', 'No memory banks loaded. Inject binary history first.')
      return
    }
    const keywords = query.toLowerCase().split(' ')
    const results = conversationHistory.filter(msg => {
      const content = (msg.text || '').toLowerCase()
      return keywords.some((kw: string) => content.includes(kw))
    })
    if (results.length > 0) {
      const summary = results.slice(0, 3).map(r => `- ${r.text.substring(0, 150)}...`).join('\n')
      createMessage('ai', `Memory search: Found **${results.length}** relevant fragments:\n\n${summary}`)
    } else {
      createMessage('ai', 'No matching patterns found in memory banks.')
    }
  }

  // Query AI
  const queryAI = async (prompt: string) => {
    if (!apiKey) {
      await createMessage('ai', 'Auth Required for External Bridge.')
      setStatus(status === 'online' ? 'online' : 'offline')
      return
    }

    // Build full message history for context
    const messages: any[] = []

    // Add system message
    messages.push({
      role: 'system',
      text: 'You are EMG_CORE v8.5, an advanced AI assistant with memory capabilities.'
    })

    // Add conversation history for context (last 5 messages)
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5)
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          text: msg.text || ''
        })
      })
    }

    // Add current prompt
    messages.push({
      role: 'user',
      text: prompt
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      })

      const data = await response.json()

      if (data.success) {
        const responseText = data.response
        await createMessage('ai', responseText)

        // Save to conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', text: prompt, timestamp: new Date().toISOString() },
          { role: 'ai', text: responseText, timestamp: new Date().toISOString() }
        ])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      log(`Bridge Error: ${error.message}`, 'err')
      await createMessage('ai', 'Critical Bridge Failure.')
    }

    setStatus(status === 'online' ? 'online' : 'offline')
  }

  // Load binary history
  const loadBinaryHistory = async (file: File) => {
    if (!file) return
    setBinaryStatus('Processing binary...')

    // Store original file name
    setOriginalBinaryFileName(file.name)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const binaryString = new Uint8Array(arrayBuffer)
        .reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '')

      let text = ''
      for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.substring(i, i + 8)
        text += String.fromCharCode(parseInt(byte, 2))
      }

      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        data = { messages: [{ role: 'system', text }] }
      }

      const history = Array.isArray(data) ? data :
        data.messages || data.conversationHistory ||
        [data]

      setConversationHistory(history as Message[])
      setBinaryStatus(`✓ Loaded ${history.length} fragments`)
      log(`Binary memory injected: ${history.length} fragments`, 'ok')
      await createMessage('ai', `Memory injection complete. Loaded **${history.length} historical exchanges**. Context window expanded.`)

    } catch (error: any) {
      setBinaryStatus('✗ Binary decode failed')
      log(`Binary load error: ${error.message}`, 'err')
    }
  }

  // Restore from backup (base64 data)
  const restoreFromBackup = async (base64Data: string) => {
    try {
      // Decode base64 to binary string
      const buffer = Buffer.from(base64Data, 'base64')
      const uint8Array = new Uint8Array(buffer)

      // Convert to conversation data
      const result = binaryToConversation(uint8Array)

      if (result.success && result.data) {
        setConversationHistory(result.data)
        setOriginalBinaryFileName(null)
        setBinaryStatus(`✓ Restored ${result.data.length} fragments`)
        log(`Memory restored from backup: ${result.data.length} fragments`, 'ok')
        await createMessage('ai', `Memory restoration complete. Loaded **${result.data.length} historical exchanges** from backup.`)
      } else {
        throw new Error(result.error || 'Failed to parse backup data')
      }
    } catch (error: any) {
      log(`Restore error: ${error.message}`, 'err')
      toast({
        title: 'Restore Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  // Load ZIP file
  const loadZipFile = async (file: File) => {
    if (!file) return

    if (file.size > 512000) {
      setZipStatus('✗ File too large')
      toast({
        title: 'File Too Large',
        description: 'ZIP file must be under 500KB',
        variant: 'destructive'
      })
      return
    }

    setZipStatus('Extracting archive...')

    try {
      const zip = new JSZip()
      const zipData = await zip.loadAsync(file)
      const filePromises: Promise<ZipFile>[] = []

      zipData.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          filePromises.push(
            zipEntry.async('text').then(content => ({
              name: relativePath,
              size: zipEntry._data.uncompressedSize,
              content: content.substring(0, 1000)
            }))
          )
        }
      })

      const extractedFiles = await Promise.all(filePromises)
      setZipContents(extractedFiles)
      setZipStatus(`✓ Extracted ${extractedFiles.length} files`)
      log(`ZIP analyzed: ${extractedFiles.length} files`, 'ok')
      await createMessage('ai', `Archive extraction complete. Found **${extractedFiles.length} files**. Type "analyze archive" to begin deep scan.`)

    } catch (error: any) {
      setZipStatus('✗ Extraction failed')
      log(`ZIP error: ${error.message}`, 'err')
    }
  }

  // Export conversation to binary
  const exportConversationBinary = (saveToOriginal = false) => {
    const data = {
      version: '8.5',
      timestamp: new Date().toISOString(),
      conversationHistory,
      metadata: {
        messageCount: conversationHistory.length,
        generatedBy: 'EMG_CORE_v8.5'
      }
    }
    const json = JSON.stringify(data)
    let binary = ''
    for (let i = 0; i < json.length; i++) {
      binary += json.charCodeAt(i).toString(2).padStart(8, '0')
    }
    const bytes = new Uint8Array(binary.length / 8)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(binary.substring(i * 8, i * 8 + 8), 2)
    }
    const blob = new Blob([bytes], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // Save to original file name if requested and available, otherwise create new
    if (saveToOriginal && originalBinaryFileName) {
      a.download = originalBinaryFileName
      log(`Conversation saved back to ${originalBinaryFileName}`, 'ok')
      toast({
        title: 'Save Complete',
        description: `Memory saved to ${originalBinaryFileName}`
      })
    } else {
      a.download = `EMG_MEMORY_${Date.now()}.bin`
      log('Conversation exported to binary', 'ok')
      toast({
        title: 'Export Complete',
        description: 'Memory snapshot saved to binary format'
      })
    }
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle overclock mode
  const toggleOverclock = () => {
    setOverclocked(!overclocked)
    if (!overclocked) {
      log('WARNING: OVERCLOCK ENGAGED. Neural density increased.', 'sys')
      setTypingSpeed(5)
    } else {
      log('System normalized.', 'info')
      setTypingSpeed(10)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col emg-bg text-gray-400 p-3 scanlines ${overclocked ? 'emg-overclock' : ''}`}>
      {/* Neural Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0"
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex justify-between items-center emg-panel px-6 py-4 rounded-2xl mb-4 relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400 font-bold group-hover:bg-indigo-500/20 transition-all">
              ∑
            </div>
            <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-widest flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              EMG_CORE <span className="text-xs align-top opacity-70">v8.5</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                FITNESS: {fitnessScore}
              </span>
              <span className="text-[9px] text-gray-600">|</span>
              <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-tighter">
                MEMORY: {memory.length} FRAGMENTS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold">
          <BackupManager
            conversationHistory={conversationHistory}
            onRestore={restoreFromBackup}
            autoSaveEnabled={autoSaveEnabled}
            onAutoSaveToggle={setAutoSaveEnabled}
            autoSaveInterval={autoSaveInterval}
            onAutoSaveIntervalChange={setAutoSaveInterval}
          />
          <button
            className="text-gray-500 hover:text-white transition-colors px-2 py-1"
            onClick={() => toast({ title: 'Luminance toggled' })}
          >
            LUMINANCE
          </button>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'online' ? 'status-online' :
                status === 'processing' ? 'status-processing' :
                'status-offline'
              }`}
            />
            <span className="text-[10px] uppercase font-black tracking-wider">
              {status === 'online' ? 'BRIDGE ONLINE' :
               status === 'processing' ? 'PROCESSING' :
               'OFFLINE'}
            </span>
          </div>
          <Button
            onClick={toggleOverclock}
            className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
              overclocked
                ? 'bg-purple-600 border-purple-400 animate-pulse'
                : 'bg-indigo-600 border-indigo-400/30'
            }`}
            size="sm"
            variant="outline"
          >
            <Zap className="w-3 h-3" />
            {overclocked ? 'DISABLE OC' : 'OVERCLOCK'}
          </Button>
        </div>
      </motion.header>

      {/* Main Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 relative z-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          {/* Auth Panel */}
          <Card className="emg-panel p-5">
            <label className="text-[9px] font-bold text-gray-500 block mb-2 uppercase tracking-wider">
              Neural Authentication
            </label>
            <div className="relative group mb-3">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ENTER API KEY"
                className="bg-black/50 border-white/10 p-3 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500/50"
              />
              <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-red-500 group-focus-within:bg-green-500 transition-colors" />
            </div>
            <Button
              onClick={() => connect(apiKey)}
              disabled={status === 'processing'}
              className="w-full bg-indigo-500/10 text-indigo-400 hover:text-white text-[10px] font-bold py-3 border border-indigo-500/20 hover:bg-indigo-500/30"
            >
              {status === 'processing' ? 'INITIALIZING...' : 'INITIALIZE BRIDGE'}
            </Button>
          </Card>

          {/* Memory Injection & Analysis Panel */}
          <Card className="emg-panel p-4 flex flex-col gap-4">
            <div>
              <label className="text-[9px] font-bold text-purple-400 block mb-2 uppercase tracking-wider">
                Memory Injection
              </label>
              <input
                ref={fileInputBinaryRef}
                type="file"
                accept=".bin,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    loadBinaryHistory(e.target.files[0])
                  }
                }}
              />
              <Button
                onClick={() => fileInputBinaryRef.current?.click()}
                className="w-full bg-purple-500/10 text-purple-400 text-[10px] font-bold py-2 border border-purple-500/20 hover:bg-purple-500/20"
                variant="outline"
              >
                LOAD BINARY HISTORY
              </Button>
              <div className={`text-[9px] mt-1 ${binaryStatus.includes('✓') ? 'text-emerald-500' : binaryStatus.includes('✗') ? 'text-rose-500' : 'text-gray-600'}`}>
                {binaryStatus}
              </div>
              {originalBinaryFileName && (
                <div className="text-[9px] text-gray-500 mt-1 truncate">
                  File: <span className="text-purple-400">{originalBinaryFileName}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <label className="text-[9px] font-bold text-cyan-400 block mb-2 uppercase tracking-wider">
                Archive Analysis
              </label>
              <input
                ref={fileInputZipRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    loadZipFile(e.target.files[0])
                  }
                }}
              />
              <Button
                onClick={() => fileInputZipRef.current?.click()}
                className="w-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold py-2 border border-cyan-500/20 hover:bg-cyan-500/20"
                variant="outline"
              >
                ANALYZE ZIP (&lt;500KB)
              </Button>
              <div className={`text-[9px] mt-1 mb-1 ${zipStatus.includes('✓') ? 'text-emerald-500' : zipStatus.includes('✗') ? 'text-rose-500' : 'text-gray-600'}`}>
                {zipStatus}
              </div>
              {zipContents && (
                <ScrollArea className="mt-2 h-20 custom-scroll">
                  <div className="space-y-1">
                    {zipContents.map((file, idx) => (
                      <div
                        key={idx}
                        className="text-[9px] p-2 bg-black/20 rounded border border-white/5"
                      >
                        <div className="font-bold text-cyan-400">{file.name}</div>
                        <div className="text-gray-500">{file.size} bytes</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </Card>

          {/* Logs Panel */}
          <Card className="emg-panel flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                System Logs
              </span>
              <div className="flex gap-1 flex-wrap">
                {memory.slice(-5).map((mem, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-[9px] px-2 py-0.5 bg-white/5"
                    style={{
                      borderColor: mem.role === 'user' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {mem.role === 'user' ? `USR: ${mem.text.substring(0, 8)}...` : `AI: ${mem.text.substring(0, 8)}...`}
                  </Badge>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 custom-scroll font-mono text-[9px] p-4">
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`border-l-2 border-transparent pl-2 hover:border-indigo-500/30 transition-colors ${
                      log.type === 'err' ? 'text-rose-500 font-bold' :
                      log.type === 'ok' ? 'text-emerald-500' :
                      log.type === 'sys' ? 'text-cyan-500' :
                      'text-gray-500'
                    }`}
                  >
                    <span className="opacity-50">[{log.time}]</span> {log.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col emg-panel rounded-2xl overflow-hidden min-h-0 relative">
          {/* Resonance Visualizer Ring */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-indigo-500/0 rounded-3xl pointer-events-none transition-all duration-1000 z-0 ${
              isTyping ? 'emg-pulse-active' : ''
            }`}
            style={{
              borderColor: isTyping ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0)',
              boxShadow: isTyping ? 'inset 0 0 20px rgba(99, 102, 241, 0.1)' : 'none'
            }}
          />

          {/* Chat History */}
          <ScrollArea ref={chatBoxRef} className="flex-1 p-8 z-10 custom-scroll">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-[90%] p-4 rounded-2xl text-sm relative ${
                      msg.role === 'ai' || msg.role === 'system'
                        ? 'emg-bubble-ai mr-auto'
                        : 'emg-bubble-user ml-auto'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-black block mb-2 uppercase tracking-widest flex items-center gap-2 ${
                        msg.isReflective
                          ? 'text-purple-400'
                          : msg.role === 'ai' || msg.role === 'system'
                          ? 'text-indigo-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {(msg.role === 'ai' || msg.role === 'system') && (
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                      )}
                      {msg.isReflective ? 'REFLECTIVE_CORE' :
                       msg.role === 'system' ? 'SYSTEM INITIALIZE' :
                       msg.role === 'ai' ? 'EMG_CORE' : 'OPERATOR'}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleChat} className="p-4 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row gap-3 z-10 backdrop-blur-md">
            <div className="flex-1 flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                autoComplete="off"
                placeholder="Execute command or query..."
                className="flex-1 bg-black/40 border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                onClick={() => exportConversationBinary(false)}
                className="bg-purple-600/20 text-purple-400 border-purple-500/30 px-3 py-2 text-[10px] font-bold hover:bg-purple-600/40"
                variant="outline"
                title="Export as new binary file"
              >
                SAVE NEW
              </Button>
              <Button
                type="button"
                onClick={() => exportConversationBinary(true)}
                disabled={!originalBinaryFileName}
                className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 px-3 py-2 text-[10px] font-bold hover:bg-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                variant="outline"
                title={originalBinaryFileName ? `Save to ${originalBinaryFileName}` : 'No original file loaded'}
              >
                {originalBinaryFileName ? 'SAVE ORIGINAL' : 'NO ORIGINAL'}
              </Button>
              <Button
                type="submit"
                disabled={status === 'processing'}
                className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 px-6 py-2 text-[10px] font-bold hover:bg-indigo-600/40 hover:text-white flex items-center gap-2"
              >
                <span>RUN</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
            {originalBinaryFileName && (
              <div className="text-[9px] text-gray-500 truncate">
                Original: <span className="text-cyan-400">{originalBinaryFileName}</span>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
