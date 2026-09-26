import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Crisis Decision System" in response.json()["status"]

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "overall" in data
    assert "checks" in data
    assert "data_freshness" in data
    assert "fastapi" in data["checks"]
    assert data["checks"]["fastapi"]["status"] == "ok"
    assert "llm" in data["checks"]
    assert "model" in data["checks"]["llm"]

def test_data_freshness_endpoint():
    response = client.get("/data-freshness")
    assert response.status_code == 200
    data = response.json()
    assert "freshness" in data
    assert "markets" in data["freshness"]
    assert "news" in data["freshness"]

def test_tracker_audit_endpoint():
    response = client.get("/tracker")
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "metrics" in data
    assert "per_agent_accuracy" in data
    assert len(data["predictions"]) > 0

    metrics = data["metrics"]
    assert "overall_accuracy" in metrics
    assert "direction_accuracy" in metrics
    assert "magnitude_mape" in metrics
    assert "calibration_score" in metrics

    agent_acc = data["per_agent_accuracy"]
    assert "economic" in agent_acc
    assert "trade" in agent_acc
    assert "energy" in agent_acc
    assert "humanitarian" in agent_acc

def test_history_endpoint():
    response = client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert len(data["events"]) > 0

def test_prices_endpoint():
    response = client.post("/prices", json={"region": "global"})
    assert response.status_code == 200
    data = response.json()
    assert "prices" in data
    assert len(data["prices"]) > 0
