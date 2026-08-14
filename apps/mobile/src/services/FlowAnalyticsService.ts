import { FlowAnalyticsEvent } from '../types/flow';
import { supabase } from '../lib/supabase';

class FlowAnalyticsService {
  private static instance: FlowAnalyticsService;

  public static getInstance(): FlowAnalyticsService {
    if (!FlowAnalyticsService.instance) {
      FlowAnalyticsService.instance = new FlowAnalyticsService();
    }
    return FlowAnalyticsService.instance;
  }

  /**
   * Log an event whenever an option in a branch is tapped
   */
  public logOptionSelected(nodeId: string, optionLabel: string, userId?: string) {
    this.trackEvent({
      event: 'flow_option_selected',
      nodeId,
      optionLabel,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log whenever a user lands on a LEAF_COMING_SOON node
   */
  public logComingSoonViewed(nodeId: string, title?: string, userId?: string) {
    this.trackEvent({
      event: 'flow_leaf_coming_soon_viewed',
      nodeId,
      userId,
      timestamp: new Date().toISOString(),
      metadata: { title },
    });
  }

  /**
   * Log whenever a user lands on a LEAF_PURCHASE node
   */
  public logPurchaseViewed(nodeId: string, title?: string, purchaseUrl?: string, userId?: string) {
    this.trackEvent({
      event: 'flow_leaf_purchase_viewed',
      nodeId,
      userId,
      timestamp: new Date().toISOString(),
      metadata: { title, purchaseUrl },
    });
  }

  /**
   * Log when user taps "Take Test / Purchase" CTA
   */
  public logPurchaseInitiated(nodeId: string, purchaseUrl?: string, userId?: string) {
    this.trackEvent({
      event: 'flow_purchase_initiated',
      nodeId,
      userId,
      timestamp: new Date().toISOString(),
      metadata: { purchaseUrl },
    });
  }

  /**
   * Log when user taps "Notify Me" on a Coming Soon node
   */
  public logNotifyMeSubmitted(nodeId: string, userId?: string) {
    this.trackEvent({
      event: 'flow_notify_me_submitted',
      nodeId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log reset to root
   */
  public logStartOver(fromNodeId: string, userId?: string) {
    this.trackEvent({
      event: 'flow_started_over',
      nodeId: fromNodeId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  private async trackEvent(payload: FlowAnalyticsEvent) {
    console.log(`[FlowAnalytics] 📊 Event: ${payload.event}`, payload);

    try {
      // Persist to Supabase analytics table if available (gracefully catches if table does not exist)
      await supabase
        .from('flow_analytics')
        .insert({
          event_type: payload.event,
          node_id: payload.nodeId,
          option_label: payload.optionLabel || null,
          user_id: payload.userId || null,
          metadata: payload.metadata || {},
          created_at: payload.timestamp,
        })
        .select()
        .maybeSingle();
    } catch (err) {
      // Fire-and-forget: analytics failure should never block UI
    }
  }
}

export const flowAnalytics = FlowAnalyticsService.getInstance();
