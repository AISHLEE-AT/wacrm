const fs = require('fs');
const file = 'D:/w/apps/web/src/lib/groupRepository.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace fetchAllGroupsForAdmin
content = content.replace(
  /async fetchAllGroupsForAdmin\(\)[\s\S]*?\} catch \(err\) \{[\s\S]*?return \[\];\n    \}\n  \},/,
  `async fetchAllGroupsForAdmin(): Promise<DbGroup[]> {
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups');
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.warn('[GroupRepository] fetchAllGroupsForAdmin error:', err);
      return [];
    }
  },`
);

// Replace fetchMembers
content = content.replace(
  /async fetchMembers\(groupId: string\)[\s\S]*?return data \|\| \[\];\n  \},/,
  `async fetchMembers(groupId: string): Promise<DbMember[]> {
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups/' + groupId + '/members');
      return res.ok ? await res.json() : [];
    } catch (err) {
      return [];
    }
  },`
);

// Replace getUserGroups
content = content.replace(
  /async getUserGroups\(rawPhone: string\)[\s\S]*?return Array\.from\(groupMap\.values\(\)\);[\s\S]*?\} catch \(err\) \{[\s\S]*?return \[\];\n    \}\n  \},/,
  `async getUserGroups(rawPhone: string): Promise<DbGroup[]> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return [];
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/groups?phone=' + cleanPhone);
      return res.ok ? await res.json() : [];
    } catch (err) {
      return [];
    }
  },`
);

// Replace getUserGroupStatus
content = content.replace(
  /async getUserGroupStatus\(rawPhone: string\)[\s\S]*?\} catch \(err\) \{[\s\S]*?return \{ isLeader: false, isMember: false, role: 'None' \};\n    \}\n  \},/,
  `async getUserGroupStatus(rawPhone: string): Promise<UserGroupStatus> {
    const cleanPhone = this.normalizePhone(rawPhone);
    if (!cleanPhone) return { isLeader: false, isMember: false, role: 'None' };
    try {
      const res = await fetch('http://152.67.7.216:8080/api/groupo/status?phone=' + cleanPhone);
      return res.ok ? await res.json() : { isLeader: false, isMember: false, role: 'None' };
    } catch (err) {
      return { isLeader: false, isMember: false, role: 'None' };
    }
  },`
);

// Replace recordSavingsPayment
content = content.replace(
  /async recordSavingsPayment\(options: \{[\s\S]*?\} \): Promise<void> \{[\s\S]*?\}\n  \},/,
  `async recordSavingsPayment(options: any): Promise<void> {
    await fetch('http://152.67.7.216:8080/api/groupo/members/' + options.memberId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_month_paid: options.paid, savings_amount: options.amount })
    });
  },`
);

fs.writeFileSync(file, content);
console.log('GroupRepository updated successfully!');
