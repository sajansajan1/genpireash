import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { TechFileData } from "@/app/actions/get-tech-files";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProductImages {
  front: string;
  back: string | null;
  side?: string | null;
  bottom?: string | null;
  top?: string | null;
}

export interface TechFilesData {
  sketches: TechFileData[];
  closeups: TechFileData[];
  components: TechFileData[];
  baseViews: TechFileData[];
  flatSketches: TechFileData[];
  assemblyView: TechFileData | null;
}

export type ProductStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "in_production"
  | "completed"
  | "archived";

export interface ProductMetadataFields {
  sku: string | null;
  referenceNumber: string | null;
  targetConsumerPriceUsd: number | null;
  status: ProductStatus;
}

export interface ProductPageState {
  // ============================================
  // CORE DATA
  // ============================================
  projectId: string | null;
  techPackData: any | null;
  techPack: any | null;
  productImages: ProductImages;
  techFilesData: TechFilesData | null;
  multiViewRevisions: any[];
  selectedRevisionId: string | null;
  isPublic: boolean;

  // Product metadata fields (editable from product page)
  productMetadata: ProductMetadataFields;

  // ============================================
  // UI STATE
  // ============================================
  activeTab: string;
  selectedSection: string | null;
  selectedTechFileGuide: TechFileData | null;
  recentlyUpdatedSections: string[];

  // ============================================
  // PANEL VISIBILITY
  // ============================================
  isChatOpen: boolean;
  isMobileChatOpen: boolean;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isAIPromptOpen: boolean;
  showImageEditor: boolean;

  // ============================================
  // LOADING STATES
  // ============================================
  isLoading: boolean;
  isGeneratingImages: boolean;
  isGeneratingTechPack: boolean;
  techFilesLoading: boolean;
  pdfLoader: boolean;
  printFileLoader: boolean;
  productFilesLoader: boolean;
  excelLoader: boolean;
  svgLoader: boolean;

  // ============================================
  // GENERATION FLAGS
  // ============================================
  autoGenerateTriggered: boolean;
  techPackGenerated: boolean;
  initialGenerationPrompt: string;
}

export interface ProductPageActions {
  // ============================================
  // CORE DATA ACTIONS
  // ============================================
  setProjectId: (id: string | null) => void;
  setTechPackData: (data: any) => void;
  setTechPack: (data: any) => void;
  updateTechPack: (updates: Partial<any>) => void;
  setProductImages: (images: ProductImages) => void;
  updateProductImage: (key: keyof ProductImages, url: string | null) => void;
  setTechFilesData: (data: TechFilesData | null) => void;
  setMultiViewRevisions: (revisions: any[]) => void;
  setSelectedRevisionId: (id: string | null) => void;
  setIsPublic: (isPublic: boolean) => void;
  setProductMetadata: (metadata: Partial<ProductMetadataFields>) => void;
  updateProductMetadataField: <K extends keyof ProductMetadataFields>(
    key: K,
    value: ProductMetadataFields[K]
  ) => void;

  // ============================================
  // UI STATE ACTIONS
  // ============================================
  setActiveTab: (tab: string) => void;
  setSelectedSection: (section: string | null) => void;
  setSelectedTechFileGuide: (file: TechFileData | null) => void;
  addRecentlyUpdatedSection: (section: string) => void;
  removeRecentlyUpdatedSection: (section: string) => void;
  clearRecentlyUpdatedSections: () => void;

  // ============================================
  // PANEL VISIBILITY ACTIONS
  // ============================================
  toggleChat: () => void;
  setIsChatOpen: (open: boolean) => void;
  toggleMobileChat: () => void;
  setIsMobileChatOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsAIPromptOpen: (open: boolean) => void;
  setShowImageEditor: (show: boolean) => void;

  // ============================================
  // LOADING STATE ACTIONS
  // ============================================
  setIsLoading: (loading: boolean) => void;
  setIsGeneratingImages: (generating: boolean) => void;
  setIsGeneratingTechPack: (generating: boolean) => void;
  setTechFilesLoading: (loading: boolean) => void;
  setPdfLoader: (loading: boolean) => void;
  setPrintFileLoader: (loading: boolean) => void;
  setProductFilesLoader: (loading: boolean) => void;
  setExcelLoader: (loading: boolean) => void;
  setSvgLoader: (loading: boolean) => void;

  // ============================================
  // GENERATION FLAG ACTIONS
  // ============================================
  setAutoGenerateTriggered: (triggered: boolean) => void;
  setTechPackGenerated: (generated: boolean) => void;
  setInitialGenerationPrompt: (prompt: string) => void;

