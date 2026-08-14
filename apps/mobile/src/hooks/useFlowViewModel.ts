import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { BackHandler } from 'react-native';
import { FlowNode, FlowBreadcrumb } from '../types/flow';
import { FlowRepository, defaultFlowRepository } from '../services/FlowRepository';
import { flowAnalytics } from '../services/FlowAnalyticsService';
import { AppContext } from '../context/AppContext';

interface UseFlowViewModelProps {
  initialNodeId?: string;
  repository?: FlowRepository;
  onExitFlow?: () => void;
}

export function useFlowViewModel({
  initialNodeId = 'root',
  repository = defaultFlowRepository,
  onExitFlow,
}: UseFlowViewModelProps = {}) {
  const { user } = useContext(AppContext) || {};

  const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>([initialNodeId]);
  const [breadcrumbs, setBreadcrumbs] = useState<FlowBreadcrumb[]>([
    { nodeId: initialNodeId, label: 'Home' },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotified, setIsNotified] = useState<boolean>(false);
  const [isNotifying, setIsNotifying] = useState<boolean>(false);

  // Helper to extract a short clean label for breadcrumbs
  const extractBreadcrumbLabel = (node: FlowNode, optionLabel?: string): string => {
    if (optionLabel) {
      // Remove emojis and clean
      const cleaned = optionLabel.replace(/[^\w\s\u0B80-\u0BFF]/gi, '').trim();
      return cleaned.length > 20 ? cleaned.slice(0, 18) + '...' : cleaned;
    }
    if (node.title) {
      return node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title;
    }
    return node.id;
  };

  // Load a node by ID
  const loadNode = useCallback(
    async (nodeId: string, optionLabel?: string, isPushing = true) => {
      setIsLoading(true);
      setError(null);
      setIsNotified(false);

      try {
        const node = await repository.getNode(nodeId);
        setCurrentNode(node);

        // Analytics tracking on node landing
        if (node.type === 'LEAF_COMING_SOON') {
          flowAnalytics.logComingSoonViewed(node.id, node.title, user?.phone || user?.id);
        } else if (node.type === 'LEAF_PURCHASE') {
          flowAnalytics.logPurchaseViewed(node.id, node.title, node.purchaseUrl, user?.phone || user?.id);
        }

        if (isPushing && optionLabel) {
          const newBreadcrumb: FlowBreadcrumb = {
            nodeId: node.id,
            label: extractBreadcrumbLabel(node, optionLabel),
          };
          setBreadcrumbs((prev) => [...prev, newBreadcrumb]);
        }
      } catch (err: any) {
        console.error('[useFlowViewModel] Error loading node:', err);
        setError('Failed to load assessment step. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [repository, user]
  );

  // Initial load
  useEffect(() => {
    loadNode(initialNodeId, undefined, false);
  }, [initialNodeId, loadNode]);

  // Option selected action
  const selectOption = useCallback(
    async (nextId: string, optionLabel: string) => {
      if (!currentNode) return;

      // Log analytics
      flowAnalytics.logOptionSelected(currentNode.id, optionLabel, user?.phone || user?.id);

      setHistoryStack((prev) => [...prev, nextId]);
      await loadNode(nextId, optionLabel, true);
    },
    [currentNode, loadNode, user]
  );

  // Go back action
  const goBack = useCallback(async () => {
    if (historyStack.length <= 1) {
      if (onExitFlow) {
        onExitFlow();
      }
      return false;
    }

    const newStack = [...historyStack];
    newStack.pop(); // Remove current
    const prevNodeId = newStack[newStack.length - 1];

    setHistoryStack(newStack);
    setBreadcrumbs((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
    await loadNode(prevNodeId, undefined, false);
    return true;
  }, [historyStack, loadNode, onExitFlow]);

  // Reset to root action
  const resetToRoot = useCallback(async () => {
    if (!currentNode) return;
    flowAnalytics.logStartOver(currentNode.id, user?.phone || user?.id);

    setHistoryStack(['root']);
    setBreadcrumbs([{ nodeId: 'root', label: 'Home' }]);
    await loadNode('root', undefined, false);
  }, [currentNode, loadNode, user]);

  // Jump to specific breadcrumb
  const jumpToBreadcrumb = useCallback(
    async (index: number) => {
      if (index >= breadcrumbs.length - 1) return;
      const target = breadcrumbs[index];
      const targetIndex = historyStack.indexOf(target.nodeId);

      if (targetIndex !== -1) {
        const newStack = historyStack.slice(0, targetIndex + 1);
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setHistoryStack(newStack);
        setBreadcrumbs(newBreadcrumbs);
        await loadNode(target.nodeId, undefined, false);
      }
    },
    [breadcrumbs, historyStack, loadNode]
  );

  // Submit "Notify Me" interest
  const submitNotifyMe = useCallback(async () => {
    if (!currentNode || isNotified || isNotifying) return;

    setIsNotifying(true);
    try {
      await repository.savePendingRequest({
        nodeId: currentNode.id,
        userId: user?.id,
        phone: user?.phone,
        userName: user?.name,
      });

      flowAnalytics.logNotifyMeSubmitted(currentNode.id, user?.phone || user?.id);
      setIsNotified(true);
    } catch (e) {
      setIsNotified(true); // Optimistic success
    } finally {
      setIsNotifying(false);
    }
  }, [currentNode, isNotified, isNotifying, repository, user]);

  // Hardware Back button handling on Android
  useEffect(() => {
    const backAction = () => {
      if (historyStack.length > 1) {
        goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [goBack, historyStack.length]);

  return {
    currentNode,
    historyStack,
    breadcrumbs,
    isLoading,
    error,
    isNotified,
    isNotifying,
    canGoBack: historyStack.length > 1,
    selectOption,
    goBack,
    resetToRoot,
    jumpToBreadcrumb,
    submitNotifyMe,
  };
}
