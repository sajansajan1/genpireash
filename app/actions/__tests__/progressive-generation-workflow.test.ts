/**
 * Unit tests for progressive-generation-workflow server actions
 *
 * Tests cover:
 * - Front view generation (initial and edit)
 * - Front view approval/rejection
 * - Remaining views generation
 * - Revision creation
 * - Credit system (reservation, consumption, refunds)
 * - Error scenarios
 * - Edge cases
 */

import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
  createRevisionAfterApproval,
  type GenerateFrontViewOnlyParams,
  type HandleFrontViewDecisionParams,
  type GenerateRemainingViewsParams,
  type CreateRevisionAfterApprovalParams,
  type ExtractedFeatures,
} from "../progressive-generation-workflow";
import { createClient } from "@/lib/supabase/server";
import { GeminiImageService } from "@/lib/ai/gemini";
import { ImageService } from "@/lib/services/image-service";
import { ReserveCredits, RefundCredits, DeductCredits } from "@/lib/supabase/payments";
import OpenAI from "openai";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/ai/gemini");
jest.mock("@/lib/services/image-service");
jest.mock("@/lib/supabase/payments");
jest.mock("openai");
jest.mock("@/lib/logging/ai-logger", () => ({
  aiLogger: {
    startOperation: jest.fn(() => ({
      setInput: jest.fn(),
      setContext: jest.fn(),
      setOutput: jest.fn(),
      setError: jest.fn(),
      complete: jest.fn(),
    })),
  },
}));

// Mock data
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockProductId = "product-123";
const mockSessionId = "session-123";
const mockApprovalId = "approval-123";
const mockFrontViewUrl = "https://example.com/front.jpg";
const mockImageUrls = {
  front: "https://example.com/front.jpg",
  back: "https://example.com/back.jpg",
  side: "https://example.com/side.jpg",
  top: "https://example.com/top.jpg",
  bottom: "https://example.com/bottom.jpg",
};

const mockExtractedFeatures: ExtractedFeatures = {
  colors: [
    { hex: "#000000", name: "Black", usage: "Main body" },
    { hex: "#FFFFFF", name: "White", usage: "Accent" },
  ],
  estimatedDimensions: { width: "10cm", height: "15cm", depth: "5cm" },
  materials: ["Plastic", "Metal"],
  keyElements: ["Rounded corners", "Textured surface"],
  description: "Modern wireless headphones with sleek design",
};