  // ============================================
  // UTILITY ACTIONS
  // ============================================
  reset: () => void;
  initializeFromProductData: (productData: any) => void;
}

type ProductPageStore = ProductPageState & ProductPageActions;

// ============================================
// DEFAULT STATE
// ============================================

const defaultProductImages: ProductImages = {
  front: "/placeholder.svg?height=400&width=300&text=Front+View",
  back: null,
  side: "/placeholder.svg?height=400&width=300&text=Side+View",
  bottom: "/placeholder.svg?height=400&width=300&text=Bottom+View",
  top: "/placeholder.svg?height=400&width=300&text=Top+View",
};

const defaultProductMetadata: ProductMetadataFields = {
  sku: null,
  referenceNumber: null,
  targetConsumerPriceUsd: null,
  status: "draft",
};

const initialState: ProductPageState = {
  // Core data
  projectId: null,
  techPackData: null,
  techPack: null,
  productImages: defaultProductImages,
  techFilesData: null,
  multiViewRevisions: [],
  selectedRevisionId: null,
  isPublic: false,
  productMetadata: defaultProductMetadata,

  // UI state
  activeTab: "visual",
  selectedSection: null,
  selectedTechFileGuide: null,
  recentlyUpdatedSections: [],

  // Panel visibility
  isChatOpen: true,
  isMobileChatOpen: false,
  isSidebarCollapsed: true,
  isMobileMenuOpen: false,
  isAIPromptOpen: true,
  showImageEditor: false,

  // Loading states
  isLoading: true,
  isGeneratingImages: false,
  isGeneratingTechPack: false,
  techFilesLoading: false,
  pdfLoader: false,
  printFileLoader: false,
  productFilesLoader: false,
  excelLoader: false,
  svgLoader: false,

  // Generation flags
  autoGenerateTriggered: false,
  techPackGenerated: false,
  initialGenerationPrompt: "",
};

// ============================================
// STORE CREATION
// ============================================

