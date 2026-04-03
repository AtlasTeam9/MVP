export {
    createDeviceFromApiResponse,
    mapLoadSessionResponse,
    mapResultsToRequirementResults,
} from './dataMapper'
export {
    applyAnswerTransition,
    shouldUseGoBackFlow,
    postGoBackAnswer,
    postForwardAnswer,
} from './answerFlow'
export { clearLocalSessionState, deleteRemoteSessionIfPresent } from './lifecycle'
export { calculateCompletionPercentage } from './progressCalculator'
export {
    getFirstNodeOfTree,
    handleGoBackResponse,
    handleNextNodeSameTree,
    handleTreeCompleted,
    isPerAssetResults,
    navigateToNode,
    setCurrentNodeFromResponse,
    setPerAssetResultsFromExport,
    setSessionPositionFromResponse,
    syncCurrentNodeFromTree,
} from './navigationAndResults'
