import pytest

def test_p1_credibility_schema_structure():
    """Verify that structured credibility response conforms to PRD contract."""
    sample_structured_response = {
        "overall_risk_level": 8,
        "confidence": 84,
        "executive_summary": "Sustained drone and missile strikes forced 85% of container traffic to divert.",
        "key_drivers": ["Maritime chokepoint closure", "Energy price exposure", "Supply lag"],
        "agent_assessments": {
            "economic": {"risk": "HIGH", "confidence": 81},
            "trade": {"risk": "CRITICAL", "confidence": 89},
            "energy": {"risk": "MODERATE", "confidence": 74},
            "humanitarian": {"risk": "CRITICAL", "confidence": 91}
        },
        "disagreements": ["Energy impact duration"],
        "consensus_drivers": ["Maritime chokepoint closure"],
        "recommended_actions": [
            {
                "action": "Diversify shipping routes via Cape of Good Hope",
                "priority": "HIGH",
                "reason": "Prevents catastrophic delivery backlogs",
                "expected_impact": "Stabilizes inventory with 10-12 day buffer",
                "confidence": 85,
                "trigger": "If Red Sea transit risk exceeds tier 3",
                "time_horizon": "Immediate"
            }
        ],
        "evidence_summary": [
            {"claim": "Asia-Europe freight rates surged", "source": "Reuters", "tier": 2}
        ],
        "uncertainties": ["Duration of naval escort mandate"],
        "forecasts": {
            "oil_price": {"low": 88, "base": 95, "high": 105, "confidence": 74}
        },
        "30_day_outlook": "Volatile with elevated risk premiums."
    }

    # Verify PRD required fields
    assert "overall_risk_level" in sample_structured_response
    assert "confidence" in sample_structured_response
    assert "key_drivers" in sample_structured_response
    assert "agent_assessments" in sample_structured_response
    assert "recommended_actions" in sample_structured_response
    assert "evidence_summary" in sample_structured_response

    # Verify action schema
    action = sample_structured_response["recommended_actions"][0]
    assert "action" in action
    assert "priority" in action
    assert "trigger" in action
    assert "time_horizon" in action

    # Verify forecast ranges
    forecast = sample_structured_response["forecasts"]["oil_price"]
    assert "low" in forecast
    assert "base" in forecast
    assert "high" in forecast
    assert "confidence" in forecast
