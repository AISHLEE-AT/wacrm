package com.poovisri.mobile.flow.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.poovisri.mobile.flow.model.FlowNode
import com.poovisri.mobile.flow.model.FlowType
import com.poovisri.mobile.flow.model.PendingRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStreamReader

class LocalAssetFlowRepository(
    private val context: Context,
    private val assetFileName: String = "flow_tree.json"
) : FlowRepository {

    private val gson = Gson()
    private var cachedTree: Map<String, FlowNode>? = null

    private suspend fun getTree(): Map<String, FlowNode> = withContext(Dispatchers.IO) {
        cachedTree?.let { return@withContext it }

        try {
            val inputStream = context.assets.open(assetFileName)
            val reader = InputStreamReader(inputStream)
            val type = object : TypeToken<Map<String, FlowNode>>() {}.type
            val parsedTree: Map<String, FlowNode> = gson.fromJson(reader, type)
            reader.close()
            cachedTree = parsedTree
            parsedTree
        } catch (e: Exception) {
            e.printStackTrace()
            emptyMap()
        }
    }

    override suspend fun getNode(id: String): FlowNode = withContext(Dispatchers.IO) {
        val tree = getTree()
        tree[id] ?: FlowNode(
            id = id,
            type = FlowType.LEAF_COMING_SOON,
            title = "Topic Coming Soon",
            message = "This examination module is currently under development. Tap below to be notified upon launch."
        )
    }

    override suspend fun savePendingRequest(request: PendingRequest): Boolean = withContext(Dispatchers.IO) {
        // Can be routed to Firebase Firestore or Supabase
        println("[FlowRepository] Saved pending request for node: ${request.nodeId}, user: ${request.userId}")
        true
    }
}
