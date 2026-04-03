import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useResultStore from '@state/ResultStore'
import useSessionStore from '@state/SessionStore'
import { selectResults } from '@state/selectors/resultSelectors'
import { selectResultViewSessionState } from '@state/selectors/sessionSelectors'
import { useCurrentDevice } from '@application/hooks/useCurrentDevice'
import { useExportResults } from '@application/hooks/useExportResults'
import { useExportSession } from '@application/hooks/useExportSession'
import { resetSessionAndNavigateHome } from '@application/services/NavigationService'

export function useResultViewLogic() {
    const navigate = useNavigate()
    const results = useResultStore(selectResults)
    const device = useCurrentDevice()
    const { sessionId, isTestFinished, isSessionUploaded, resultsPerAsset } =
        useSessionStore(useShallow(selectResultViewSessionState))
    const [expandedRequirement, setExpandedRequirement] = useState(null)

    const {
        isExporting,
        showFormatDialog,
        handleExportClick,
        handleExportFormat,
        setShowFormatDialog,
    } = useExportResults(sessionId)
    const { isExportingSession, handleExportSessionClick } = useExportSession(sessionId)

    const handleResumeSession = () => {
        navigate('/session/test')
    }

    const handleModifySession = () => {
        navigate('/session/modify')
    }

    const handleHome = () => resetSessionAndNavigateHome(navigate)

    const handleToggleRequirement = (requirementId) => {
        setExpandedRequirement((prev) => (prev === requirementId ? null : requirementId))
    }

    return {
        results,
        device,
        resultsPerAsset,
        isTestFinished,
        isSessionUploaded,
        expandedRequirement,
        isExporting,
        showFormatDialog,
        isExportingSession,
        handleResumeSession,
        handleModifySession,
        handleHome,
        handleToggleRequirement,
        handleExportClick,
        handleExportFormat,
        handleExportSessionClick,
        setShowFormatDialog,
    }
}


