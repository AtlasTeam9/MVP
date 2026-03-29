const CODE_MESSAGE_MAP = {
    NETWORK_UNREACHABLE: 'Impossible to reach the server. Please check your connection.',
    HTTP_400: 'Richiesta non valida. Verifica i dati inseriti.',
    HTTP_404: 'Risorsa non trovata.',
    HTTP_422: 'The file inserted is not valid.',
    HTTP_500: 'Errore interno del server. Riprova tra poco.',
    TREE_NEXT_NODE_NOT_FOUND: 'Impossibile proseguire: nodo successivo non disponibile.',
    TREE_PREVIOUS_NODE_NOT_FOUND: 'Impossibile tornare indietro: nodo precedente non disponibile.',
    TREE_FORWARD_NODE_NOT_FOUND: 'Impossibile avanzare: nodo non disponibile.',
    TREE_FIRST_NODE_NOT_FOUND: 'Impossibile aprire il questionario: nodo iniziale non trovato.',
    EXPORT_EMPTY_RESPONSE: 'Export non riuscito: risposta vuota dal server.',
    EXPORT_DEVICE_REQUIRED: 'Nessun dispositivo selezionato per l export.',
}

export function getUserErrorMessage(appError) {
    return CODE_MESSAGE_MAP[appError?.code] || appError?.message || 'Errore inatteso.'
}
