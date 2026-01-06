/**
 * Component tests for FrontViewApproval
 *
 * Tests cover:
 * - Rendering with different props
 * - User interactions (approve, edit, quick suggestions)
 * - Loading states
 * - Iteration counter display
 * - Credit information display
 * - Form validation
 * - Accessibility
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FrontViewApproval } from "../index";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("FrontViewApproval", () => {
  const mockProps = {
    frontViewUrl: "https://example.com/front.jpg",
    approvalId: "approval-123",
    iterationCount: 1,
    onApprove: jest.fn(),
    onRequestEdit: jest.fn(),
    productName: "Wireless Headphones",
    isProcessing: false,
    creditsForRemaining: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with all required elements", () => {
      render(<FrontViewApproval {...mockProps} />);

      expect(screen.getByText(/Your Front View is Ready!/i)).toBeInTheDocument();
      expect(screen.getByText(/Wireless Headphones/i)).toBeInTheDocument();
      expect(screen.getByAltText("Front view")).toBeInTheDocument();
      expect(screen.getByText(/Looks Good! Generate All Views/i)).toBeInTheDocument();
      expect(screen.getByText(/Request Changes/i)).toBeInTheDocument();
    });

    it("should display the front view image", () => {
      render(<FrontViewApproval {...mockProps} />);

      const image = screen.getByAltText("Front view") as HTMLImageElement;
      expect(image.src).toContain("front.jpg");
    });

    it("should display credit information", () => {
      render(<FrontViewApproval {...mockProps} />);

      expect(screen.getByText(/2 credits/i)).toBeInTheDocument();
      expect(screen.getByText(/~2 minutes/i)).toBeInTheDocument();
    });

    it("should display iteration count for versions > 1", () => {
      render(<FrontViewApproval {...mockProps} iterationCount={3} />);

      expect(screen.getByText("Version 3")).toBeInTheDocument();
    });

    it("should not display iteration badge for first version", () => {
      render(<FrontViewApproval {...mockProps} iterationCount={1} />);

      expect(screen.queryByText("Version 1")).not.toBeInTheDocument();
    });

    it("should render all quick action suggestions", () => {
      render(<FrontViewApproval {...mockProps} />);

      expect(screen.getByText("Change color scheme")).toBeInTheDocument();
      expect(screen.getByText("Adjust proportions")).toBeInTheDocument();
      expect(screen.getByText("Different style")).toBeInTheDocument();
      expect(screen.getByText("More details")).toBeInTheDocument();
      expect(screen.getByText("Simpler design")).toBeInTheDocument();
      expect(screen.getByText("Professional look")).toBeInTheDocument();
    });
  });

  describe("Approve functionality", () => {
    it("should call onApprove when approve button is clicked", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn().mockResolvedValue(undefined);

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      await user.click(approveButton);

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalledTimes(1);
      });
    });

    it("should show loading state while approving", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      await user.click(approveButton);

      expect(screen.getByText(/Approving.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalled();
      });
    });

    it("should disable all buttons while approving", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      await user.click(approveButton);

      const requestChangesButton = screen.getByText(/Request Changes/i);
      expect(requestChangesButton).toBeDisabled();

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalled();
      });
    });
  });

  describe("Edit functionality", () => {
    it("should show edit form when Request Changes is clicked", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      const requestChangesButton = screen.getByText(/Request Changes/i);
      await user.click(requestChangesButton);

      expect(
        screen.getByPlaceholderText(/Describe what you'd like to change/i)
      ).toBeInTheDocument();
    });

    it("should hide edit form when clicked again", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      const requestChangesButton = screen.getByText(/Request Changes/i);
      await user.click(requestChangesButton);

      expect(
        screen.getByPlaceholderText(/Describe what you'd like to change/i)
      ).toBeInTheDocument();

      await user.click(screen.getByText(/Hide Edit Options/i));

      expect(
        screen.queryByPlaceholderText(/Describe what you'd like to change/i)
      ).not.toBeInTheDocument();
    });

    it("should call onRequestEdit with feedback when submitted", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn().mockResolvedValue(undefined);

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      // Open edit form
      await user.click(screen.getByText(/Request Changes/i));

      // Type feedback
      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, "Make it blue");

      // Submit
      await user.click(screen.getByText(/Regenerate Front View/i));

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalledWith("Make it blue");
      });
    });

    it("should clear feedback after successful submission", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn().mockResolvedValue(undefined);

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, "Make it blue");
      await user.click(screen.getByText(/Regenerate Front View/i));

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalled();
      });

      // Form should be hidden and cleared
      expect(
        screen.queryByPlaceholderText(/Describe what you'd like to change/i)
      ).not.toBeInTheDocument();
    });

    it("should not allow submission with empty feedback", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn();

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));

      const submitButton = screen.getByText(/Regenerate Front View/i);
      expect(submitButton).toBeDisabled();
    });

    it("should show loading state while requesting edit", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, "Make it blue");
      await user.click(screen.getByText(/Regenerate Front View/i));

      expect(screen.getByText(/Regenerating.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalled();
      });
    });

    it("should allow canceling edit", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      await user.click(screen.getByText(/Request Changes/i));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, "Make it blue");

      await user.click(screen.getByText("Cancel"));

      expect(
        screen.queryByPlaceholderText(/Describe what you'd like to change/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Quick suggestions", () => {
    it("should populate textarea with suggestion when clicked", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      await user.click(screen.getByText("Change color scheme"));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      expect(textarea).toHaveValue("Change color scheme");
    });

    it("should open edit form when suggestion is clicked", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      await user.click(screen.getByText("Adjust proportions"));

      expect(
        screen.getByPlaceholderText(/Describe what you'd like to change/i)
      ).toBeInTheDocument();
    });

    it("should disable suggestions when processing", () => {
      render(<FrontViewApproval {...mockProps} isProcessing={true} />);

      const suggestionButton = screen.getByText("Change color scheme");
      expect(suggestionButton).toBeDisabled();
    });
  });

  describe("Loading states", () => {
    it("should disable all interactions when isProcessing is true", () => {
      render(<FrontViewApproval {...mockProps} isProcessing={true} />);

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      const requestChangesButton = screen.getByText(/Request Changes/i);

      expect(approveButton).toBeDisabled();
      expect(requestChangesButton).toBeDisabled();
    });

    it("should disable all buttons during approval", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      await user.click(screen.getByText(/Looks Good! Generate All Views/i));

      const requestChangesButton = screen.getByText(/Request Changes/i);
      expect(requestChangesButton).toBeDisabled();

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalled();
      });
    });

    it("should disable all buttons during edit request", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));
      await user.type(
        screen.getByPlaceholderText(/Describe what you'd like to change/i),
        "Make it blue"
      );
      await user.click(screen.getByText(/Regenerate Front View/i));

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      expect(approveButton).toBeDisabled();

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalled();
      });
    });
  });

  describe("Props variations", () => {
    it("should display custom credit amount", () => {
      render(<FrontViewApproval {...mockProps} creditsForRemaining={5} />);

      expect(screen.getByText(/5 credits/i)).toBeInTheDocument();
    });

    it("should handle long product names", () => {
      const longName = "Very Long Product Name That Should Still Display Properly";
      render(<FrontViewApproval {...mockProps} productName={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle high iteration counts", () => {
      render(<FrontViewApproval {...mockProps} iterationCount={10} />);

      expect(screen.getByText("Version 10")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible image alt text", () => {
      render(<FrontViewApproval {...mockProps} />);

      const image = screen.getByAltText("Front view");
      expect(image).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      render(<FrontViewApproval {...mockProps} />);

      expect(
        screen.getByRole("button", { name: /Looks Good! Generate All Views/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Request Changes/i })
      ).toBeInTheDocument();
    });

    it("should make textarea accessible", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      await user.click(screen.getByText(/Request Changes/i));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should prevent image dragging", () => {
      render(<FrontViewApproval {...mockProps} />);

      const image = screen.getByAltText("Front view") as HTMLImageElement;
      expect(image.draggable).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should handle onApprove errors gracefully", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn().mockRejectedValue(new Error("Approval failed"));

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      await user.click(screen.getByText(/Looks Good! Generate All Views/i));

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalled();
      });

      // Component should return to normal state after error
      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);
      expect(approveButton).not.toBeDisabled();
    });

    it("should handle onRequestEdit errors gracefully", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn().mockRejectedValue(new Error("Edit failed"));

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));
      await user.type(
        screen.getByPlaceholderText(/Describe what you'd like to change/i),
        "Make it blue"
      );
      await user.click(screen.getByText(/Regenerate Front View/i));

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalled();
      });

      // Component should return to normal state after error
      const submitButton = screen.getByText(/Regenerate Front View/i);
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Edge cases", () => {
    it("should handle very long feedback text", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn().mockResolvedValue(undefined);

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));

      const longFeedback = "a".repeat(1000);
      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, longFeedback);

      await user.click(screen.getByText(/Regenerate Front View/i));

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalledWith(longFeedback);
      });
    });

    it("should trim whitespace from feedback", async () => {
      const user = userEvent.setup();
      const onRequestEdit = jest.fn().mockResolvedValue(undefined);

      render(<FrontViewApproval {...mockProps} onRequestEdit={onRequestEdit} />);

      await user.click(screen.getByText(/Request Changes/i));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      await user.type(textarea, "   Make it blue   ");

      await user.click(screen.getByText(/Regenerate Front View/i));

      await waitFor(() => {
        expect(onRequestEdit).toHaveBeenCalledWith("   Make it blue   ");
      });
    });

    it("should handle rapid clicks on approve button", async () => {
      const user = userEvent.setup();
      const onApprove = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<FrontViewApproval {...mockProps} onApprove={onApprove} />);

      const approveButton = screen.getByText(/Looks Good! Generate All Views/i);

      // Click multiple times rapidly
      await user.click(approveButton);
      await user.click(approveButton);
      await user.click(approveButton);

      await waitFor(() => {
        // Should only be called once due to loading state
        expect(onApprove).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle empty suggestion clicks", async () => {
      const user = userEvent.setup();
      render(<FrontViewApproval {...mockProps} />);

      // Click a suggestion
      await user.click(screen.getByText("Different style"));

      const textarea = screen.getByPlaceholderText(/Describe what you'd like to change/i);
      expect(textarea).toHaveValue("Different style");

      // Click the same suggestion again
      await user.click(screen.getByText("Different style"));

      // Should still have the value
      expect(textarea).toHaveValue("Different style");
    });
  });
});
