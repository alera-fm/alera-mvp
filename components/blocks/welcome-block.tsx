"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface WelcomeBlockProps {
  title?: string
  description?: string
  buttonText?: string
  themeColor?: string
  textColor?: string
  artistName?: string
  paymentLink?: string
}

export default function WelcomeBlock({ title = "Welcome", description = "Become a fan to subscribe and get updates.", buttonText = "Become a Fan", themeColor = "#E1FF3F", textColor = "#0B0B0F", artistName, paymentLink }: WelcomeBlockProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    country: "",
    gender: "",
    age: "",
    subscribed_status: "free",
  })

  return (
    <section className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md shadow-xl">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 h-1 w-full" style={{ background: `linear-gradient(to right, ${themeColor}, transparent)` }} />

      {/* Soft background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: themeColor }} />

      <div className="p-6 md:p-8">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'inherit' }}>{title}</h3>
        <p className="mt-2 text-base md:text-lg" style={{ color: 'inherit', opacity: 0.85 }}>{description}</p>
        <div className="mt-6">
        <button
          className="px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: themeColor, color: textColor }}
          onClick={() => setOpen(true)}
        >
          {buttonText}
        </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v)=>{ setOpen(v); if (!v) { setSuccessMessage(null) } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Become a Fan</DialogTitle>
            <DialogDescription>Enter your details to connect and show your support.</DialogDescription>
          </DialogHeader>
          {successMessage ? (
            <div className="py-4">
              <p className="text-sm leading-relaxed" style={{ color: 'inherit' }}>{successMessage}</p>
              <div className="mt-6 flex justify-end">
                <button className="px-5 py-2 rounded-full font-medium" style={{ backgroundColor: themeColor, color: 'white' }} onClick={()=>{ setOpen(false); setSuccessMessage(null) }}>Close</button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitting(true)
                try {
                  const slug = typeof window !== 'undefined' ? (window.location.pathname.split('/p/')[1] || '').split('/')[0] : ''
                  const payload = { ...formData }
                  const res = await fetch('/api/public/fans/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug, ...payload })
                  })
                  if (!res.ok) throw new Error('Failed')
                  setSubmitting(false)
                  setFormData({ name: '', email: '', phone_number: '', country: '', gender: '', age: '', subscribed_status: 'free' })
                  const nameForMsg = artistName || 'the artist'
                  setSuccessMessage(`Thanks for joining ${nameForMsg}! We're so glad to have you a part of their journey. They'll be in touch shortly with updates, exclusives and more via email.`)
                  if (formData.subscribed_status === 'paid' && paymentLink) {
                    window.open(paymentLink, '_blank')
                  }
                } catch {
                  setSubmitting(false)
                  alert('Could not add fan')
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e)=> setFormData((p)=>({ ...p, name: e.target.value }))} required disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e)=> setFormData((p)=>({ ...p, email: e.target.value }))} required disabled={submitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" value={formData.phone_number} onChange={(e)=> setFormData((p)=>({ ...p, phone_number: e.target.value }))} disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country} onChange={(e)=> setFormData((p)=>({ ...p, country: e.target.value }))} disabled={submitting} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender || 'not_specified'} onValueChange={(value)=> setFormData((p)=>({ ...p, gender: value==='not_specified' ? '' : value }))} disabled={submitting}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={formData.age} onChange={(e)=> setFormData((p)=>({ ...p, age: e.target.value }))} disabled={submitting} />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subscription Status</Label>
                  <Select value={formData.subscribed_status} onValueChange={(value)=> setFormData((p)=>({ ...p, subscribed_status: value }))} disabled={submitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-full border border-white/20" onClick={()=> setOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full font-medium" style={{ backgroundColor: themeColor, color: 'white' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Join Now'}</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}


