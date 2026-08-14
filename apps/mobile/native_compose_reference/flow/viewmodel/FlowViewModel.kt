package com.poovisri.mobile.flow.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.poovisri.mobile.flow.analytics.DefaultFlowAnalytics
import com.poovisri.mobile.flow.analytics.FlowAnalyticsTracker
import com.poovisri.mobile.flow.data.FlowRepository
import com.poovisri.mobile.flow.model.FlowBreadcrumb
import com.poovisri.mobile.flow.model.FlowNode
import com.poovisri.mobile.flow.model.FlowType
import com.poovisri.mobile.flow.model.PendingRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FlowUiState(
    val currentNode: FlowNode? = null,
    val historyStack: List<String> = listOf("root"),
    val breadcrumbs: List<FlowBreadcrumb> = listOf(FlowBreadcrumb("root", "Home")),
    val isLoading: Boolean = true,
    val error: String? = null,
    val isNotified: Boolean = false,
    val isNotifying: Boolean = false
)

class FlowViewModel(
    private val repository: FlowRepository,
    private val analytics: FlowAnalyticsTracker = DefaultFlowAnalytics(),
    private val currentUserId: String? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(FlowUiState())
    val uiState: StateFlow<FlowUiState> = _uiState.asStateFlow()

    init {
        loadNode("root", null, isPushing = false)
    }

    fun selectOption(nextId: String, optionLabel: String) {
        val currentId = _uiState.value.currentNode?.id ?: "unknown"
        analytics.logOptionSelected(currentId, optionLabel, currentUserId)

        val updatedStack = _uiState.value.historyStack + nextId
        _uiState.update { it.copy(historyStack = updatedStack) }

        loadNode(nextId, optionLabel, isPushing = true)
    }

    fun goBack(): Boolean {
        val stack = _uiState.value.historyStack
        if (stack.size <= 1) {
            return false // Caller handles exit
        }

        val updatedStack = stack.dropLast(1)
        val prevNodeId = updatedStack.last()

        val updatedBreadcrumbs = if (_uiState.value.breadcrumbs.size > 1) {
            _uiState.value.breadcrumbs.dropLast(1)
        } else {
            _uiState.value.breadcrumbs
        }

        _uiState.update {
            it.copy(
                historyStack = updatedStack,
                breadcrumbs = updatedBreadcrumbs
            )
        }

        loadNode(prevNodeId, null, isPushing = false)
        return true
    }

    fun resetToRoot() {
        val currentId = _uiState.value.currentNode?.id ?: "root"
        analytics.logStartOver(currentId, currentUserId)

        _uiState.update {
            it.copy(
                historyStack = listOf("root"),
                breadcrumbs = listOf(FlowBreadcrumb("root", "Home"))
            )
        }
        loadNode("root", null, isPushing = false)
    }

    fun jumpToBreadcrumb(index: Int) {
        val breadcrumbs = _uiState.value.breadcrumbs
        if (index >= breadcrumbs.size - 1) return

        val target = breadcrumbs[index]
        val stack = _uiState.value.historyStack
        val targetIndexInStack = stack.indexOf(target.nodeId)

        if (targetIndexInStack != -1) {
            val newStack = stack.take(targetIndexInStack + 1)
            val newBreadcrumbs = breadcrumbs.take(index + 1)

            _uiState.update {
                it.copy(
                    historyStack = newStack,
                    breadcrumbs = newBreadcrumbs
                )
            }
            loadNode(target.nodeId, null, isPushing = false)
        }
    }

    fun submitNotifyMe() {
        val node = _uiState.value.currentNode ?: return
        if (_uiState.value.isNotified || _uiState.value.isNotifying) return

        viewModelScope.launch {
            _uiState.update { it.copy(isNotifying = true) }
            repository.savePendingRequest(
                PendingRequest(
                    nodeId = node.id,
                    userId = currentUserId
                )
            )
            analytics.logNotifyMeSubmitted(node.id, currentUserId)
            _uiState.update { it.copy(isNotified = true, isNotifying = false) }
        }
    }

    private fun loadNode(nodeId: String, optionLabel: String?, isPushing: Boolean) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null, isNotified = false) }
            try {
                val node = repository.getNode(nodeId)

                // Track analytics
                when (node.type) {
                    FlowType.LEAF_COMING_SOON -> analytics.logComingSoonViewed(node.id, node.title, currentUserId)
                    FlowType.LEAF_PURCHASE -> analytics.logPurchaseViewed(node.id, node.title, node.purchaseUrl, currentUserId)
                    FlowType.BRANCH -> { /* no-op */ }
                }

                val newBreadcrumbs = if (isPushing && optionLabel != null) {
                    val cleanLabel = optionLabel.take(20)
                    _uiState.value.breadcrumbs + FlowBreadcrumb(node.id, cleanLabel)
                } else {
                    _uiState.value.breadcrumbs
                }

                _uiState.update {
                    it.copy(
                        currentNode = node,
                        breadcrumbs = newBreadcrumbs,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load flow step: ${e.localizedMessage}"
                    )
                }
            }
        }
    }
}
