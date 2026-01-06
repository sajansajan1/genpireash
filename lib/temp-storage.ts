/**
 * Temporary in-memory storage for when Supabase is unavailable
 * This is a fallback solution - data will be lost on server restart
 */

interface ApprovalRecord {
  id: string;
  user_id: string;
  session_id: string;
  front_view_url: string;
  front_view_prompt: string;
  status: 'pending' | 'approved' | 'revision_requested';
  user_feedback?: string;
  back_view_url?: string;
  back_view_prompt?: string;
  side_view_url?: string;
  side_view_prompt?: string;
  top_view_url?: string;
  top_view_prompt?: string;
  bottom_view_url?: string;
  bottom_view_prompt?: string;
  extracted_features?: any;
  created_at: string;
  approved_at?: string;
  updated_at: string;
}

// In-memory storage (will be lost on server restart)
const tempStorage = new Map<string, ApprovalRecord>();

export const tempApprovalStorage = {
  /**
   * Store approval record temporarily
   */
  create(data: Omit<ApprovalRecord, 'id' | 'created_at' | 'updated_at'>): ApprovalRecord {
    const id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: ApprovalRecord = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    
    tempStorage.set(id, record);
    console.warn(`⚠️ Using temporary storage for approval ${id}. Data will be lost on server restart.`);
    
    return record;
  },

  /**
   * Get approval record by ID
   */
  get(id: string): ApprovalRecord | null {
    return tempStorage.get(id) || null;
  },

  /**
   * Update approval record
   */
  update(id: string, updates: Partial<ApprovalRecord>): ApprovalRecord | null {
    const record = tempStorage.get(id);
    if (!record) return null;
    
    const updated = {
      ...record,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    tempStorage.set(id, updated);
    return updated;
  },

  /**
   * Get all records for a user
   */
  getByUserId(userId: string): ApprovalRecord[] {
    return Array.from(tempStorage.values()).filter(r => r.user_id === userId);
  },

  /**
   * Check if using temporary storage
   */
  isTemporary(id: string): boolean {
    return id.startsWith('temp_');
  },

  /**
   * Get storage status
   */
  getStatus() {
    return {
      isTemporary: true,
      recordCount: tempStorage.size,
      warning: 'Using temporary in-memory storage. Data will be lost on server restart. Please fix Supabase connection.',
    };
  }
};
