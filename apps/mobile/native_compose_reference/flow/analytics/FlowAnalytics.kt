package com.poovisri.mobile.flow.analytics

import android.os.Bundle

interface FlowAnalyticsTracker {
    fun logOptionSelected(nodeId: String, optionLabel: String, userId: String? = null)
    fun logComingSoonViewed(nodeId: String, title: String?, userId: String? = null)
    fun logPurchaseViewed(nodeId: String, title: String?, purchaseUrl: String?, userId: String? = null)
    fun logPurchaseInitiated(nodeId: String, purchaseUrl: String?, userId: String? = null)
    fun logNotifyMeSubmitted(nodeId: String, userId: String? = null)
    fun logStartOver(fromNodeId: String, userId: String? = null)
}

class DefaultFlowAnalytics : FlowAnalyticsTracker {
    override fun logOptionSelected(nodeId: String, optionLabel: String, userId: String?) {
        println("[Analytics] Event: flow_option_selected | Node: $nodeId | Option: $optionLabel | User: $userId")
    }

    override fun logComingSoonViewed(nodeId: String, title: String?, userId: String?) {
        println("[Analytics] Event: flow_leaf_coming_soon_viewed | Node: $nodeId | Title: $title | User: $userId")
    }

    override fun logPurchaseViewed(nodeId: String, title: String?, purchaseUrl: String?, userId: String?) {
        println("[Analytics] Event: flow_leaf_purchase_viewed | Node: $nodeId | Title: $title | User: $userId")
    }

    override fun logPurchaseInitiated(nodeId: String, purchaseUrl: String?, userId: String?) {
        println("[Analytics] Event: flow_purchase_initiated | Node: $nodeId | URL: $purchaseUrl | User: $userId")
    }

    override fun logNotifyMeSubmitted(nodeId: String, userId: String?) {
        println("[Analytics] Event: flow_notify_me_submitted | Node: $nodeId | User: $userId")
    }

    override fun logStartOver(fromNodeId: String, userId: String?) {
        println("[Analytics] Event: flow_start_over | From: $fromNodeId | User: $userId")
    }
}
