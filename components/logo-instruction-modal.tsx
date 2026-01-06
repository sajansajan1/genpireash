import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Image } from "lucide-react";

interface LogoInstructionModalProps {
  open: boolean;
  onClose: () => void;
}

const LogoInstructionModal: React.FC<LogoInstructionModalProps> = ({ open, onClose }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md w-full mx-2 sm:mx-auto rounded-xl p-6 bg-white shadow-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-lg font-semibold text-black flex items-center justify-start gap-2">
            <Image className="w-5 h-5 text-black" />
            Upload an image to use in your product
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="mt-3 text-black text-sm leading-relaxed">
              <p>You can upload JPG or PNG (up to 4MB).</p>

              <p className="mt-3">After uploading, add a short instruction in your prompt — for example:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-black">
                <li>“Place this logo on the front of the product”</li>
                <li>“Use this pattern across the full surface”</li>
                <li>“Add a small embossed version on the back”</li>
              </ul>

              <p className="italic mt-3 text-black">💡 Tip: use a clear, high-quality image for best results.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex justify-center">
          <AlertDialogCancel
            onClick={() => onclose}
            className="px-6 py-2 rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            Got it
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoInstructionModal;
