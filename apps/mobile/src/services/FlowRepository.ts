import { FlowNode, PendingRequest } from '../types/flow';
import { supabase } from '../lib/supabase';

// Local bundled JSON tree as base source
const localFlowTreeData = require('../../assets/flow_tree.json');

/**
 * Abstract Flow Repository Interface
 * Defines the contract for fetching flow nodes and saving interest requests.
 * Can be swapped for Firebase Firestore, Supabase, or Remote Config without altering UI.
 */
export interface FlowRepository {
  getNode(id: string): Promise<FlowNode>;
  getAllNodes(): Promise<Record<string, FlowNode>>;
  savePendingRequest(request: {
    nodeId: string;
    userId?: string;
    phone?: string;
    userName?: string;
  }): Promise<{ success: boolean; error?: string }>;
}

/**
 * Local JSON Implementation of FlowRepository
 */
export class LocalFlowRepository implements FlowRepository {
  private tree: Record<string, FlowNode>;

  constructor(treeData: Record<string, FlowNode> = localFlowTreeData) {
    this.tree = treeData;
  }

  public async getNode(id: string): Promise<FlowNode> {
    const node = this.tree[id];
    if (!node) {
      // Fallback safe coming soon node if node ID not found
      return {
        id,
        type: 'LEAF_COMING_SOON',
        title: 'Module In Development',
        message: 'This specific branch is currently being developed. Tap Notify Me to be alerted upon release.',
      };
    }
    return node;
  }

  public async getAllNodes(): Promise<Record<string, FlowNode>> {
    return this.tree;
  }

  public async savePendingRequest(request: {
    nodeId: string;
    userId?: string;
    phone?: string;
    userName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Persist to Supabase pending_requests table
      const { error } = await supabase
        .from('pending_requests')
        .insert({
          node_id: request.nodeId,
          user_id: request.userId || null,
          phone: request.phone || null,
          user_name: request.userName || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('[FlowRepository] Supabase pending_requests insert error:', error.message);
        // If table does not exist or network fails, we still return true so user gets optimistic confirmation
      }
      return { success: true };
    } catch (err: any) {
      console.warn('[FlowRepository] Error saving pending request:', err);
      return { success: true }; // Optimistic UI
    }
  }
}

/**
 * Remote / Supabase Firestore-ready FlowRepository Implementation
 * Reads from remote database, with fallback to local JSON.
 */
export class RemoteFlowRepository implements FlowRepository {
  private localFallback: LocalFlowRepository;

  constructor() {
    this.localFallback = new LocalFlowRepository();
  }

  public async getNode(id: string): Promise<FlowNode> {
    try {
      const { data, error } = await supabase
        .from('flow_nodes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data && !error) {
        return {
          id: data.id,
          type: data.type,
          question: data.question,
          options: data.options,
          title: data.title,
          description: data.description,
          purchaseUrl: data.purchase_url,
          message: data.message,
        };
      }
    } catch (e) {
      // Fallback to local
    }
    return this.localFallback.getNode(id);
  }

  public async getAllNodes(): Promise<Record<string, FlowNode>> {
    return this.localFallback.getAllNodes();
  }

  public async savePendingRequest(request: {
    nodeId: string;
    userId?: string;
    phone?: string;
    userName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.localFallback.savePendingRequest(request);
  }
}

// Default singleton repository
export const defaultFlowRepository: FlowRepository = new LocalFlowRepository();
