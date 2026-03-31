export { createDeviceFromApiResponse, mapResultsToRequirementResults } from './dataMapper'
export {
    applyAnswerTransition,
    shouldUseGoBackFlow,
    postGoBackAnswer,
    postForwardAnswer,
} from './answerFlow'
export { clearLocalSessionState, deleteRemoteSessionIfPresent } from './lifecycle'
