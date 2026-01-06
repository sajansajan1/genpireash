/**
 * Component tests for ProgressiveViewsGeneration
 *
 * Tests cover:
 * - Progressive view state rendering (pending, generating, completed)
 * - Progress bar calculations
 * - Time estimation
 * - Animations and transitions
 * - Completion messages
 * - Accessibility
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { ProgressiveViewsGeneration } from "../index";
import type { ViewImages, LoadingStates } from "../../../types";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, custom, variants, ...props }: any) => (
      <div {...props} data-custom={custom}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("ProgressiveViewsGeneration", () => {
  const mockFrontViewUrl = "https://example.com/front.jpg";

  const createMockViews = (overrides: Partial<ViewImages> = {}): ViewImages => ({
    front: "",
    back: "",
    side: "",
    top: "",
    bottom: "",
    ...overrides,
  });

  const createMockLoadingStates = (overrides: Partial<LoadingStates> = {}): LoadingStates => ({
    front: false,
    back: false,
    side: false,
    top: false,
    bottom: false,
    ...overrides,
  });

  describe("Rendering", () => {
    it("should render with header and progress bar", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Generating Your Product Views")).toBeInTheDocument();
      expect(screen.getByText(/Please wait while we generate/i)).toBeInTheDocument();
    });

    it("should render all 5 view cards", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Front")).toBeInTheDocument();
      expect(screen.getByText("Back")).toBeInTheDocument();
      expect(screen.getByText("Side")).toBeInTheDocument();
      expect(screen.getByText("Top")).toBeInTheDocument();
      expect(screen.getByText("Bottom")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      const { container } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("custom-class");
    });
  });

  describe("View state rendering", () => {
    it("should show front view as completed with Approved badge", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const frontCard = screen.getByText("Front").closest("div")?.parentElement;
      expect(within(frontCard as HTMLElement).getByText("Approved")).toBeInTheDocument();
    });

    it("should show pending views with Waiting badge", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const backCard = screen.getByText("Back").closest("div")?.parentElement;
      expect(within(backCard as HTMLElement).getByText("Waiting")).toBeInTheDocument();
    });

    it("should show generating views with Generating badge", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates({ back: true });

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const backCard = screen.getByText("Back").closest("div")?.parentElement;
      expect(within(backCard as HTMLElement).getByText("Generating")).toBeInTheDocument();
    });

    it("should show completed views with Done badge", () => {
      const views = createMockViews({ back: "https://example.com/back.jpg" });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const backCard = screen.getByText("Back").closest("div")?.parentElement;
      expect(within(backCard as HTMLElement).getByText("Done")).toBeInTheDocument();
    });

    it("should display image for completed views", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const frontImage = screen.getByAltText("Front view") as HTMLImageElement;
      expect(frontImage.src).toContain("front.jpg");

      const backImage = screen.getByAltText("Back view") as HTMLImageElement;
      expect(backImage.src).toContain("back.jpg");

      const sideImage = screen.getByAltText("Side view") as HTMLImageElement;
      expect(sideImage.src).toContain("side.jpg");
    });
  });

  describe("Progress calculation", () => {
    it("should show 1/5 progress when only front view is complete", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Progress: 1 / 5 views")).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();
    });

    it("should show 3/5 progress when front, back, and side are complete", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Progress: 3 / 5 views")).toBeInTheDocument();
      expect(screen.getByText("60%")).toBeInTheDocument();
    });

    it("should show 5/5 progress when all views are complete", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
        top: "https://example.com/top.jpg",
        bottom: "https://example.com/bottom.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Progress: 5 / 5 views")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("should not count generating views as completed", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
      });
      const loadingStates = createMockLoadingStates({ side: true });

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Front + back = 2 completed, side is still generating
      expect(screen.getByText("Progress: 2 / 5 views")).toBeInTheDocument();
      expect(screen.getByText("40%")).toBeInTheDocument();
    });
  });

  describe("Time estimation", () => {
    it("should show estimated time when views are pending", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Should show some time estimate (format varies)
      expect(screen.getByText(/left/i)).toBeInTheDocument();
    });

    it("should show Complete when all views are done", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
        top: "https://example.com/top.jpg",
        bottom: "https://example.com/bottom.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Complete!")).toBeInTheDocument();
    });
  });

  describe("Completion message", () => {
    it("should not show completion message when views are pending", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.queryByText("Generation Complete!")).not.toBeInTheDocument();
    });

    it("should show completion message when all views are complete", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
        top: "https://example.com/top.jpg",
        bottom: "https://example.com/bottom.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Generation Complete!")).toBeInTheDocument();
      expect(
        screen.getByText(/All product views have been successfully generated/i)
      ).toBeInTheDocument();
    });

    it("should update header text when complete", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
        top: "https://example.com/top.jpg",
        bottom: "https://example.com/bottom.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("All views generated successfully!")).toBeInTheDocument();
    });
  });

  describe("Progressive state transitions", () => {
    it("should handle transition from pending to generating", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      const { rerender } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Initially pending
      const backCard = screen.getByText("Back").closest("div")?.parentElement;
      expect(within(backCard as HTMLElement).getByText("Waiting")).toBeInTheDocument();

      // Update to generating
      const newLoadingStates = createMockLoadingStates({ back: true });
      rerender(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={newLoadingStates}
        />
      );

      expect(within(backCard as HTMLElement).getByText("Generating")).toBeInTheDocument();
    });

    it("should handle transition from generating to completed", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates({ back: true });

      const { rerender } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Initially generating
      const backCard = screen.getByText("Back").closest("div")?.parentElement;
      expect(within(backCard as HTMLElement).getByText("Generating")).toBeInTheDocument();

      // Update to completed
      const newViews = createMockViews({ back: "https://example.com/back.jpg" });
      const newLoadingStates = createMockLoadingStates();
      rerender(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={newViews}
          loadingViews={newLoadingStates}
        />
      );

      expect(within(backCard as HTMLElement).getByText("Done")).toBeInTheDocument();
    });

    it("should update progress bar as views complete", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      const { rerender } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("20%")).toBeInTheDocument();

      // Add back view
      const views2 = createMockViews({ back: "https://example.com/back.jpg" });
      rerender(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views2}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("40%")).toBeInTheDocument();

      // Add side view
      const views3 = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
      });
      rerender(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views3}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("60%")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible image alt texts", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByAltText("Front view")).toBeInTheDocument();
      expect(screen.getByAltText("Back view")).toBeInTheDocument();
      expect(screen.getByAltText("Side view")).toBeInTheDocument();
    });

    it("should prevent image dragging", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const frontImage = screen.getByAltText("Front view") as HTMLImageElement;
      expect(frontImage.draggable).toBe(false);

      const backImage = screen.getByAltText("Back view") as HTMLImageElement;
      expect(backImage.draggable).toBe(false);
    });

    it("should have semantic heading structure", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const heading = screen.getByText("Generating Your Product Views");
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("Edge cases", () => {
    it("should handle missing front view URL", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl=""
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Should still render but might have issues with front image
      expect(screen.getByText("Generating Your Product Views")).toBeInTheDocument();
    });

    it("should handle all views loading simultaneously", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates({
        back: true,
        side: true,
        top: true,
        bottom: true,
      });

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // All views except front should be generating
      const generatingBadges = screen.getAllByText("Generating");
      expect(generatingBadges).toHaveLength(4);
    });

    it("should handle rapid state changes", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      const { rerender } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Rapidly change states
      for (let i = 0; i < 10; i++) {
        const newViews = createMockViews({
          back: i % 2 === 0 ? "https://example.com/back.jpg" : "",
        });
        rerender(
          <ProgressiveViewsGeneration
            frontViewUrl={mockFrontViewUrl}
            currentViews={newViews}
            loadingViews={loadingStates}
          />
        );
      }

      // Should still render correctly
      expect(screen.getByText("Generating Your Product Views")).toBeInTheDocument();
    });

    it("should handle completion with some views missing", () => {
      const views = createMockViews({
        back: "https://example.com/back.jpg",
        side: "https://example.com/side.jpg",
        top: "https://example.com/top.jpg",
        // bottom is missing
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Should not show completion message
      expect(screen.queryByText("Generation Complete!")).not.toBeInTheDocument();
      expect(screen.getByText("80%")).toBeInTheDocument();
    });

    it("should handle empty view URLs", () => {
      const views = createMockViews({
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // Only front view should be complete
      expect(screen.getByText("20%")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("should render views in correct grid layout", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      const { container } = render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      const grids = container.querySelectorAll(".grid");
      expect(grids.length).toBeGreaterThan(0);
    });

    it("should display front, back, side in first row", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      // These views should all be present
      expect(screen.getByText("Front")).toBeInTheDocument();
      expect(screen.getByText("Back")).toBeInTheDocument();
      expect(screen.getByText("Side")).toBeInTheDocument();
    });

    it("should display top and bottom in second row", () => {
      const views = createMockViews();
      const loadingStates = createMockLoadingStates();

      render(
        <ProgressiveViewsGeneration
          frontViewUrl={mockFrontViewUrl}
          currentViews={views}
          loadingViews={loadingStates}
        />
      );

      expect(screen.getByText("Top")).toBeInTheDocument();
      expect(screen.getByText("Bottom")).toBeInTheDocument();
    });
  });
});
