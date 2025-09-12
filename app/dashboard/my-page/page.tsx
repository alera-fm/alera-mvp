'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { GripVertical } from 'lucide-react'
import { ReactSortable } from 'react-sortablejs'
import LandingPage from '@/components/landing-page'
import { HeaderSection } from '@/components/header-section'
import { MobileNavigation } from '@/components/mobile-navigation'
// Drag & drop removed for stability; Up/Down buttons handle reordering

type Theme = { backgroundColor: string; textColor: string; fontFamily: string }

type Block = any

const DEFAULT_THEME: Theme = { backgroundColor: '#0B0B0F', textColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }

export default function MyPageEditor() {
  const { user } = useAuth()
  const [slug, setSlug] = useState('')
  const [config, setConfig] = useState<any>({ artist_name: '', theme_color: '#E1FF3F', blocks: [], social_links: {}, contact_info: { email: '', management: { name: '', email: '', phone: '' } } })
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({})

  const artistId = user?.id

  // DnD sensors must be declared at top-level (hooks order)
  // no DnD sensors

  useEffect(() => {
    const run = async () => {
      if (!artistId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/landing-page/${artistId}`)
        const data = await res.json()
        if (data?.page) {
          setSlug(data.page.slug)
          setConfig(data.page.page_config)
          if (data.page.page_config?.theme) setTheme(data.page.page_config.theme)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [artistId])

  const handleSave = async () => {
    if (!artistId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/landing-page/${artistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ slug: slug || `artist-${artistId}`, page_config: { ...config, theme } })
      })
      if (!res.ok) throw new Error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const persistConfig = async (nextConfig: any) => {
    if (!artistId) return
    try {
      await fetch(`/api/landing-page/${artistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ slug: slug || `artist-${artistId}`, page_config: { ...nextConfig, theme } })
      })
      setLastSavedAt(new Date().toLocaleTimeString())
    } catch (e) {
      console.error('Auto-save failed', e)
    }
  }

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      body: fd,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.url as string
  }

  const addBlock = (type: string) => {
    // Prevent duplicates for single-instance block types
    const allowMultiple: string[] = []
    if (!allowMultiple.includes(type) && (config.blocks || []).some((b: any) => b.type === type)) {
      return
    }
    const id = `${type}-${Date.now()}`
    switch (type) {
      case 'bio':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'bio', title: 'About', content: '' }, ...c.blocks] }))
        break
      case 'video':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'video', title: 'Videos', items: [] }, ...c.blocks] }))
        break
      case 'release':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'release', title: 'Music', items: [] }, ...c.blocks] }))
        break
      case 'tour':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'tour', title: 'Tour', dates: [] }, ...c.blocks] }))
        break
      case 'merch':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'merch', title: 'Merch', items: [] }, ...c.blocks] }))
        break
      case 'tip_jar':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'tip_jar', title: 'Support', description: '', currency: 'USD', preset_amounts: [5, 10, 20], custom_amount_enabled: true, thank_you_message: 'Thank you!', payment_link: '' }, ...c.blocks] }))
        break
      case 'locked_content':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'locked_content', title: 'Subscribers Only', subscription_link: '', items: [] }, ...c.blocks] }))
        break
      case 'welcome':
        setConfig((c: any) => ({ ...c, blocks: [{ id, type: 'welcome', title: 'Welcome', description: 'Become a fan to subscribe and get updates.', buttonText: 'Become a Fan' }, ...c.blocks] }))
        break
      default:
        break
    }
  }

  const moveBlock = (id: string, dir: -1 | 1) => {
    setConfig((c: any) => {
      const arr = [...c.blocks]
      const i = arr.findIndex((b) => b.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= arr.length) return c
      const [it] = arr.splice(i, 1)
      arr.splice(j, 0, it)
      return { ...c, blocks: arr }
    })
  }

  const removeBlock = (id: string) => setConfig((c: any) => ({ ...c, blocks: c.blocks.filter((b: any) => b.id !== id) }))

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-4 space-y-4">
              <HeaderSection />
      <div className="sticky top-0 z-20 backdrop-blur supports-backdrop-blur:bg-white/5 bg-background/40 border-b border-white/10 rounded-b-xl">
        <div className="flex items-center justify-between py-3 px-1">
          <h2 className="text-xl font-semibold">My Page</h2>
          <div className="flex items-center gap-3">
            {lastSavedAt && <span className="text-xs opacity-70">Saved {lastSavedAt}</span>}
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            {slug && <a className="underline text-sm self-center" href={`/p/${slug}`} target="_blank" rel="noreferrer">Live Preview</a>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label className="text-xs">Public URL Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="nova-kay" className="alera-form-input" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Artist Name</Label>
            <Input value={config.artist_name || ''} onChange={(e) => setConfig((c: any) => ({ ...c, artist_name: e.target.value }))} placeholder="Artist display name" className="alera-form-input" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card className="alera-surface">
            <CardHeader><CardTitle>Blocks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  ['bio', 'Bio'],
                  ['video', 'Video'],
                  ['release', 'Release'],
                  ['tour', 'Tour'],
                  ['merch', 'Merch'],
                  ['tip_jar', 'Tip Jar'],
                  ['locked_content', 'Gated Content'],
                  ['welcome', 'Welcome'],
                ].map(([t, label]) => (
                  <Button
                    key={t}
                    variant="outline"
                    size="sm"
                    disabled={(config.blocks || []).some((b: any) => b.type === t)}
                    onClick={() => addBlock(String(t))}
                    title={(config.blocks || []).some((b: any) => b.type === t) ? 'Already added' : ''}
                  >
                    + {label}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <ReactSortable
                  list={config.blocks.map((b: any) => ({ ...b }))}
                  setList={(newList: any[]) => setConfig((c: any) => ({ ...c, blocks: newList }))}
                  handle=".drag-handle"
                  animation={150}
                  className="space-y-3"
                >
                  {config.blocks.map((b: any) => (
                    <div
                      key={b.id}
                      data-id={b.id}
                      className="relative rounded-2xl bg-white dark:bg-black backdrop-blur-md border border-white/10 p-4 shadow-lg overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 h-1 w-full"
                        style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }}
                      />
                      <div
                        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 blur-3xl"
                        style={{ background: `${config.theme_color || '#E1FF3F'}` }}
                      />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button className="drag-handle h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground" type="button">
                              <GripVertical className="h-4 w-4" />
                            </button>
                            <div className="font-medium">{String(b.type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="destructive" size="sm" onClick={() => { console.log('block:remove', b.id); removeBlock(b.id) }} type="button">Remove</Button>
                          </div>
                        </div>
                        <details className="group mt-2" open>
                          <summary className="list-none cursor-pointer select-none">
                            <div className="flex items-center justify-between py-1">
                              <div className="text-sm opacity-80">
                                {b.type === 'release' && `${(b.items||[]).length || 0} releases`}
                                {b.type === 'tour' && `${(b.dates||[]).length || 0} dates`}
                                {b.type === 'merch' && `${(b.items||[]).length || 0} items`}
                              </div>
                              <span className="text-xs opacity-70 group-open:hidden">Expand</span>
                              <span className="text-xs opacity-70 hidden group-open:inline">Collapse</span>
                            </div>
                          </summary>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {b.type === 'welcome' && (
                            <>
                              <div className="md:col-span-1">
                                <Label>Title</Label>
                                <Input value={b.title} className="alera-form-input" onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, title: e.target.value } : x) }))} />
                              </div>
                              <div className="md:col-span-1">
                                <Label>Button Text</Label>
                                <Input value={b.buttonText || ''} className="alera-form-input" onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, buttonText: e.target.value } : x) }))} />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Input value={b.description} className="alera-form-input" onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, description: e.target.value } : x) }))} />
                              </div>
                            </>
                          )}
                          {b.type === 'bio' && (
                            <>
                              <div className="md:col-span-1">
                                <Label>Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Content</Label>
                                <Input value={b.content} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, content: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                            </>
                          )}
                          {b.type === 'video' && (
                            <>
                              <div className="md:col-span-2">
                                <Label>Section Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Videos</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: [...(x.items||[]), { title:'', video_url:'', thumbnail_url:'' }] } : x) }))}>+ Add Video</Button>
                                </div>
                                {(b.items||[]).map((it:any, idx:number)=> (
                                  <div key={idx} className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                    <div className="md:col-span-1">
                                      <Label>Title</Label>
                                      <Input value={it.title} onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, title: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Video URL</Label>
                                      <Input value={it.video_url} onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, video_url: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label>Thumbnail</Label>
                                      <div className="mt-2 flex items-start gap-3">
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                          {it.thumbnail_url ? (
                                            <img src={it.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                          ) : (
                                            <span className="text-[10px] opacity-50">No image</span>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          <input type="file" accept="image/*" onChange={async (e)=>{
                                            const file=e.target.files?.[0]; if(!file) return
                                            const key=`${b.id}-vid-${idx}`; setUploading((u)=>({ ...u, [key]: true }))
                                            try {
                                              const url=await uploadImage(file,'covers')
                                              setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, thumbnail_url: url } : y) } : x) }))
                                            } finally {
                                              setUploading((u)=>({ ...u, [key]: false })); e.currentTarget.value=''
                                            }
                                          }} />
                                          {uploading[`${b.id}-vid-${idx}`] && <span className="text-xs opacity-70">Uploading...</span>}
                                          {it.thumbnail_url && <Button type="button" size="sm" variant="outline" onClick={()=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, thumbnail_url: '' } : y) } : x) }))}>Remove Thumbnail</Button>}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                      <Button type="button" variant="destructive" size="sm" onClick={()=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.filter((_:any,i:number)=> i!==idx) } : x) }))}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {b.type === 'release' && (
                            <>
                              <div className="md:col-span-2">
                                <Label>Section Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Releases</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: [...(x.items||[]), { title:'', artwork_url:'', streaming_links:{} }] } : x) }))}>+ Add Release</Button>
                                </div>
                                {(b.items||[]).map((it:any, idx:number)=>(
                                  <div key={idx} className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                    <div className="md:col-span-1">
                                      <Label>Title</Label>
                                      <Input value={it.title} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, title: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Artwork</Label>
                                      <div className="mt-2 flex items-start gap-3">
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                          {it.artwork_url ? (
                                            <img src={it.artwork_url} alt="Artwork" className="h-full w-full object-cover" />
                                          ) : (
                                            <span className="text-[10px] opacity-50">No image</span>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          <input type="file" accept="image/*" onChange={async (e)=>{
                                            const file=e.target.files?.[0]; if(!file) return
                                            const key=`${b.id}-rel-${idx}`; setUploading((u)=>({ ...u, [key]: true }))
                                            try{
                                              const url=await uploadImage(file,'covers')
                                              setConfig((c:any)=>{ const next={ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, artwork_url: url } : y) } : x) }; persistConfig(next); return next })
                                            }finally{ setUploading((u)=>({ ...u, [key]: false })); e.currentTarget.value='' }
                                          }} />
                                          {uploading[`${b.id}-rel-${idx}`] && <span className="text-xs opacity-70">Uploading...</span>}
                                          {it.artwork_url && <Button type="button" size="sm" variant="outline" onClick={()=> setConfig((c:any)=>{ const next={ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, artwork_url: '' } : y) } : x) }; persistConfig(next); return next })}>Remove Artwork</Button>}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Spotify</Label>
                                      <Input value={it.streaming_links?.spotify || ''} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, streaming_links: { ...(y.streaming_links||{}), spotify: e.target.value } } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Apple Music</Label>
                                      <Input value={it.streaming_links?.apple_music || ''} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, streaming_links: { ...(y.streaming_links||{}), apple_music: e.target.value } } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label>YouTube</Label>
                                      <Input value={it.streaming_links?.youtube || ''} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, streaming_links: { ...(y.streaming_links||{}), youtube: e.target.value } } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                      <Button type="button" variant="destructive" size="sm" onClick={()=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.filter((_:any,i:number)=> i!==idx) } : x) }))}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {b.type === 'tour' && (
                            <>
                              <div className="md:col-span-2">
                                <Label>Section Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Dates</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: [...(x.dates||[]), { city:'', venue:'', date:'', ticket_link:'' }] } : x) }))}>+ Add Date</Button>
                                </div>
                                {(b.dates||[]).map((d:any, idx:number)=>(
                                  <div key={idx} className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                    <div className="md:col-span-1">
                                      <Label>City</Label>
                                      <Input value={d.city} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: x.dates.map((y:any,i:number)=> i===idx ? { ...y, city: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Venue</Label>
                                      <Input value={d.venue} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: x.dates.map((y:any,i:number)=> i===idx ? { ...y, venue: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Date</Label>
                                      <Input type="date" value={d.date||''} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: x.dates.map((y:any,i:number)=> i===idx ? { ...y, date: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Ticket Link</Label>
                                      <Input value={d.ticket_link} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: x.dates.map((y:any,i:number)=> i===idx ? { ...y, ticket_link: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2 flex gap-2 justify-end">
                                      <Button type="button" variant="destructive" size="sm" onClick={()=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, dates: x.dates.filter((_:any,i:number)=> i!==idx) } : x) }))}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {b.type === 'merch' && (
                            <>
                              <div className="md:col-span-2">
                                <Label>Section Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Items</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: [...(x.items||[]), { name:'', image_url:'', price:'', product_link:'' }] } : x) }))}>+ Add Item</Button>
                                </div>
                                {(b.items||[]).map((it:any, idx:number)=>(
                                  <div key={idx} className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                    <div className="md:col-span-1">
                                      <Label>Name</Label>
                                      <Input value={it.name} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, name: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Item Image</Label>
                                      <div className="mt-2 flex items-start gap-3">
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden alera-surface border border-white/10 flex items-center justify-center">
                                          {(localPreviews[`${b.id}-item-${idx}`] || it.image_url || it.imageUrl || it.image) ? (
                                            <img src={(localPreviews[`${b.id}-item-${idx}`] || it.image_url || it.imageUrl || it.image) as string} alt="Merch" className="h-full w-full object-cover" />
                                          ) : (
                                            <span className="text-[10px] opacity-50">No image</span>
                                          )}
                                        </div>
                                        <div className="space-y-2">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0]
                                              if (!file) return
                                              const key = `${b.id}-item-${idx}`
                                              setUploading((u) => ({ ...u, [key]: true }))
                                              let success = false
                                              try {
                                                const blobUrl = URL.createObjectURL(file)
                                                setLocalPreviews((p) => ({ ...p, [key]: blobUrl }))
                                                const url = await uploadImage(file, 'merch')
                                                setConfig((c: any) => {
                                                  const next = { ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, image_url: url } : y) } : x) }
                                                  persistConfig(next)
                                                  return next
                                                })
                                                success = true
                                              } catch (err) {
                                                console.error('Merch image upload error', err)
                                              } finally {
                                                setUploading((u) => ({ ...u, [key]: false }))
                                                if (success) {
                                                  const cur = localPreviews[key]
                                                  if (cur) {
                                                    URL.revokeObjectURL(cur)
                                                  }
                                                  setLocalPreviews((p) => { const n={...p}; delete n[key]; return n })
                                                }
                                                e.currentTarget.value = ''
                                              }
                                            }}
                                          />
                                          {uploading[`${b.id}-item-${idx}`] && <span className="text-xs opacity-70">Uploading...</span>}
                                          {it.image_url && (
                                            <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=>{ const next={ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, image_url: '' } : y) } : x) }; persistConfig(next); return next })}>Remove Image</Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Price</Label>
                                      <Input value={it.price} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, price: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Product Link</Label>
                                      <Input value={it.product_link} onChange={(e)=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, product_link: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2 flex gap-2 justify-end pt-1">
                                      <Button type="button" variant="destructive" size="sm" onClick={()=> setConfig((c:any)=>({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.filter((_:any,i:number)=> i!==idx) } : x) }))}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {b.type === 'tip_jar' && (
                            <>
                              <div className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                <div>
                                  <Label>Title</Label>
                                  <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                                </div>
                                <div>
                                  <Label>Payment Link</Label>
                                  <Input value={b.payment_link} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, payment_link: e.target.value } : x) }))} className="alera-form-input" />
                                  <div className="text-xs opacity-70 mt-2 space-y-1">
                                    <p>Don’t have a link? Choose one of these quick options:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                      <li>
                                        <a className="underline" href="https://www.paypal.com/paypalme" target="_blank" rel="noreferrer">Create PayPal.me</a>
                                      </li>
                                      <li>
                                        <a className="underline" href="https://buymeacoffee.com" target="_blank" rel="noreferrer">Create Buy Me a Coffee</a>
                                      </li>
                                      <li>
                                        <a className="underline" href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noreferrer">Create Stripe Payment Link</a>
                                      </li>
                                    </ul>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const handle = window.prompt('Your PayPal.me handle (without URL):', (config.artist_name||'').replace(/\s+/g,'') ) || ''
                                        if (!handle) return
                                        setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, payment_link: `https://www.paypal.com/paypalme/${handle}` } : x) }))
                                      }}>PayPal.me</Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const handle = window.prompt('Your BuyMeACoffee username:', (config.artist_name||'').replace(/\s+/g,'') ) || ''
                                        if (!handle) return
                                        setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, payment_link: `https://buymeacoffee.com/${handle}` } : x) }))
                                      }}>Buy Me a Coffee</Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const handle = window.prompt('Your Ko-fi username:', (config.artist_name||'').replace(/\s+/g,'') ) || ''
                                        if (!handle) return
                                        setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, payment_link: `https://ko-fi.com/${handle}` } : x) }))
                                      }}>Ko‑fi</Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const cashtag = window.prompt('Your Cash App $cashtag (just the name, no $):', '') || ''
                                        if (!cashtag) return
                                        setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, payment_link: `https://cash.app/$${cashtag}` } : x) }))
                                      }}>Cash App</Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        const user = window.prompt('Your Venmo username:', (config.artist_name||'').replace(/\s+/g,'') ) || ''
                                        if (!user) return
                                        setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, payment_link: `https://venmo.com/${user}` } : x) }))
                                      }}>Venmo</Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => {
                                        window.open('https://dashboard.stripe.com/payment-links', '_blank', 'noopener,noreferrer')
                                      }}>Create Stripe Link</Button>
                                    </div>
                                    <div className="text-[11px] opacity-60 mt-1">Availability varies by country (Cash App, Venmo are US/UK; Stripe/PayPal are global).</div>
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Description</Label>
                                  <Input value={b.description} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, description: e.target.value } : x) }))} className="alera-form-input" />
                                  <div className="text-xs opacity-70 mt-2">Tip links usually look like <code>https://paypal.me/yourname</code> or <code>https://buymeacoffee.com/yourname</code>. Paste yours above.</div>
                                </div>
                              </div>
                            </>
                          )}
                          {b.type === 'locked_content' && (
                            <>
                              <div className="md:col-span-2">
                                <Label>Section Title</Label>
                                <Input value={b.title} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, title: e.target.value } : x) }))} className="alera-form-input" />
                              </div>
                              <div className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 md:col-span-2">
                                <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                <div>
                                  <Label>Subscription Link</Label>
                                  <Input value={b.subscription_link || ''} onFocus={() => setEditingId(b.id)} onBlur={() => setEditingId(null)} onChange={(e) => setConfig((c: any) => ({ ...c, blocks: c.blocks.map((x: any) => x.id === b.id ? { ...x, subscription_link: e.target.value } : x) }))} className="alera-form-input" placeholder="https://your-membership-link" />
                                  <div className="text-xs opacity-70 mt-2 space-y-1">
                                    <p>Need a recurring subscription? Use one of these:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                      <li>
                                        <a className="underline" href="https://www.paypal.com/us/cshelp/article/how-do-i-create-and-manage-paypal-subscriptions-help244" target="_blank" rel="noreferrer">Create a subscription on PayPal</a>
                                      </li>
                                      <li>
                                        <a className="underline" href="https://help.buymeacoffee.com/en/articles/9969554-a-simple-guide-to-get-started-with-memberships" target="_blank" rel="noreferrer">Create a subscription on Buy Me A Coffee</a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Gated Content</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: [...(x.items||[]), { title:'Exclusive', media_url:'', locked:true, unlock_method:'subscription' }] } : x) }))}>+ Add Item</Button>
                                </div>
                                {(b.items||[]).map((it:any, idx:number)=> (
                                  <div key={idx} className="relative rounded-2xl alera-surface backdrop-blur-md border border-white/10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${config.theme_color || '#E1FF3F'}, transparent)` }} />
                                    <div className="md:col-span-1">
                                      <Label>Title</Label>
                                      <Input value={it.title} onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, title: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-1">
                                      <Label>Media URL</Label>
                                      <Input value={it.media_url || ''} onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, media_url: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label>Unlock Method</Label>
                                      <Input value={it.unlock_method || ''} onChange={(e)=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.map((y:any,i:number)=> i===idx ? { ...y, unlock_method: e.target.value } : y) } : x) }))} className="alera-form-input" />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                      <Button type="button" variant="destructive" size="sm" onClick={()=> setConfig((c:any)=> ({ ...c, blocks: c.blocks.map((x:any)=> x.id===b.id ? { ...x, items: x.items.filter((_:any,i:number)=> i!==idx) } : x) }))}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          </div>
                        </details>
                      </div>
                  ))}
                </ReactSortable>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card className="alera-surface">
            <CardHeader><CardTitle>Design</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Background Color</Label>
                <Input type="color" value={theme.backgroundColor} onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })} className="alera-form-input" />
              </div>
              <div>
                <Label>Text Color</Label>
                <Input type="color" value={theme.textColor} onChange={(e) => setTheme({ ...theme, textColor: e.target.value })} className="alera-form-input" />
              </div>
              <div>
                <Label>Font</Label>
                <select className="w-full rounded border p-2 bg-background" value={theme.fontFamily} onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}>
                  {[
                    'Inter, sans-serif',
                    'Montserrat, sans-serif',
                    '"Playfair Display", serif',
                    '"Roboto Condensed", sans-serif',
                    '"Open Sans", sans-serif',
                    'Poppins, sans-serif',
                    'Nunito, sans-serif',
                    '"Source Sans 3", sans-serif',
                    'Oswald, sans-serif',
                    'Merriweather, serif',
                    '"Libre Baskerville", serif',
                    '"Work Sans", sans-serif',
                    'Urbanist, sans-serif',
                    'Manrope, sans-serif',
                    'Zain, sans-serif',
                    'Genos, sans-serif',
                    'Tomorrow, sans-serif'
                  ].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Accent Color</Label>
                <Input type="color" value={config.theme_color || '#E1FF3F'} onChange={(e) => setConfig((c: any) => ({ ...c, theme_color: e.target.value }))} className="alera-form-input" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="mt-4 alera-surface">
            <CardHeader><CardTitle>Live Preview (Unsaved changes)</CardTitle></CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="w-full min-h-[800px] bg-black">
                  <LandingPage config={{ ...(config || {}), theme }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="mt-4 alera-surface ">
            <CardHeader><CardTitle>Social & Contact</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Instagram</Label>
                <Input value={config.social_links?.instagram || ''} onChange={(e) => setConfig((c: any) => ({ ...c, social_links: { ...(c.social_links || {}), instagram: e.target.value } }))} className="alera-form-input" />
              </div>
              <div>
                <Label>TikTok</Label>
                <Input value={config.social_links?.tiktok || ''} onChange={(e) => setConfig((c: any) => ({ ...c, social_links: { ...(c.social_links || {}), tiktok: e.target.value } }))} className="alera-form-input" />
              </div>
              <div>
                <Label>Twitter</Label>
                <Input value={config.social_links?.twitter || ''} onChange={(e) => setConfig((c: any) => ({ ...c, social_links: { ...(c.social_links || {}), twitter: e.target.value } }))} className="alera-form-input" />
              </div>

              <div className="md:col-span-3 h-px bg-muted my-2" />

              <div>
                <Label>Contact Email</Label>
                <Input value={config.contact_info?.email || ''} onChange={(e) => setConfig((c: any) => ({ ...c, contact_info: { ...(c.contact_info || {}), email: e.target.value, management: c.contact_info?.management || { name: '', email: '', phone: '' } } }))} className="alera-form-input" />
              </div>
              <div>
                <Label>Manager Name</Label>
                <Input value={config.contact_info?.management?.name || ''} onChange={(e) => setConfig((c: any) => ({ ...c, contact_info: { ...(c.contact_info || {}), management: { ...(c.contact_info?.management || {}), name: e.target.value } } }))} className="alera-form-input" />
              </div>
              <div>
                <Label>Manager Email</Label>
                <Input value={config.contact_info?.management?.email || ''} onChange={(e) => setConfig((c: any) => ({ ...c, contact_info: { ...(c.contact_info || {}), management: { ...(c.contact_info?.management || {}), email: e.target.value } } }))} className="alera-form-input" />
              </div>
              <div>
                <Label>Manager Phone</Label>
                <Input value={config.contact_info?.management?.phone || ''} onChange={(e) => setConfig((c: any) => ({ ...c, contact_info: { ...(c.contact_info || {}), management: { ...(c.contact_info?.management || {}), phone: e.target.value } } }))} className="alera-form-input" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}


