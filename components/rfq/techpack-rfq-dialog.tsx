"use client"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SharedRFQForm } from "./shared-rfq-form"

interface TechpackRFQDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  techpack: any
}

export function TechpackRFQDialog({ open, onOpenChange, techpack }: TechpackRFQDialogProps) {
  const router = useRouter()

  const handleSubmit = (data: any) => {
    // In a real app, this would be an API cal
    // Show success message
    toast({
      title: data.saveAsDraft ? "Draft saved" : "RFQ sent successfully",
      description: data.saveAsDraft
        ? "Your RFQ draft has been saved."
        : `Your RFQ "${data.title}" has been sent to ${data.selectedSuppliers.length} supplier(s).`,
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
          <DialogTitle>Request Quotes for Your Tech Pack</DialogTitle>
          <DialogDescription>
            Send a request for quote to suppliers based on your tech pack specifications.
          </DialogDescription>
        </DialogHeader>

        <SharedRFQForm onSubmit={handleSubmit} initialTechPack={techpack} isDialog={true} />
      </DialogContent>
    </Dialog>
  )
}
