/* eslint-disable camelcase */
import StateError from '@application/errors/StateError'
import { Node } from '@domain/Node'

export function isPerAssetResults(results) {
    if (!results || typeof results !== 'object') {
        return false
    }

    return Object.values(results).some(
        (value) => value && typeof value === 'object' && !Array.isArray(value)
    )
}

export async function setPerAssetResultsFromExport({
    sessionId,
    getFormattedAnswers,
    apiClientService,
    useSessionStore,
}) {
    if (!sessionId) {
        return
    }

    const payload = { answer: getFormattedAnswers() }
    const response = await apiClientService.post(`/session/${sessionId}/export`, payload)
    const data = typeof response === 'string' ? JSON.parse(response) : response

    if (data?.results) {
        useSessionStore.getState().setResultsPerAsset(data.results)
    }
}

export function setCurrentNodeFromResponse(response, position, { useSessionStore, useTreeStore }) {
    if (response.current_node) {
        useSessionStore
            .getState()
            .setCurrentNode(Node.fromApi(position?.current_node_id, response.current_node))
        return
    }

    const nodeFromStore = useTreeStore
        .getState()
        .getNodeByTreeIndexAndNodeId(position.current_tree_index, position.current_node_id)

    if (nodeFromStore) {
        useSessionStore.getState().setCurrentNode(nodeFromStore)
    } else {
        useSessionStore
            .getState()
            .setCurrentNode(new Node(position.current_node_id, 'Loading question...'))
    }
}

export function setSessionPositionFromResponse(position, { useSessionStore }) {
    useSessionStore
        .getState()
        .setDevicePosition(
            position.current_asset_index,
            position.current_tree_index,
            position.current_node_id
        )
}

export function syncCurrentNodeFromTree(
    currentTreeIndex,
    errorCode,
    errorMessage,
    { useSessionStore, useTreeStore }
) {
    const { currentNode } = useSessionStore.getState()

    if (!currentNode?.id) {
        return
    }

    const nodeFromTree = useTreeStore
        .getState()
        .getNodeByTreeIndexAndNodeId(currentTreeIndex, currentNode.id)

    if (!nodeFromTree) {
        throw new StateError(errorMessage, {
            code: errorCode,
            context: { currentTreeIndex, nodeId: currentNode.id },
        })
    }

    useSessionStore.getState().setCurrentNode(nodeFromTree)
}

export function getFirstNodeOfTree(treeIndex, { useTreeStore }) {
    return useTreeStore.getState().getNodeByTreeIndexAndNodeId(treeIndex, 'node1')
}

export function handleNextNodeSameTree(response, { useSessionStore, useTreeStore }) {
    const { current_asset_index, current_tree_index, next_node_id } = response

    const nextNode = useTreeStore
        .getState()
        .getNodeByTreeIndexAndNodeId(current_tree_index, next_node_id)

    if (!nextNode) {
        throw new StateError('Successive node not found in local state..', {
            code: 'TREE_NEXT_NODE_NOT_FOUND',
            context: { current_tree_index, next_node_id },
        })
    }

    useSessionStore
        .getState()
        .setDevicePosition(current_asset_index, current_tree_index, next_node_id)
    useSessionStore.getState().setCurrentNode(nextNode)
}

export function navigateToNode(treeIndex, assetIndex, nodeId, { useSessionStore, useTreeStore }) {
    const targetNodeId = nodeId ?? 'node1'
    const nextNode = useTreeStore.getState().getNodeByTreeIndexAndNodeId(treeIndex, targetNodeId)

    if (!nextNode) {
        throw new StateError('First node of the tree not found in local state.', {
            code: 'TREE_FIRST_NODE_NOT_FOUND',
            context: { treeIndex, assetIndex, nodeId: targetNodeId },
        })
    }

    useSessionStore.getState().setDevicePosition(assetIndex, treeIndex, targetNodeId)
    useSessionStore.getState().setCurrentNode(nextNode)
}

export async function handleTreeCompleted(response, previousAssetIndex, deps) {
    const {
        mapResultsToRequirementResults,
        useResultStore,
        useSessionStore,
        isPerAssetResults,
        setPerAssetResultsFromExport,
        getFormattedAnswers,
        apiClientService,
        navigateToNode,
    } = deps

    if (response.session_finished) {
        const transformedResults = mapResultsToRequirementResults(response.results)
        useResultStore.getState().setResults(transformedResults)

        if (isPerAssetResults(response.results)) {
            useSessionStore.getState().setResultsPerAsset(response.results)
        } else {
            await setPerAssetResultsFromExport({
                sessionId: useSessionStore.getState().sessionId,
                getFormattedAnswers,
                apiClientService,
                useSessionStore,
            })
        }

        useSessionStore.getState().setTestFinished(true)
        return
    }

    const { current_asset_index, current_tree_index, next_node_id } = response
    const assetChanged = current_asset_index !== previousAssetIndex
    const nodeId = assetChanged ? (next_node_id ?? 'node1') : 'node1'

    navigateToNode(current_tree_index, current_asset_index, nodeId, {
        useSessionStore,
        useTreeStore: deps.useTreeStore,
    })
}

export async function handleGoBackResponse(response, deps) {
    const {
        mapResultsToRequirementResults,
        useResultStore,
        useSessionStore,
        useTreeStore,
        isPerAssetResults,
        setPerAssetResultsFromExport,
        getFormattedAnswers,
        apiClientService,
    } = deps

    if (!response.found) {
        return
    }

    if (response.session_finished) {
        const transformedResults = mapResultsToRequirementResults(response.results)
        useResultStore.getState().setResults(transformedResults)

        if (isPerAssetResults(response.results)) {
            useSessionStore.getState().setResultsPerAsset(response.results)
        } else {
            await setPerAssetResultsFromExport({
                sessionId: useSessionStore.getState().sessionId,
                getFormattedAnswers,
                apiClientService,
                useSessionStore,
            })
        }

        useSessionStore.getState().setTestFinished(true)
        return
    }

    if (!response.node_id) {
        return
    }

    const nextNode = useTreeStore
        .getState()
        .getNodeByTreeIndexAndNodeId(response.current_tree_index, response.node_id)

    if (nextNode) {
        useSessionStore
            .getState()
            .setDevicePosition(
                response.current_asset_index,
                response.current_tree_index,
                response.node_id
            )
        useSessionStore.getState().setCurrentNode(nextNode)
    }
}