describe("Progressive Generation Workflow", () => {
  let mockSupabase: any;
  let mockGeminiService: any;
  let mockImageService: any;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    // Setup Gemini service mock
    mockGeminiService = {
      generateImage: jest.fn().mockResolvedValue({ url: mockFrontViewUrl }),
    };
    (GeminiImageService as jest.Mock).mockImplementation(() => mockGeminiService);

    // Setup ImageService mock
    mockImageService = {
      upload: jest.fn().mockResolvedValue({
        success: true,
        url: mockFrontViewUrl,
      }),
    };
    ImageService.getInstance = jest.fn().mockReturnValue(mockImageService);

    // Setup OpenAI mock
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify(mockExtractedFeatures),
                },
              },
            ],
          }),
        },
      },
    };
    (OpenAI as jest.Mock).mockImplementation(() => mockOpenAI);

    // Setup credit mocks
    (ReserveCredits as jest.Mock).mockResolvedValue({
      success: true,
      reservationId: "reservation-123",
    });
    (RefundCredits as jest.Mock).mockResolvedValue({ success: true });
    (DeductCredits as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("generateFrontViewOnly", () => {
    describe("Happy path scenarios", () => {
      it("should generate front view for initial generation", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: {
            id: mockApprovalId,
            front_view_url: mockFrontViewUrl,
            iteration_number: 1,
          },
          error: null,
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Modern wireless headphones",
          isEdit: false,
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(true);
        expect(result.frontViewUrl).toBe(mockFrontViewUrl);
        expect(result.approvalId).toBe(mockApprovalId);
        expect(result.creditsReserved).toBe(3);
        expect(ReserveCredits).toHaveBeenCalledWith({ credit: 3 });
        expect(mockGeminiService.generateImage).toHaveBeenCalledWith(
          expect.objectContaining({
            view: "front",
            style: "photorealistic",
          })
        );
      });

      it("should generate front view for edit with 2 credits", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: mockApprovalId },
          error: null,
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Make it blue",
          isEdit: true,
          previousFrontViewUrl: mockFrontViewUrl,
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(true);
        expect(result.creditsReserved).toBe(2);
        expect(ReserveCredits).toHaveBeenCalledWith({ credit: 2 });
      });

      it("should use provided sessionId if given", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: mockApprovalId, session_id: mockSessionId },
          error: null,
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
          sessionId: mockSessionId,
        };

        const result = await generateFrontViewOnly(params);

        expect(result.sessionId).toBe(mockSessionId);
      });
    });

    describe("Error scenarios", () => {
      it("should refund credits if generation fails", async () => {
        mockGeminiService.generateImage.mockRejectedValueOnce(
          new Error("Gemini API error")
        );

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Gemini API error");
        expect(RefundCredits).toHaveBeenCalledWith({
          credit: 3,
          reservationId: "reservation-123",
        });
      });

      it("should handle insufficient credits error", async () => {
        (ReserveCredits as jest.Mock).mockResolvedValueOnce({
          success: false,
          message: "Insufficient credits",
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Insufficient credits");
        expect(mockGeminiService.generateImage).not.toHaveBeenCalled();
      });

      it("should handle missing productId", async () => {
        const params: GenerateFrontViewOnlyParams = {
          productId: "",
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("required");
      });

      it("should handle unauthenticated user", async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: null },
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("not authenticated");
      });

      it("should refund credits if upload fails", async () => {
        mockImageService.upload.mockResolvedValueOnce({
          success: false,
          error: "Upload failed",
        });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(RefundCredits).toHaveBeenCalled();
      });

      it("should retry database operations on transient errors", async () => {
        mockSupabase.single
          .mockResolvedValueOnce({
            data: null,
            error: { message: "Server error 520" },
          })
          .mockResolvedValueOnce({
            data: { id: mockApprovalId },
            error: null,
          });

        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "Test product",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(true);
        expect(mockSupabase.insert).toHaveBeenCalledTimes(2);
      });
    });

    describe("Edge cases", () => {
      it("should handle empty prompt gracefully", async () => {
        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: "",
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("required");
      });

      it("should handle very long prompts", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: mockApprovalId },
          error: null,
        });

        const longPrompt = "a".repeat(5000);
        const params: GenerateFrontViewOnlyParams = {
          productId: mockProductId,
          userPrompt: longPrompt,
        };

        const result = await generateFrontViewOnly(params);

        expect(result.success).toBe(true);
        expect(mockGeminiService.generateImage).toHaveBeenCalled();
      });
    });
  });

  describe("handleFrontViewDecision", () => {
    const mockApprovalRecord = {
      id: mockApprovalId,
      user_id: mockUser.id,
      product_idea_id: mockProductId,
      session_id: mockSessionId,
      front_view_url: mockFrontViewUrl,
      front_view_prompt: "Original prompt",
      status: "pending",
      iteration_number: 1,
      credits_reserved: 3,
      is_initial_generation: true,
    };

    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: mockApprovalRecord,
        error: null,
      });
    });

    describe("Approval flow", () => {
      it("should handle front view approval", async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
          headers: new Map([["content-type", "image/jpeg"]]),
        } as any);

        mockSupabase.update.mockReturnThis();
        mockSupabase.eq.mockResolvedValueOnce({ error: null });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "approve",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(true);
        expect(result.action).toBe("approved");
        expect(result.extractedFeatures).toBeDefined();
        expect(mockSupabase.update).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "approved",
            extracted_features: expect.any(Object),
          })
        );
      });

      it("should extract features from approved front view", async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
          headers: new Map([["content-type", "image/jpeg"]]),
        } as any);

        mockSupabase.eq.mockResolvedValueOnce({ error: null });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "approve",
        };

        const result = await handleFrontViewDecision(params);

        expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
        expect(result.extractedFeatures).toEqual(mockExtractedFeatures);
      });
    });

    describe("Edit flow", () => {
      it("should handle edit request and regenerate front view", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockApprovalRecord, error: null })
          .mockResolvedValueOnce({
            data: {
              id: "approval-456",
              front_view_url: "https://example.com/new-front.jpg",
              iteration_number: 2,
            },
            error: null,
          });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "edit",
          editFeedback: "Make it blue",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(true);
        expect(result.action).toBe("regenerate");
        expect(result.newFrontViewUrl).toBeDefined();
        expect(result.newApprovalId).toBe("approval-456");
        expect(ReserveCredits).toHaveBeenCalledWith({ credit: 1 });
      });

      it("should mark previous approval as rejected on edit", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockApprovalRecord, error: null })
          .mockResolvedValueOnce({
            data: { id: "approval-456" },
            error: null,
          });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "edit",
          editFeedback: "Changes needed",
        };

        await handleFrontViewDecision(params);

        expect(mockSupabase.update).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "rejected",
            user_feedback: "Changes needed",
          })
        );
      });

      it("should increment iteration number on edit", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockApprovalRecord, error: null })
          .mockResolvedValueOnce({
            data: { id: "approval-456", iteration_number: 2 },
            error: null,
          });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "edit",
          editFeedback: "Make changes",
        };

        const result = await handleFrontViewDecision(params);

        expect(mockSupabase.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            iteration_number: 2,
            credits_reserved: 4, // 3 original + 1 iteration
          })
        );
      });

      it("should refund iteration credit if regeneration fails", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });
        mockGeminiService.generateImage.mockResolvedValueOnce({ url: null });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "edit",
          editFeedback: "Make changes",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(false);
        expect(RefundCredits).toHaveBeenCalledWith({
          credit: 1,
          reservationId: "reservation-123",
        });
      });
    });

    describe("Error scenarios", () => {
      it("should handle invalid action", async () => {
        const params: any = {
          approvalId: mockApprovalId,
          action: "invalid",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("must be 'approve' or 'edit'");
      });

      it("should handle missing approval ID", async () => {
        const params: HandleFrontViewDecisionParams = {
          approvalId: "",
          action: "approve",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("required");
      });

      it("should handle approval not found", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: null,
          error: { message: "Not found" },
        });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "approve",
        };

        const result = await handleFrontViewDecision(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("not found");
      });

      it("should handle feature extraction failure gracefully", async () => {
        mockOpenAI.chat.completions.create.mockRejectedValueOnce(
          new Error("OpenAI error")
        );
        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: HandleFrontViewDecisionParams = {
          approvalId: mockApprovalId,
          action: "approve",
        };

        const result = await handleFrontViewDecision(params);

        // Should still succeed with default features
        expect(result.success).toBe(true);
        expect(result.extractedFeatures).toBeDefined();
      });
    });
  });

  describe("generateRemainingViews", () => {
    const mockApprovalWithFeatures = {
      id: mockApprovalId,
      product_idea_id: mockProductId,
      session_id: mockSessionId,
      status: "approved",
      extracted_features: mockExtractedFeatures,
    };

    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: mockApprovalWithFeatures,
        error: null,
      });

      mockGeminiService.generateImage.mockImplementation(({ view }: any) =>
        Promise.resolve({ url: mockImageUrls[view as keyof typeof mockImageUrls] })
      );

      mockImageService.upload.mockImplementation(({ url }: any) =>
        Promise.resolve({ success: true, url })
      );
    });

    describe("Happy path scenarios", () => {
      it("should generate all remaining views", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        const result = await generateRemainingViews(params);

        expect(result.success).toBe(true);
        expect(result.views).toEqual({
          back: mockImageUrls.back,
          side: mockImageUrls.side,
          top: mockImageUrls.top,
          bottom: mockImageUrls.bottom,
        });
        expect(mockGeminiService.generateImage).toHaveBeenCalledTimes(4);
      });

      it("should generate views in parallel", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        await generateRemainingViews(params);

        // All 4 views should be called (back, side, top, bottom)
        expect(mockGeminiService.generateImage).toHaveBeenCalledTimes(4);
      });

      it("should update approval record with additional views", async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        await generateRemainingViews(params);

        expect(mockSupabase.update).toHaveBeenCalledWith(
          expect.objectContaining({
            back_view_url: mockImageUrls.back,
            side_view_url: mockImageUrls.side,
            top_view_url: mockImageUrls.top,
            bottom_view_url: mockImageUrls.bottom,
          })
        );
      });
    });

    describe("Error scenarios", () => {
      it("should handle approval not found", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: null,
          error: { message: "Not found" },
        });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        const result = await generateRemainingViews(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("not found");
      });

      it("should handle partial view generation failures gracefully", async () => {
        mockGeminiService.generateImage
          .mockResolvedValueOnce({ url: mockImageUrls.back })
          .mockRejectedValueOnce(new Error("Side view failed"))
          .mockResolvedValueOnce({ url: mockImageUrls.top })
          .mockResolvedValueOnce({ url: mockImageUrls.bottom });

        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        const result = await generateRemainingViews(params);

        expect(result.success).toBe(true);
        expect(result.views?.back).toBe(mockImageUrls.back);
        expect(result.views?.side).toBe(""); // Failed view
        expect(result.views?.top).toBe(mockImageUrls.top);
        expect(result.views?.bottom).toBe(mockImageUrls.bottom);
      });

      it("should handle missing extracted features", async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: {
            ...mockApprovalWithFeatures,
            extracted_features: null,
          },
          error: null,
        });
        mockSupabase.eq.mockResolvedValue({ error: null });

        const params: GenerateRemainingViewsParams = {
          approvalId: mockApprovalId,
          frontViewUrl: mockFrontViewUrl,
        };

        const result = await generateRemainingViews(params);

        expect(result.success).toBe(true);
        // Should use safe defaults
      });
    });
  });

  describe("createRevisionAfterApproval", () => {
    const mockApprovalRecord = {
      id: mockApprovalId,
      user_id: mockUser.id,
      product_idea_id: mockProductId,
      session_id: mockSessionId,
      front_view_prompt: "Test prompt",
      iteration_number: 1,
      credits_reserved: 3,
    };

    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: mockApprovalRecord,
        error: null,
      });
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      mockSupabase.limit.mockReturnThis();
    });

    describe("Happy path scenarios", () => {
      it("should create initial revision (revision 0)", async () => {
        mockSupabase.insert.mockResolvedValueOnce({
          data: [
            { id: "rev-1", revision_number: 0 },
            { id: "rev-2", revision_number: 0 },
            { id: "rev-3", revision_number: 0 },
            { id: "rev-4", revision_number: 0 },
            { id: "rev-5", revision_number: 0 },
          ],
          error: null,
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: true,
        };

        const result = await createRevisionAfterApproval(params);

        expect(result.success).toBe(true);
        expect(result.revisionNumber).toBe(0);
        expect(result.revisionIds).toHaveLength(5);
        expect(DeductCredits).toHaveBeenCalledWith({ credit: 3 });
      });

      it("should create next revision for edits", async () => {
        mockSupabase.single
          .mockResolvedValueOnce({ data: mockApprovalRecord, error: null })
          .mockResolvedValueOnce({
            data: [{ revision_number: 0 }],
            error: null,
          });

        mockSupabase.insert.mockResolvedValueOnce({
          data: [
            { id: "rev-1", revision_number: 1 },
            { id: "rev-2", revision_number: 1 },
            { id: "rev-3", revision_number: 1 },
            { id: "rev-4", revision_number: 1 },
            { id: "rev-5", revision_number: 1 },
          ],
          error: null,
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: false,
        };

        const result = await createRevisionAfterApproval(params);

        expect(result.success).toBe(true);
        expect(result.revisionNumber).toBe(1);
      });

      it("should deactivate previous active revisions", async () => {
        mockSupabase.insert.mockResolvedValueOnce({
          data: [{ id: "rev-1", revision_number: 0 }],
          error: null,
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: true,
        };

        await createRevisionAfterApproval(params);

        expect(mockSupabase.update).toHaveBeenCalledWith({ is_active: false });
      });

      it("should consume reserved credits", async () => {
        mockSupabase.insert.mockResolvedValueOnce({
          data: [{ id: "rev-1" }],
          error: null,
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: true,
        };

        await createRevisionAfterApproval(params);

        expect(DeductCredits).toHaveBeenCalledWith({ credit: 3 });
      });
    });

    describe("Error scenarios", () => {
      it("should handle missing views", async () => {
        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: {
            front: mockImageUrls.front,
            back: "",
            side: "",
            top: "",
            bottom: "",
          },
          isInitial: true,
        };

        const result = await createRevisionAfterApproval(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("All 5 views");
      });

      it("should handle database insert error", async () => {
        mockSupabase.insert.mockResolvedValueOnce({
          data: null,
          error: { message: "Database error" },
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: true,
        };

        const result = await createRevisionAfterApproval(params);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Database error");
      });

      it("should continue if credit consumption fails", async () => {
        (DeductCredits as jest.Mock).mockResolvedValueOnce({ success: false });
        mockSupabase.insert.mockResolvedValueOnce({
          data: [{ id: "rev-1" }],
          error: null,
        });

        const params: CreateRevisionAfterApprovalParams = {
          productId: mockProductId,
          approvalId: mockApprovalId,
          allViews: mockImageUrls,
          isInitial: true,
        };

        const result = await createRevisionAfterApproval(params);

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Credit system integration", () => {
    it("should reserve 3 credits for initial generation", async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: mockApprovalId },
        error: null,
      });

      await generateFrontViewOnly({
        productId: mockProductId,
        userPrompt: "Test",
        isEdit: false,
      });

      expect(ReserveCredits).toHaveBeenCalledWith({ credit: 3 });
    });

    it("should reserve 2 credits for edits", async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: mockApprovalId },
        error: null,
      });

      await generateFrontViewOnly({
        productId: mockProductId,
        userPrompt: "Test",
        isEdit: true,
      });

      expect(ReserveCredits).toHaveBeenCalledWith({ credit: 2 });
    });

    it("should charge 1 extra credit per iteration", async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: {
            id: mockApprovalId,
            iteration_number: 1,
            credits_reserved: 3,
            front_view_url: mockFrontViewUrl,
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: "approval-456", iteration_number: 2 },
          error: null,
        });

      mockSupabase.eq.mockResolvedValue({ error: null });

      await handleFrontViewDecision({
        approvalId: mockApprovalId,
        action: "edit",
        editFeedback: "Changes",
      });

      expect(ReserveCredits).toHaveBeenCalledWith({ credit: 1 });
    });
  });

  describe("State transitions", () => {
    it("should track iteration count across edits", async () => {
      // Initial approval
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockApprovalId, iteration_number: 1 },
        error: null,
      });

      const result1 = await generateFrontViewOnly({
        productId: mockProductId,
        userPrompt: "Test",
      });

      expect(result1.success).toBe(true);

      // First edit
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { id: mockApprovalId, iteration_number: 1, credits_reserved: 3 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: "approval-456", iteration_number: 2 },
          error: null,
        });

      mockSupabase.eq.mockResolvedValue({ error: null });

      const result2 = await handleFrontViewDecision({
        approvalId: mockApprovalId,
        action: "edit",
        editFeedback: "Make changes",
      });

      expect(result2.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({ iteration_number: 2 })
      );
    });
  });
});
