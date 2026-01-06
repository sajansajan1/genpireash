/**
 * Credits Manager
 * Handles credit checking, reservation, deduction, and refund operations
 *
 * Uses the existing credit management system from lib/supabase/payments.ts
 * which implements the reserve → work → deduct/refund pattern
 */

import {
  ReserveCredits,
  RefundCredits,
  DeductCredits,
} from "@/lib/supabase/payments";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

export interface CreditReservation {
  success: boolean;
  reservationId?: string;
  reservedFrom?: { id: string; deducted: number }[];
  currentCredits?: number;
  message?: string;
}

export interface CreditOperation {
  success: boolean;
  message?: string;
}

// ============================================================================
// CREDITS MANAGER CLASS
// ============================================================================

export class CreditsManager {
  /**
   * Check if user has sufficient credits
   * @param requiredCredits Number of credits required
   * @returns True if user has enough credits
   */
  async checkCredits(requiredCredits: number): Promise<boolean> {
    try {
      const supabase = await createClient();

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        return false;
      }

      // Fetch all active credit sources
      const { data: creditRecords, error } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("Error checking credits:", error);
        return false;
      }

      const totalAvailable =
        creditRecords?.reduce((sum, r) => sum + r.credits, 0) || 0;

      return totalAvailable >= requiredCredits;
    } catch (error) {
      console.error("Error in checkCredits:", error);
      return false;
    }
  }

  /**
   * Get user's available credits
   * @returns Number of available credits
   */
  async getAvailableCredits(): Promise<number> {
    try {
      const supabase = await createClient();

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        return 0;
      }

      // Fetch all active credit sources
      const { data: creditRecords, error } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("Error getting available credits:", error);
        return 0;
      }

      return creditRecords?.reduce((sum, r) => sum + r.credits, 0) || 0;
    } catch (error) {
      console.error("Error in getAvailableCredits:", error);
      return 0;
    }
  }

  /**
   * Reserve credits upfront for an operation
   * Credits are deducted immediately but can be refunded if operation fails
   *
   * @param amount Number of credits to reserve
   * @returns Reservation result with reservationId for tracking
   *
   * @example
   * const reservation = await creditsManager.reserveCredits(3);
   * if (!reservation.success) {
   *   throw new Error(reservation.message || 'Insufficient credits');
   * }
   * // Store reservation.reservationId for later refund if needed
   */
  async reserveCredits(amount: number): Promise<CreditReservation> {
    try {
      const result = await ReserveCredits({ credit: amount });
      return result;
    } catch (error) {
      console.error("Error reserving credits:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to reserve credits",
      };
    }
  }

  /**
   * Refund reserved credits if operation fails
   *
   * @param amount Number of credits to refund
   * @param reservationId Reservation ID from reserveCredits()
   * @param reason Reason for refund (for logging)
   * @returns True if refund successful
   *
   * @example
   * try {
   *   // ... operation fails ...
   * } catch (error) {
   *   await creditsManager.refundReservedCredits(3, reservationId, 'Generation failed');
   *   throw error;
   * }
   */
  async refundReservedCredits(
    amount: number,
    reservationId: string,
    reason: string
  ): Promise<boolean> {
    try {
      console.log(`[Credits] Refunding ${amount} credits. Reason: ${reason}`);
      const success = await RefundCredits({ credit: amount, reservationId });

      if (success) {
        console.log(`[Credits] Successfully refunded ${amount} credits (reservation: ${reservationId})`);
      } else {
        console.error(`[Credits] Failed to refund ${amount} credits (reservation: ${reservationId})`);
      }

      return success;
    } catch (error) {
      console.error("Error refunding credits:", error);
      return false;
    }
  }

  /**
   * Deduct credits for a completed operation
   * This is used for operations that don't use the reserve pattern
   *
   * @param amount Number of credits to deduct
   * @returns Deduction result
   *
   * @deprecated Use reserveCredits() instead for better error handling
   */
  async deductCredits(amount: number): Promise<CreditOperation> {
    try {
      const result = await DeductCredits({ credit: amount });
      return result;
    } catch (error) {
      console.error("Error deducting credits:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to deduct credits",
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const creditsManager = new CreditsManager();
