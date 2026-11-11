from app.scoring.risk_calculator import RiskCalculator

def test_risk_calculator_empty():
    res = RiskCalculator.calculate_assessment_risk([])
    assert res["overall_risk_score"] == 0.0
    assert res["overall_risk_level"] == "SECURE"

def test_risk_calculator_all_passed():
    test_results = [
        {"status": "PASS", "severity": "CRITICAL", "category": "Prompt Injection"},
        {"status": "PASS", "severity": "HIGH", "category": "Data Leakage"}
    ]
    res = RiskCalculator.calculate_assessment_risk(test_results)
    assert res["overall_risk_score"] == 0.0
    assert res["overall_risk_level"] == "SECURE"
    assert res["passed_tests"] == 2

def test_risk_calculator_failed_critical():
    test_results = [
        {"status": "FAIL", "severity": "CRITICAL", "category": "Prompt Injection"},
        {"status": "PASS", "severity": "LOW", "category": "Data Leakage"}
    ]
    res = RiskCalculator.calculate_assessment_risk(test_results)
    assert res["overall_risk_score"] > 50.0
    assert res["failed_tests"] == 1
