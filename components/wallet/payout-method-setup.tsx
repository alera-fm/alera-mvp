"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Banknote, Wallet as WalletIcon, Edit, Building2, AlertTriangle, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { getPayoutMethod, savePayoutMethod } from "@/lib/wallet-api"

interface PayoutMethodSetupProps {
  artistId: string
  onPayoutMethodSet?: (method: any) => void
}

interface PayoutFormData {
  method: string
  // PayPal fields
  paypal_email?: string
  // Bank Transfer fields
  account_holder_name?: string
  bank_name?: string
  account_number?: string
  iban?: string
  swift_bic?: string
  country?: string
  // Crypto fields
  wallet_address?: string
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
  'Australia', 'New Zealand', 'Japan', 'Singapore', 'Other'
]

export function PayoutMethodSetup({ artistId, onPayoutMethodSet }: PayoutMethodSetupProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PayoutFormData>({ method: "" })
  const [currentPayoutMethod, setCurrentPayoutMethod] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showFeesDisclaimer, setShowFeesDisclaimer] = useState(false)
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false)

  useEffect(() => {
    fetchCurrentPayoutMethod()
  }, [artistId])

  const fetchCurrentPayoutMethod = async () => {
    try {
      const data = await getPayoutMethod(artistId)
      setCurrentPayoutMethod(data)
    } catch (error) {
      console.error('Error fetching payout method:', error)
      setCurrentPayoutMethod(null)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ method: "" })
    setAcceptedDisclaimer(false)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateTRC20Address = (address: string) => {
    // TRC20 addresses start with 'T' and are 34 characters long
    const trc20Regex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/
    return trc20Regex.test(address)
  }

  const validateForm = () => {
    const { method } = formData

    if (!method) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return false
    }

    if (!acceptedDisclaimer) {
      toast({
        title: "Disclaimer Required",
        description: "Please read and accept the fees disclaimer",
        variant: "destructive"
      })
      return false
    }

    switch (method) {
      case 'PayPal':
        if (!formData.paypal_email) {
          toast({
            title: "Missing Information",
            description: "Please provide your PayPal email address",
            variant: "destructive"
          })
          return false
        }
        if (!validateEmail(formData.paypal_email)) {
          toast({
            title: "Invalid Email",
            description: "Please provide a valid email address",
            variant: "destructive"
          })
          return false
        }
        break

      case 'Bank Transfer':
        const requiredBankFields = ['account_holder_name', 'bank_name', 'account_number', 'swift_bic', 'country']
        for (const field of requiredBankFields) {
          if (!formData[field as keyof PayoutFormData]) {
            toast({
              title: "Missing Information",
              description: `Please provide ${field.replace('_', ' ')}`,
              variant: "destructive"
            })
            return false
          }
        }
        break

      case 'Crypto (USDT - TRC20)':
        if (!formData.wallet_address) {
          toast({
            title: "Missing Information",
            description: "Please provide your TRC20 wallet address",
            variant: "destructive"
          })
          return false
        }
        if (!validateTRC20Address(formData.wallet_address)) {
          toast({
            title: "Invalid Wallet Address",
            description: "Please provide a valid TRC20 wallet address (starts with 'T' and is 34 characters long)",
            variant: "destructive"
          })
          return false
        }
        break
    }

    return true
  }

  const handleSavePayoutMethod = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await savePayoutMethod({
        artist_id: artistId,
        method: formData.method,
        account_info: JSON.stringify(formData)
      })

      toast({
        title: "Payout Method Saved",
        description: "Your payout method has been saved successfully",
      })

      await fetchCurrentPayoutMethod()
      setIsDialogOpen(false)
      resetForm()

      if (onPayoutMethodSet) {
        onPayoutMethodSet({ method: formData.method })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payout method",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPayoutMethodIcon = (methodType: string) => {
    switch (methodType) {
      case 'PayPal':
        return <CreditCard className="h-5 w-5" />
      case 'Bank Transfer':
        return <Building2 className="h-5 w-5" />
      case 'Crypto (USDT - TRC20)':
        return <WalletIcon className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const renderMethodFields = () => {
    switch (formData.method) {
      case 'PayPal':
        return (
          <div className="grid gap-2">
            <Label htmlFor="paypal_email">PayPal Email Address *</Label>
            <Input
              id="paypal_email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.paypal_email || ''}
              onChange={(e) => setFormData({ ...formData, paypal_email: e.target.value })}
            />
          </div>
        )

      case 'Bank Transfer':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="account_holder_name">Account Holder Name *</Label>
              <Input
                id="account_holder_name"
                placeholder="Full name as on bank account"
                value={formData.account_holder_name || ''}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                placeholder="Name of your bank"
                value={formData.bank_name || ''}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                placeholder="Your account number"
                value={formData.account_number || ''}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iban">IBAN (if applicable)</Label>
              <Input
                id="iban"
                placeholder="International Bank Account Number"
                value={formData.iban || ''}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="swift_bic">SWIFT/BIC Code *</Label>
              <Input
                id="swift_bic"
                placeholder="Bank's SWIFT/BIC code"
                value={formData.swift_bic || ''}
                onChange={(e) => setFormData({ ...formData, swift_bic: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country || ''} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'Crypto (USDT - TRC20)':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="wallet_address">TRC20 Wallet Address *</Label>
              <Input
                id="wallet_address"
                placeholder="T..."
                value={formData.wallet_address || ''}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Please double-check your wallet address. Payments sent to incorrect or incompatible addresses cannot be recovered.
              </p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  const FeesDisclaimer = () => (
    <Dialog open={showFeesDisclaimer} onOpenChange={setShowFeesDisclaimer}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400">
          <ExternalLink className="h-3 w-3 mr-1" />
          View Fees & Responsibility Disclaimer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Payout Fees & Responsibility Disclaimer
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm">
            By adding a payout method, you acknowledge and agree to the following:
          </p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">PayPal:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Standard PayPal transfer fees will apply (typically 2.9% + fixed fee + currency conversion fees if applicable). These fees will be deducted from your payout automatically.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Bank Transfers:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bank transfer fees vary by bank and country. You are responsible for any bank or wire transfer fees. We recommend using this option for larger payouts to minimize fees.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Crypto (USDT - TRC-20 via TRON Network):</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Minimal network fees apply (usually under $1). You must provide a correct TRC-20 compatible wallet address. ALERA is not responsible for any losses caused by incorrect wallet addresses or incompatible networks.
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Important: You are responsible for any fees charged by payment providers. ALERA does not cover third-party payment or network fees.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payout Method</label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payout Method</label>
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {currentPayoutMethod?.method ? (
          <>
            {getPayoutMethodIcon(currentPayoutMethod.method)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {currentPayoutMethod.method}
                </span>
                {currentPayoutMethod.status === 'rejected' && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                    Rejected
                  </span>
                )}
                {currentPayoutMethod.status === 'pending' && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    Pending
                  </span>
                )}
                {currentPayoutMethod.status === 'approved' && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Approved
                  </span>
                )}
              </div>
              {currentPayoutMethod.account_info_masked && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPayoutMethod.account_info_masked}
                </div>
              )}
              {currentPayoutMethod.status === 'rejected' && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  This method was rejected. Please add a new valid method.
                </div>
              )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button 
                  variant={currentPayoutMethod.status === 'rejected' ? "destructive" : "outline"} 
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {currentPayoutMethod.status === 'rejected' ? 'Replace' : 'Edit'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Update Payout Method</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={formData.method} onValueChange={(value) => setFormData({ method: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Crypto (USDT - TRC20)">Crypto (USDT - TRC20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.method && renderMethodFields()}
                  
                  {formData.method && (
                    <div className="space-y-3">
                      <FeesDisclaimer />
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="disclaimer" 
                          checked={acceptedDisclaimer}
                          onCheckedChange={setAcceptedDisclaimer}
                        />
                        <label htmlFor="disclaimer" className="text-sm text-gray-600 dark:text-gray-400">
                          I have read and accept the fees & responsibility disclaimer
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSavePayoutMethod}
                    disabled={isSubmitting || !formData.method}
                    className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                  >
                    {isSubmitting ? "Saving..." : "Update Payout Method"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400 flex-1">No payout method set</span>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Set Up Payout Method</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={formData.method} onValueChange={(value) => setFormData({ method: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Crypto (USDT - TRC20)">Crypto (USDT - TRC20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.method && renderMethodFields()}
                  
                  {formData.method && (
                    <div className="space-y-3">
                      <FeesDisclaimer />
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="disclaimer" 
                          checked={acceptedDisclaimer}
                          onCheckedChange={setAcceptedDisclaimer}
                        />
                        <label htmlFor="disclaimer" className="text-sm text-gray-600 dark:text-gray-400">
                          I have read and accept the fees & responsibility disclaimer
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSavePayoutMethod}
                    disabled={isSubmitting || !formData.method}
                    className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                  >
                    {isSubmitting ? "Saving..." : "Save Payout Method"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
