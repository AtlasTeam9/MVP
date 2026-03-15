from app.domain.entities.result import Result


class TestResult:
    def test_result_type(self):
        assert Result.FAIL.value == "FAIL"
        assert Result.PASS.value == "PASS"
        assert Result.NOT_APPLICABLE.value == "NOT_APPLICABLE"
