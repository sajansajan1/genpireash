"use client"

import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SharedRFQForm } from "./shared-rfq-form"

interface SupplierRFQDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: any
}

export function SupplierRFQDialog({ open, onOpenChange, supplier }: SupplierRFQDialogProps) {
  const router = useRouter()

  const handleSubmit = (data: any) => {
    // In a real app, this would be an API call

    // Show success message
    toast({
      title: data.saveAsDraft ? "Draft saved" : "RFQ sent successfully",
      description: data.saveAsDraft
        ? "Your RFQ draft has been saved."
        : `Your RFQ "${data.title}" has been sent to ${supplier.name}.`,
    })

    // Close dialog
    onOpenChange(false)

    // Navigate to RFQs page if not a draft
    if (!data.saveAsDraft) {
      router.push("/creator-dashboard/rfqs")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Request Quote from {supplier.name}</DialogTitle>
          <DialogDescription>
            Send a direct request for quote to this supplier based on your product specifications.
          </DialogDescription>
        </DialogHeader>

        <SharedRFQForm onSubmit={handleSubmit} targetSupplier={supplier} isDialog={true} />
      </DialogContent>
    </Dialog>
  )
}
