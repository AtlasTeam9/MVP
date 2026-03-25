from app.application.state import AppState


class TestAppState:
    """Classe che raggruppa i test per lo stato globale dell'applicazione."""

    def test_app_state_initialization(self):
        # Verifica che le liste e i dizionari di stato partano vuoti all'avvio
        assert AppState.trees == []
        assert AppState.sessions == {}
