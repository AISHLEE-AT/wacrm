package com.poovisri.mobile.flow.model

import com.google.gson.annotations.SerializedName

enum class FlowType {
    @SerializedName("BRANCH")
    BRANCH,

    @SerializedName("LEAF_PURCHASE")
    LEAF_PURCHASE,

    @SerializedName("LEAF_COMING_SOON")
    LEAF_COMING_SOON
}

data class FlowOption(
    @SerializedName("label")
    val label: String,

    @SerializedName("nextId")
    val nextId: String
)

data class FlowNode(
    @SerializedName("id")
    val id: String,

    @SerializedName("type")
    val type: FlowType,

    @SerializedName("question")
    val question: String? = null,

    @SerializedName("options")
    val options: List<FlowOption>? = null,

    @SerializedName("title")
    val title: String? = null,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("purchaseUrl")
    val purchaseUrl: String? = null,

    @SerializedName("message")
    val message: String? = null
)

data class FlowBreadcrumb(
    val nodeId: String,
    val label: String
)

data class PendingRequest(
    val nodeId: String,
    val userId: String? = null,
    val phone: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
