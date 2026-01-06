"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Sparkles } from "lucide-react";
import GenpireTourTutorialModal from "./genpire-editor-tutorial";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
interface GenpireEditorGuideProps {
  showGuideModal: boolean;
  setShowGuideModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const GenpireEditorGuideModal: React.FC<GenpireEditorGuideProps> = ({ showGuideModal, setShowGuideModal }) => {
  const [showTour, setShowTour] = useState(false);
  const { getCreatorCredits, refresCreatorCredits, loadingGetCreatorCredits, hasFetchedCreatorCredits } =
    useGetCreditsStore();

  const handleClose = () => {
    setShowGuideModal(false);
    const credits = getCreatorCredits?.credits ?? 0; // fallback if undefined
    if (credits > 1) {
      setTimeout(() => setShowTour(true), 400);
    }
  };
  return (
    <>
      <AlertDialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <AlertDialogContent
          className="w-[95vw] sm:w-[580px] md:w-[680px] lg:w-[720px] max-h-[90vh] overflow-y-auto scrollbar-hide
             bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl shadow-xl p-6"
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#18181B] dark:text-stone-200" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">
                  How to Get the Best Results with Genpire’s AI Editor
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Follow these quick tips to make your edits faster and more accurate
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Think in Prompts, Not Pixels</h3>
              <p>
                Genpire isn’t a graphic design tool — it’s an AI editor. Instead of dragging or drawing, simply describe
                your change in words (e.g., “make it in vegan leather” or “add my logo to the front pocket”).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Be Specific and Visual</h3>
              <p>
                The more detail you give, the better the AI understands. Try: “switch the color to matte black with gold
                accents” instead of just “change color.”
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Edit One Idea at a Time</h3>
              <p>
                Focus each prompt on one type of change — material, color, or placement — to get faster and more
                accurate results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Wait for It — It’s Thinking</h3>
              <p>
                AI edits take a moment to process. Depending on your request, results may appear within 60–120 seconds.
                Larger or more complex edits might take slightly longer.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Refine, Don’t Redesign</h3>
              <p>
                Use the AI editor to enhance your existing product — adjust textures, colors, or small design elements.
                For a brand-new concept, start a new generation instead of editing.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex justify-end mt-6">
            <AlertDialogCancel
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showTour && <GenpireTourTutorialModal onClose={() => setShowTour(false)} />}
    </>
  );
};

export default GenpireEditorGuideModal;
