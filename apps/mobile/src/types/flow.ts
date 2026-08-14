export type FlowType = 'BRANCH' | 'LEAF_PURCHASE' | 'LEAF_COMING_SOON';

export interface FlowOption {
  label: string;
  nextId: string;
}

export interface FlowNode {
  id: string;
  type: FlowType;
  question?: string;
  options?: FlowOption[];
  title?: string;
  description?: string;
  purchaseUrl?: string;
  message?: string;
}

export interface FlowBreadcrumb {
  nodeId: string;
  label: string;
}

export interface PendingRequest {
  id?: string;
  node_id: string;
  user_id?: string;
  phone?: string;
  user_name?: string;
  created_at?: string;
  status?: string;
}

export interface FlowAnalyticsEvent {
  event: 'flow_option_selected' | 'flow_leaf_coming_soon_viewed' | 'flow_leaf_purchase_viewed' | 'flow_purchase_initiated' | 'flow_notify_me_submitted' | 'flow_started_over';
  nodeId: string;
  optionLabel?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
