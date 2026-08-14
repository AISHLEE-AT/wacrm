package com.poovisri.mobile.flow.data

import com.poovisri.mobile.flow.model.FlowNode
import com.poovisri.mobile.flow.model.PendingRequest

/**
 * Repository interface for retrieving flow nodes and persisting user interest requests.
 * Decoupled from UI to allow seamless swapping between local Asset JSON, Firebase Firestore, or Remote Config.
 */
interface FlowRepository {
    /**
     * Retrieve a node by its unique identifier
     */
    suspend fun getNode(id: String): FlowNode

    /**
     * Save user request on Coming Soon nodes for feature interest tracking
     */
    suspend fun savePendingRequest(request: PendingRequest): Boolean
}
