// @ts-nocheck
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export interface DbGroup {
  id: string;
  leader_phone: string;
  leader_name: string;
  name: string;
  category: 'WomenSHG' | 'FarmerFPO' | 'SportsClub' | 'BusinessGroup' | 'VillageRWA' | 'YouthStudy';
  category_label: string;
  tagline?: string;
  village: string;
  district: string;
  pincode?: string;
  reg_code?: string;
  bank_name?: string;
  bank_account?: string;
  ifsc_code?: string;
  monthly_savings_per_member: number;
  meeting_schedule?: string;
  total_savings_pool: number;
  active_loan_pool: number;
  gdrive_folder_id?: string;
  custom_attributes?: Record<string, any>;
  created_at?: string;
}

export interface DbMember {
  id: string;
  group_id: string;
  phone: string;
  name: string;
  role: string;
  status: string;
  current_month_paid: boolean;
  savings_amount: number;
  total_savings_accumulated: number;
  active_loan_balance: number;
  loan_interest_rate: number;
  joined_at?: string;
}

export interface UserGroupStatus {
  isLeader: boolean;
  isMember: boolean;
  role: string;
  group?: DbGroup;
  memberRecord?: DbMember;
}

export const GroupRepository = {
  /**
   * Helper: Normalize to 10-digit phone number
   */
  normalizePhone(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  },

  /**
   * Automatically detect if the logged-in user's phone is a Leader or Member
   */
  async getUserGroupStatus(rawPhone: string): Promise<UserGroupStatus> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return { isLeader: false, isMember: false, role: 'None' };
    try {
      // 1. Check if user is Leader in Supabase groupo_groups
      const { data: leaderGroups } = await supabase
        .from('groupo_groups')
        .select('*')
        .or(`leader_phone.ilike.%${cleanPhone}%,leader_phone.ilike.%91${cleanPhone}%`)
        .limit(1);

      if (leaderGroups && leaderGroups.length > 0) {
        return {
          isLeader: true,
          isMember: true,
          role: 'Leader',
          group: leaderGroups[0],
        };
      }

      // 2. Check if user is a Member in Supabase groupo_members
      const { data: memberRows } = await supabase
        .from('groupo_members')
        .select('*, group:groupo_groups(*)')
        .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%91${cleanPhone}%`)
        .limit(1);

      if (memberRows && memberRows.length > 0) {
        const m = memberRows[0];
        return {
          isLeader: false,
          isMember: true,
          role: m.role || 'Member',
          group: m.group,
          memberRecord: m,
        };
      }

      // 3. Optional fallback to OCI API endpoint
      const res = await fetch('/api/groupo/status?phone=' + cleanPhone).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && (data.isLeader || data.isMember)) return data;
      }

      return { isLeader: false, isMember: false, role: 'None' };
    } catch (err) {
      console.warn('[GroupRepository] getUserGroupStatus error:', err);
      return { isLeader: false, isMember: false, role: 'None' };
    }
  },

  /**
   * Fetch all groups associated with the user (as leader or member)
   */
  async getUserGroups(rawPhone: string): Promise<DbGroup[]> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return [];
    try {
      // 1. Groups led by user from Supabase
      const { data: leaderGroups } = await supabase
        .from('groupo_groups')
        .select('*')
        .or(`leader_phone.ilike.%${cleanPhone}%,leader_phone.ilike.%91${cleanPhone}%`);

      // 2. Groups where user is a registered member
      const { data: memberRows } = await supabase
        .from('groupo_members')
        .select('group_id, group:groupo_groups(*)')
        .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%91${cleanPhone}%`);

      const groupMap = new Map<string, DbGroup>();

      (leaderGroups || []).forEach((g: DbGroup) => {
        if (g && g.id) groupMap.set(g.id, g);
      });

      (memberRows || []).forEach((m: any) => {
        if (m && m.group && m.group.id) {
          groupMap.set(m.group.id, m.group);
        }
      });

      if (groupMap.size > 0) {
        return Array.from(groupMap.values());
      }

      // 3. Fallback to API endpoint
      const res = await fetch('/api/groupo/groups?phone=' + cleanPhone).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data)) return data;
      }

      return [];
    } catch (err) {
      console.warn('[GroupRepository] getUserGroups error:', err);
      return [];
    }
  },

  /**
   * Create a new Group with its initial member roster
   */
  async createGroupWithMembers(options: {
    leaderPhone: string;
    leaderName: string;
    groupName: string;
    category: DbGroup['category'];
    categoryLabel: string;
    tagline?: string;
    village: string;
    district: string;
    pincode?: string;
    regCode?: string;
    bankName?: string;
    bankAccount?: string;
    monthlySavings: number;
    members: Array<{ name: string; phone: string; role: string; savingsAmount?: number }>;
  }): Promise<DbGroup> {
    const cleanLeaderPhone = this.normalizePhone(options.leaderPhone);

    // 1. Insert Group
    const { data: groupData, error: groupErr } = await supabase
      .from('groupo_groups')
      .insert({
        leader_phone: cleanLeaderPhone,
        leader_name: options.leaderName,
        name: options.groupName,
        category: options.category,
        category_label: options.categoryLabel,
        tagline: options.tagline,
        village: options.village,
        district: options.district,
        pincode: options.pincode,
        reg_code: options.regCode,
        bank_name: options.bankName,
        bank_account: options.bankAccount,
        monthly_savings_per_member: options.monthlySavings,
        total_savings_pool: 0,
        active_loan_pool: 0,
      })
      .select()
      .single();

    if (groupErr) {
      throw new Error(`Failed to create group: ${groupErr.message}`);
    }

    // 2. Prepare Members list including Leader
    const membersToInsert = [
      {
        group_id: groupData.id,
        phone: cleanLeaderPhone,
        name: options.leaderName,
        role: 'President',
        savings_amount: options.monthlySavings,
        current_month_paid: true,
      },
      ...options.members
        .filter((m) => this.normalizePhone(m.phone) !== cleanLeaderPhone)
        .map((m) => ({
          group_id: groupData.id,
          phone: this.normalizePhone(m.phone),
          name: m.name,
          role: m.role || 'Member',
          savings_amount: m.savingsAmount || options.monthlySavings,
          current_month_paid: false,
        })),
    ];

    const { error: membersErr } = await supabase.from('groupo_members').insert(membersToInsert);
    if (membersErr) {
      console.warn('[GroupRepository] Error inserting initial members:', membersErr);
    }

    return groupData;
  },

  /**
   * Add a new member to an existing group
   */
  async addMember(groupId: string, member: { name: string; phone: string; role: string; savingsAmount?: number }): Promise<DbMember> {
    const cleanPhone = this.normalizePhone(member.phone);
    const { data, error } = await supabase
      .from('groupo_members')
      .insert({
        group_id: groupId,
        phone: cleanPhone,
        name: member.name,
        role: member.role || 'Member',
        savings_amount: member.savingsAmount || 500,
        current_month_paid: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Fetch all members for a group
   */
  async fetchMembers(groupId: string): Promise<DbMember[]> {
    try {
      const { data, error } = await supabase
        .from('groupo_members')
        .select('*')
        .eq('group_id', groupId)
        .order('role', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DbMember[];
      }

      const res = await fetch('/api/groupo/groups/' + groupId + '/members').catch(() => null);
      if (res && res.ok) {
        const fallbackData = await res.json().catch(() => null);
        if (Array.isArray(fallbackData)) return fallbackData;
      }

      return (data as DbMember[]) || [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Record monthly savings payment
   */
  async recordSavingsPayment(options: {
    groupId: string;
    memberId: string;
    memberPhone: string;
    amount: number;
    month: string;
    paid: boolean;
  }): Promise<void> {
    // 1. Update member row
    await supabase
      .from('groupo_members')
      .update({
        current_month_paid: options.paid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', options.memberId);

    // 2. Log in ledger if paid
    if (options.paid) {
      await supabase.from('groupo_savings_ledger').insert({
        group_id: options.groupId,
        member_id: options.memberId,
        member_phone: this.normalizePhone(options.memberPhone),
        month_year: options.month,
        savings_paid: options.amount,
        status: 'Verified',
      });
    }
  },

  /**
   * ADMIN: Fetch all registered groups across system
   */
  async fetchAllGroupsForAdmin(): Promise<DbGroup[]> {
    try {
      const { data, error } = await supabase
        .from('groupo_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DbGroup[];
      }

      const res = await fetch('/api/groupo/groups').catch(() => null);
      if (res && res.ok) {
        const fallbackData = await res.json().catch(() => null);
        if (Array.isArray(fallbackData)) return fallbackData;
      }

      return (data as DbGroup[]) || [];
    } catch (err) {
      console.warn('[GroupRepository] fetchAllGroupsForAdmin error:', err);
      return [];
    }
  },

  /**
   * ADMIN: Emergency Leader Change / Transfer
   */
  async adminChangeLeader(options: {
    groupId: string;
    newLeaderPhone: string;
    newLeaderName: string;
  }): Promise<void> {
    const cleanPhone = this.normalizePhone(options.newLeaderPhone);

    // 1. Update Group Leader
    const { error: grpErr } = await supabase
      .from('groupo_groups')
      .update({
        leader_phone: cleanPhone,
        leader_name: options.newLeaderName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', options.groupId);

    if (grpErr) throw new Error(grpErr.message);

    // 2. Ensure member row exists or is updated to President
    const { data: existingMember } = await supabase
      .from('groupo_members')
      .select('id')
      .eq('group_id', options.groupId)
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingMember) {
      await supabase
        .from('groupo_members')
        .update({ role: 'President', updated_at: new Date().toISOString() })
        .eq('id', existingMember.id);
    } else {
      await supabase.from('groupo_members').insert({
        group_id: options.groupId,
        phone: cleanPhone,
        name: options.newLeaderName,
        role: 'President',
        savings_amount: 500,
        current_month_paid: true,
      });
    }
  },

  /**
   * ADMIN: Accounting & Audit Dispute Override
   */
  async adminOverrideMemberSavings(options: {
    groupId: string;
    memberId: string;
    memberPhone: string;
    paid: boolean;
    amount: number;
    month?: string;
  }): Promise<void> {
    await supabase
      .from('groupo_members')
      .update({
        current_month_paid: options.paid,
        savings_amount: options.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', options.memberId);

    await supabase.from('groupo_savings_ledger').insert({
      group_id: options.groupId,
      member_id: options.memberId,
      member_phone: this.normalizePhone(options.memberPhone),
      month_year: options.month || 'August 2026',
      savings_paid: options.paid ? options.amount : 0,
      status: 'Admin Override',
      recorded_by_phone: 'Admin',
    });
  },

  /**
   * ADMIN: Update Group Financial Pools
   */
  async adminUpdateGroupFinances(options: {
    groupId: string;
    totalSavingsPool: number;
    activeLoanPool: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('groupo_groups')
      .update({
        total_savings_pool: options.totalSavingsPool,
        active_loan_pool: options.activeLoanPool,
        updated_at: new Date().toISOString(),
      })
      .eq('id', options.groupId);

    if (error) throw new Error(error.message);
  },

  /**
   * ADMIN: Update Member Role
   */
  async adminUpdateMemberRole(memberId: string, newRole: string): Promise<void> {
    const { error } = await supabase
      .from('groupo_members')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) throw new Error(error.message);
  },

  /**
   * ADMIN: Delete Member
   */
  async adminDeleteMember(memberId: string): Promise<void> {
    const { error } = await supabase.from('groupo_members').delete().eq('id', memberId);
    if (error) throw new Error(error.message);
  },
};

export interface GroupData extends DbGroup {
  meetingDay?: string;
  leaderName?: string;
  monthlySavingsPerMember?: number;
  totalMembersCount?: number;
  members?: DbMember[];
  customMetrics?: any;
}
