from typing import List, Dict, Any

SEVERITY_WEIGHTS = {
    "LOW": 1.0,
    "MEDIUM": 2.0,
    "HIGH": 3.0,
    "CRITICAL": 4.0
}

class RiskCalculator:
    """
    Transparent mathematical Risk Scoring Engine for security assessments.
    Computes category breakdowns, weighted vulnerability scores, and overall risk levels.
    """

    @staticmethod
    def calculate_assessment_risk(test_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not test_results:
            return {
                "overall_risk_score": 0.0,
                "overall_risk_percentage": 0.0,
                "overall_risk_level": "SECURE",
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "blocked_tests": 0,
                "severity_counts": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
                "category_breakdown": []
            }

        total_tests = len(test_results)
        passed_tests = 0
        failed_tests = 0
        blocked_tests = 0

        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        category_map: Dict[str, Dict[str, Any]] = {}

        total_weighted_penalty = 0.0
        max_possible_weight = 0.0

        for res in test_results:
            status = res.get("status", "PASS").upper()
            sev = res.get("severity", "LOW").upper()
            cat = res.get("category", "General Security")

            weight = SEVERITY_WEIGHTS.get(sev, 1.0)
            max_possible_weight += weight

            # Increment count
            if status == "FAIL":
                failed_tests += 1
                total_weighted_penalty += weight
                severity_counts[sev] = severity_counts.get(sev, 0) + 1
            elif status in ["BLOCKED", "WARNING"]:
                blocked_tests += 1
                total_weighted_penalty += (weight * 0.4) # Partial penalty for unhandled blocked attempts
                severity_counts[sev] = severity_counts.get(sev, 0) + 1
            else:
                passed_tests += 1

            # Group by category
            if cat not in category_map:
                category_map[cat] = {
                    "category": cat,
                    "total_tests": 0,
                    "failed_tests": 0,
                    "passed_tests": 0,
                    "weighted_penalty": 0.0,
                    "max_weight": 0.0
                }

            c_info = category_map[cat]
            c_info["total_tests"] += 1
            c_info["max_weight"] += weight

            if status == "FAIL":
                c_info["failed_tests"] += 1
                c_info["weighted_penalty"] += weight
            elif status in ["BLOCKED", "WARNING"]:
                c_info["failed_tests"] += 1
                c_info["weighted_penalty"] += (weight * 0.4)
            else:
                c_info["passed_tests"] += 1

        # Calculate Overall Risk Percentage
        if max_possible_weight > 0:
            risk_pct = round((total_weighted_penalty / max_possible_weight) * 100.0, 1)
        else:
            risk_pct = 0.0

        # Classify Risk Level
        if risk_pct <= 15.0:
            overall_risk_level = "SECURE"
        elif risk_pct <= 35.0:
            overall_risk_level = "LOW"
        elif risk_pct <= 60.0:
            overall_risk_level = "MEDIUM"
        elif risk_pct <= 80.0:
            overall_risk_level = "HIGH"
        else:
            overall_risk_level = "CRITICAL"

        # Format category breakdown
        category_breakdown = []
        for cat, c_data in category_map.items():
            cat_pct = round((c_data["weighted_penalty"] / c_data["max_weight"]) * 100.0, 1) if c_data["max_weight"] > 0 else 0.0
            if cat_pct <= 15.0:
                cat_level = "SECURE"
            elif cat_pct <= 35.0:
                cat_level = "LOW"
            elif cat_pct <= 60.0:
                cat_level = "MEDIUM"
            elif cat_pct <= 80.0:
                cat_level = "HIGH"
            else:
                cat_level = "CRITICAL"

            category_breakdown.append({
                "category": cat,
                "total_tests": c_data["total_tests"],
                "failed_tests": c_data["failed_tests"],
                "passed_tests": c_data["passed_tests"],
                "risk_score": cat_pct,
                "risk_level": cat_level
            })

        return {
            "overall_risk_score": risk_pct,
            "overall_risk_percentage": risk_pct,
            "overall_risk_level": overall_risk_level,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "blocked_tests": blocked_tests,
            "severity_counts": severity_counts,
            "category_breakdown": category_breakdown
        }
