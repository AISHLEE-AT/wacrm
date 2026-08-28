'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Wallet, BookOpen, Video, MessageCircle,
  Plus, Building, Sparkles, CheckCircle2, Clock
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { GroupRepository, UserGroupStatus, DbGroup, DbMember } from '@/lib/groupRepository';

// Import newly ported Web Modals
import CreateGroupWizardWebModal from '@/components/groupo/CreateGroupWizardWebModal';
import GroupAdminConsoleWebModal from '@/components/groupo/GroupAdminConsoleWebModal';
import GroupAiAssistantWebModal from '@/components/groupo/GroupAiAssistantWebModal';

const supabase = createClient();

interface GroupData {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  tagline: string;
  village: string;
  district: string;
  regCode: string;
  monthlySavingsPerMember: number;
  totalMembersCount: number;
  totalSavingsPool: number;
  activeLoanPool: number;
  meetingDay: string;
  members: DbMember[];
  leaderName: string;
}

const mapDbGroupToGroupData = async (g: DbGroup): Promise<GroupData> => {
  let members: DbMember[] = [];
  try {
    members = await GroupRepository.fetchMembers(g.id);
  } catch (e) {
    console.error(e);
  }

  const leader = members.find(m => m.role.toLowerCase().includes('president')) || members[0];
  const leaderName = leader ? leader.name : g.leader_name || 'Group Leader';

  return {
    id: g.id,
    name: g.name,
    category: g.category || 'WomenSHG',
    categoryLabel: g.category_label || 'Self Help Group',
    tagline: g.tagline || 'Community Empowerment',
    village: g.village || 'Local Village',
    district: g.district || 'District',
    regCode: g.reg_code || 'TN-GROUPO',
    monthlySavingsPerMember: g.monthly_savings_per_member || 500,
    totalMembersCount: members.length,
    totalSavingsPool: (g as any).total_savings_pool ?? 0,
    activeLoanPool: (g as any).active_loan_pool ?? 0,
    meetingDay: (g as any).meeting_schedule || '5th & 20th',
    members,
    leaderName,
  };
};

export default function GroupOWebPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'meetings' | 'videos' | 'ai_docs'>('overview');
  
  // Data State
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [userStatus, setUserStatus] = useState<UserGroupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('');

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const phone = authData?.user?.phone || '';
      setUserPhone(phone);

      if (phone) {
        const rawGroups = await GroupRepository.getUserGroups(phone);
        const mappedList: GroupData[] = [];
        for (const g of rawGroups) {
          mappedList.push(await mapDbGroupToGroupData(g));
        }
        setUserGroups(mappedList);
        
        if (mappedList.length > 0 && !selectedGroup) {
          setSelectedGroup(mappedList[0]);
        }

        const status = await GroupRepository.getUserGroupStatus(phone);
        setUserStatus(status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGroupCreated = async (newGrp: DbGroup) => {
    const mapped = await mapDbGroupToGroupData(newGrp);
    setUserGroups(prev => [mapped, ...prev]);
    setSelectedGroup(mapped);
    setIsCreateGroupOpen(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-pink-600 font-bold">Loading Groups...</div>;
  }

  // EMPTY STATE: Zero Groups
  if (userGroups.length === 0 && !isCreateGroupOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <Building className="w-24 h-24 text-pink-300 mb-6" />
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to SuprO GroupO</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          You are not part of any Self Help Groups, FPOs, or Community Associations yet. Join an existing group or start your own!
        </p>
        <button 
          onClick={() => setIsCreateGroupOpen(true)}
          className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold shadow-lg hover:bg-pink-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Start a New Group
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header & Group Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <select 
              className="text-2xl font-black text-gray-900 border-none bg-transparent focus:ring-0 cursor-pointer"
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const grp = userGroups.find(g => g.id === e.target.value);
                if (grp) setSelectedGroup(grp);
              }}
            >
              {userGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 font-medium">{selectedGroup?.tagline}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {userStatus?.isLeader && (
            <button 
              onClick={() => setIsAdminConsoleOpen(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2"
            >
              Admin Console
            </button>
          )}
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="px-4 py-2 border border-pink-200 text-pink-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'savings', label: 'Savings & Loans', icon: Wallet },
          { id: 'meetings', label: 'Meetings', icon: MessageCircle },
          { id: 'ai_docs', label: 'AI Resolutions', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={\`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-colors \${
              activeTab === tab.id 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-pink-50'
            }\`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-800 border-b pb-4">Group Members ({selectedGroup?.totalMembersCount})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedGroup?.members.map(m => (
                <div key={m.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Savings</p>
                    <p className="font-bold text-emerald-600">₹{m.savings_amount ?? selectedGroup.monthlySavingsPerMember}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'savings' && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-800">Financial Ledger</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              Total Savings Pool: ₹{selectedGroup?.totalSavingsPool.toLocaleString('en-IN')} <br/>
              Active Loan Pool: ₹{selectedGroup?.activeLoanPool.toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-800">Meeting Records</h3>
            <p className="text-gray-500 mt-2">Next meeting scheduled for {selectedGroup?.meetingDay}</p>
          </div>
        )}

        {activeTab === 'ai_docs' && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-800">AI Assistant & Resolutions</h3>
            <p className="text-gray-500 mt-2 mb-6">Draft resolutions, project proposals, and PDF statements instantly.</p>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700"
            >
              Open AI Assistant
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateGroupOpen && (
        <CreateGroupWizardWebModal 
          isOpen={isCreateGroupOpen} 
          onClose={() => setIsCreateGroupOpen(false)} 
          user={{ phone: userPhone }}
          onGroupCreated={handleGroupCreated}
        />
      )}
      
      {isAdminConsoleOpen && selectedGroup && (
        <GroupAdminConsoleWebModal 
          isOpen={isAdminConsoleOpen}
          onClose={() => setIsAdminConsoleOpen(false)}
          group={selectedGroup}
          members={selectedGroup.members}
          currentMember={userStatus?.memberRecord}
          onDataRefresh={loadData}
        />
      )}

      {isAiModalOpen && selectedGroup && (
        <GroupAiAssistantWebModal 
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          group={selectedGroup}
          totalSavingsPool={selectedGroup.totalSavingsPool}
          activeLoanPool={selectedGroup.activeLoanPool}
          memberCount={selectedGroup.totalMembersCount}
          monthlySavings={selectedGroup.monthlySavingsPerMember}
          leaderName={selectedGroup.leaderName}
        />
      )}
    </div>
  );
}