export const useProductPageStore = create<ProductPageStore>((set, get) => ({
  ...initialState,

  // ============================================
  // CORE DATA ACTIONS
  // ============================================
  setProjectId: (id) => set({ projectId: id }),

  setTechPackData: (data) => set({ techPackData: data }),

  setTechPack: (data) => set({ techPack: data }),

  updateTechPack: (updates) =>
    set((state) => ({
      techPack: state.techPack ? { ...state.techPack, ...updates } : updates,
    })),

  setProductImages: (images) => set({ productImages: images }),

  updateProductImage: (key, url) =>
    set((state) => ({
      productImages: { ...state.productImages, [key]: url },
    })),

  setTechFilesData: (data) => set({ techFilesData: data }),

  setMultiViewRevisions: (revisions) => set({ multiViewRevisions: revisions }),

  setSelectedRevisionId: (id) => set({ selectedRevisionId: id }),

  setIsPublic: (isPublic) => set({ isPublic }),

  setProductMetadata: (metadata) =>
    set((state) => ({
      productMetadata: { ...state.productMetadata, ...metadata },
    })),

  updateProductMetadataField: (key, value) =>
    set((state) => ({
      productMetadata: { ...state.productMetadata, [key]: value },
    })),

  // ============================================
  // UI STATE ACTIONS
  // ============================================
  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedSection: (section) => set({ selectedSection: section }),

  setSelectedTechFileGuide: (file) => set({ selectedTechFileGuide: file }),

  addRecentlyUpdatedSection: (section) =>
    set((state) => {
      if (state.recentlyUpdatedSections.includes(section)) {
        return state;
      }
      return {
        recentlyUpdatedSections: [...state.recentlyUpdatedSections, section],
      };
    }),

  removeRecentlyUpdatedSection: (section) =>
    set((state) => ({
      recentlyUpdatedSections: state.recentlyUpdatedSections.filter((s) => s !== section),
    })),

  clearRecentlyUpdatedSections: () => set({ recentlyUpdatedSections: [] }),

  // ============================================
  // PANEL VISIBILITY ACTIONS
  // ============================================
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  setIsChatOpen: (open) => set({ isChatOpen: open }),

  toggleMobileChat: () =>
    set((state) => ({ isMobileChatOpen: !state.isMobileChatOpen })),

  setIsMobileChatOpen: (open) => set({ isMobileChatOpen: open }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setIsSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setIsAIPromptOpen: (open) => set({ isAIPromptOpen: open }),

  setShowImageEditor: (show) => set({ showImageEditor: show }),

  // ============================================
  // LOADING STATE ACTIONS
  // ============================================
  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsGeneratingImages: (generating) =>
    set({ isGeneratingImages: generating }),

  setIsGeneratingTechPack: (generating) =>
    set({ isGeneratingTechPack: generating }),

  setTechFilesLoading: (loading) => set({ techFilesLoading: loading }),

  setPdfLoader: (loading) => set({ pdfLoader: loading }),

  setPrintFileLoader: (loading) => set({ printFileLoader: loading }),

  setProductFilesLoader: (loading) => set({ productFilesLoader: loading }),

  setExcelLoader: (loading) => set({ excelLoader: loading }),

  setSvgLoader: (loading) => set({ svgLoader: loading }),

  // ============================================
  // GENERATION FLAG ACTIONS
  // ============================================
  setAutoGenerateTriggered: (triggered) =>
    set({ autoGenerateTriggered: triggered }),

  setTechPackGenerated: (generated) => set({ techPackGenerated: generated }),

  setInitialGenerationPrompt: (prompt) =>
    set({ initialGenerationPrompt: prompt }),

  // ============================================
  // UTILITY ACTIONS
  // ============================================
  reset: () => set(initialState),

  initializeFromProductData: (productData) => {
    if (!productData) return;

    const {
      image_data,
      tech_pack,
      selected_revision_id,
      is_public,
      sku,
      reference_number,
      target_consumer_price_usd,
      status,
    } = productData;

    set({
      techPackData: productData,
      selectedRevisionId: selected_revision_id || null,
      isPublic: is_public || false,
      productMetadata: {
        sku: sku || null,
        referenceNumber: reference_number || null,
        targetConsumerPriceUsd: target_consumer_price_usd || null,
        status: status || "draft",
      },
    });

    if (image_data) {
      set({
        productImages: {
          front:
            image_data.front?.url ||
            "/placeholder.svg?height=400&width=300&text=Front+View",
          back: image_data.back?.url || null,
          side: image_data.side?.url || null,
          bottom: image_data.bottom?.url || null,
          top: image_data.top?.url || null,
        },
      });
    }

    if (tech_pack) {
      set({
        techPack: tech_pack,
        techPackGenerated: !!tech_pack.productName,
      });
    }
  },
}));

// ============================================
// SELECTOR HOOKS FOR OPTIMIZED RE-RENDERS
// ============================================

// Core data selectors
export const useProjectId = () =>
  useProductPageStore((state) => state.projectId);
export const useTechPackData = () =>
  useProductPageStore((state) => state.techPackData);
export const useTechPack = () =>
  useProductPageStore((state) => state.techPack);
export const useProductImages = () =>
  useProductPageStore((state) => state.productImages);
export const useTechFilesData = () =>
  useProductPageStore((state) => state.techFilesData);
export const useMultiViewRevisions = () =>
  useProductPageStore((state) => state.multiViewRevisions);
export const useSelectedRevisionId = () =>
  useProductPageStore((state) => state.selectedRevisionId);
export const useIsPublic = () =>
  useProductPageStore((state) => state.isPublic);
export const useProductMetadata = () =>
  useProductPageStore((state) => state.productMetadata);

// UI state selectors
export const useActiveTab = () =>
  useProductPageStore((state) => state.activeTab);
export const useSelectedSection = () =>
  useProductPageStore((state) => state.selectedSection);
export const useSelectedTechFileGuide = () =>
  useProductPageStore((state) => state.selectedTechFileGuide);
export const useRecentlyUpdatedSections = () =>
  useProductPageStore((state) => state.recentlyUpdatedSections);

// Panel visibility selectors
export const useIsChatOpen = () =>
  useProductPageStore((state) => state.isChatOpen);
export const useIsMobileChatOpen = () =>
  useProductPageStore((state) => state.isMobileChatOpen);
export const useIsSidebarCollapsed = () =>
  useProductPageStore((state) => state.isSidebarCollapsed);
export const useIsMobileMenuOpen = () =>
  useProductPageStore((state) => state.isMobileMenuOpen);
export const useIsAIPromptOpen = () =>
  useProductPageStore((state) => state.isAIPromptOpen);
export const useShowImageEditor = () =>
  useProductPageStore((state) => state.showImageEditor);

// Loading state selectors
export const useIsLoading = () =>
  useProductPageStore((state) => state.isLoading);
export const useIsGeneratingImages = () =>
  useProductPageStore((state) => state.isGeneratingImages);
export const useIsGeneratingTechPack = () =>
  useProductPageStore((state) => state.isGeneratingTechPack);
export const useTechFilesLoading = () =>
  useProductPageStore((state) => state.techFilesLoading);
export const usePdfLoader = () =>
  useProductPageStore((state) => state.pdfLoader);
export const usePrintFileLoader = () =>
  useProductPageStore((state) => state.printFileLoader);
export const useProductFilesLoader = () =>
  useProductPageStore((state) => state.productFilesLoader);
export const useExcelLoader = () =>
  useProductPageStore((state) => state.excelLoader);

// Generation flag selectors
export const useAutoGenerateTriggered = () =>
  useProductPageStore((state) => state.autoGenerateTriggered);
export const useTechPackGenerated = () =>
  useProductPageStore((state) => state.techPackGenerated);
export const useInitialGenerationPrompt = () =>
  useProductPageStore((state) => state.initialGenerationPrompt);

// Combined selectors for common use cases (using useShallow to prevent re-renders)
export const useDownloadLoaders = () =>
  useProductPageStore(useShallow((state) => ({
    pdfLoader: state.pdfLoader,
    printFileLoader: state.printFileLoader,
    productFilesLoader: state.productFilesLoader,
    excelLoader: state.excelLoader,
    svgLoader: state.svgLoader,
  })));

export const usePanelVisibility = () =>
  useProductPageStore(useShallow((state) => ({
    isChatOpen: state.isChatOpen,
    isMobileChatOpen: state.isMobileChatOpen,
    isSidebarCollapsed: state.isSidebarCollapsed,
    isMobileMenuOpen: state.isMobileMenuOpen,
    isAIPromptOpen: state.isAIPromptOpen,
    showImageEditor: state.showImageEditor,
  })));

export const useProductCoreData = () =>
  useProductPageStore(useShallow((state) => ({
    projectId: state.projectId,
    techPackData: state.techPackData,
    techPack: state.techPack,
    productImages: state.productImages,
    techFilesData: state.techFilesData,
  })));

// Action selectors (using useShallow to prevent infinite loops)
export const useProductPageActions = () =>
  useProductPageStore(useShallow((state) => ({
    // Core data
    setProjectId: state.setProjectId,
    setTechPackData: state.setTechPackData,
    setTechPack: state.setTechPack,
    updateTechPack: state.updateTechPack,
    setProductImages: state.setProductImages,
    updateProductImage: state.updateProductImage,
    setTechFilesData: state.setTechFilesData,
    setMultiViewRevisions: state.setMultiViewRevisions,
    setSelectedRevisionId: state.setSelectedRevisionId,
    setIsPublic: state.setIsPublic,
    setProductMetadata: state.setProductMetadata,
    updateProductMetadataField: state.updateProductMetadataField,
    // UI state
    setActiveTab: state.setActiveTab,
    setSelectedSection: state.setSelectedSection,
    setSelectedTechFileGuide: state.setSelectedTechFileGuide,
    addRecentlyUpdatedSection: state.addRecentlyUpdatedSection,
    removeRecentlyUpdatedSection: state.removeRecentlyUpdatedSection,
    clearRecentlyUpdatedSections: state.clearRecentlyUpdatedSections,
    // Panel visibility
    toggleChat: state.toggleChat,
    setIsChatOpen: state.setIsChatOpen,
    toggleMobileChat: state.toggleMobileChat,
    setIsMobileChatOpen: state.setIsMobileChatOpen,
    toggleSidebar: state.toggleSidebar,
    setIsSidebarCollapsed: state.setIsSidebarCollapsed,
    toggleMobileMenu: state.toggleMobileMenu,
    setIsMobileMenuOpen: state.setIsMobileMenuOpen,
    setIsAIPromptOpen: state.setIsAIPromptOpen,
    setShowImageEditor: state.setShowImageEditor,
    // Loading states
    setIsLoading: state.setIsLoading,
    setIsGeneratingImages: state.setIsGeneratingImages,
    setIsGeneratingTechPack: state.setIsGeneratingTechPack,
    setTechFilesLoading: state.setTechFilesLoading,
    setPdfLoader: state.setPdfLoader,
    setPrintFileLoader: state.setPrintFileLoader,
    setProductFilesLoader: state.setProductFilesLoader,
    setExcelLoader: state.setExcelLoader,
    setSvgLoader: state.setSvgLoader,
    // Generation flags
    setAutoGenerateTriggered: state.setAutoGenerateTriggered,
    setTechPackGenerated: state.setTechPackGenerated,
    setInitialGenerationPrompt: state.setInitialGenerationPrompt,
    // Utility
    reset: state.reset,
    initializeFromProductData: state.initializeFromProductData,
  })));
