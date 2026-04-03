import useTreeStore from '@state/TreeStore'
import { selectSessionRunnerTrees } from '@state/selectors/compositeSelectors'

export function useSessionRunnerTrees() {
    return useTreeStore(selectSessionRunnerTrees)
}
