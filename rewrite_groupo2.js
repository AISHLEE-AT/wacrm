const fs = require('fs');
let text = fs.readFileSync('D:/w/apps/web/src/lib/groupRepository.ts', 'utf8');
let newText = text;

newText = newText.replace(/async fetchAllGroupsForAdmin\(\): Promise<DbGroup\[\]> \{[\s\S]*?async adminChangeLeader/g, 
  `async fetchAllGroupsForAdmin(): Promise<DbGroup[]> {
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups');
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.warn('[GroupRepository] fetchAllGroupsForAdmin error:', err);
      return [];
    }
  },

  /**
   * ADMIN: Emergency Leader Change / Transfer
   */
  async adminChangeLeader`);

newText = newText.replace(/async fetchMembers\(groupId: string\): Promise<DbMember\[\]> \{[\s\S]*?async recordSavingsPayment/g, 
  `async fetchMembers(groupId: string): Promise<DbMember[]> {
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups/' + groupId + '/members');
      return res.ok ? await res.json() : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Record monthly savings payment
   */
  async recordSavingsPayment`);

newText = newText.replace(/async getUserGroups\(rawPhone: string\): Promise<DbGroup\[\]> \{[\s\S]*?async createGroupWithMembers/g, 
  `async getUserGroups(rawPhone: string): Promise<DbGroup[]> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return [];
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups?phone=' + cleanPhone);
      return res.ok ? await res.json() : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Create a new Group with its initial member roster
   */
  async createGroupWithMembers`);

newText = newText.replace(/async getUserGroupStatus\(rawPhone: string\): Promise<UserGroupStatus> \{[\s\S]*?async getUserGroups/g, 
  `async getUserGroupStatus(rawPhone: string): Promise<UserGroupStatus> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return { isLeader: false, isMember: false, role: 'None' };
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/status?phone=' + cleanPhone);
      return res.ok ? await res.json() : { isLeader: false, isMember: false, role: 'None' };
    } catch (err) {
      return { isLeader: false, isMember: false, role: 'None' };
    }
  },

  /**
   * Fetch all groups associated with the user (as leader or member)
   */
  async getUserGroups`);

if (text !== newText) {
  fs.writeFileSync('D:/w/apps/web/src/lib/groupRepository.ts', newText);
  console.log('Modified successfully.');
} else {
  console.log('No matches found.');
}
