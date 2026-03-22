from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/crisis_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class CrisisEvent(Base):
    __tablename__ = "crisis_events"

    id              = Column(Integer, primary_key=True, index=True)
    event           = Column(String, nullable=False)
    region          = Column(String, default="global")
    event_type      = Column(String, default="analyze")  # analyze or simulate
    risk_level      = Column(Integer)
    executive_summary = Column(Text)
    top_impacts     = Column(Text)   # stored as JSON string
    actions         = Column(Text)   # stored as JSON string
    outlook         = Column(Text)
    created_at      = Column(DateTime, default=datetime.utcnow)

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String)        # e.g. "Gold India"
    ticker      = Column(String)        # e.g. "GC=F"
    threshold   = Column(Float)         # e.g. 15000
    condition   = Column(String)        # "above" or "below"
    region      = Column(String)        # e.g. "india"
    currency    = Column(String)        # e.g. "INR"
    triggered   = Column(Integer, default=0)  # 0 = active, 1 = triggered
    created_at  = Column(DateTime, default=datetime.utcnow)
    triggered_at = Column(DateTime, nullable=True)

class MarketSnapshot(Base):
    __tablename__ = "market_snapshots"

    id                  = Column(Integer, primary_key=True, index=True)
    event_id            = Column(Integer, ForeignKey("crisis_events.id"), index=True)
    ticker              = Column(String)        # e.g. "CL=F"
    ticker_name         = Column(String)        # e.g. "Crude Oil"
    price_at_prediction = Column(Float)
    created_at          = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

def save_event(event: str, region: str, event_type: str, report: dict):
    import json
    db = SessionLocal()
    try:
        crisis = CrisisEvent(
            event=event,
            region=region,
            event_type=event_type,
            risk_level=report.get("overall_risk_level"),
            executive_summary=report.get("executive_summary"),
            top_impacts=json.dumps(report.get("top_5_predicted_impacts", [])),
            actions=json.dumps(report.get("immediate_actions", [])),
            outlook=report.get("30_day_outlook")
        )
        db.add(crisis)
        db.commit()
        db.refresh(crisis)
        return crisis.id
    except Exception as e:
        db.rollback()
        print(f"DB save error: {e}")
        return None
    finally:
        db.close()

def get_past_events(limit: int = 10) -> list:
    import json
    db = SessionLocal()
    try:
        events = db.query(CrisisEvent)\
            .order_by(CrisisEvent.created_at.desc())\
            .limit(limit).all()
        result = []
        for e in events:
            result.append({
                "id": e.id,
                "event": e.event,
                "region": e.region,
                "event_type": e.event_type,
                "risk_level": e.risk_level,
                "executive_summary": e.executive_summary,
                "top_impacts": json.loads(e.top_impacts) if e.top_impacts else [],
                "actions": json.loads(e.actions) if e.actions else [],
                "outlook": e.outlook,
                "created_at": e.created_at.isoformat()
            })
        return result
    finally:
        db.close()

def get_similar_past_events(event: str, limit: int = 3) -> list:
    """Find past events with similar keywords for agent memory"""
    import json
    db = SessionLocal()
    try:
        keywords = event.lower().split()[:3]
        events = db.query(CrisisEvent)\
            .order_by(CrisisEvent.created_at.desc())\
            .limit(50).all()
        
        scored: list[tuple[int, CrisisEvent]] = []
        for e in events:
            score = sum(1 for kw in keywords if kw in e.event.lower())
            if score > 0:
                scored.append((score, e))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        result = []
        for _, e in scored[:limit]:  # type: ignore[index]
            result.append({
                "event": e.event,
                "risk_level": e.risk_level,
                "executive_summary": e.executive_summary,
                "created_at": e.created_at.isoformat()
            })
        return result
    finally:
        db.close()

def create_alert(name: str, ticker: str, threshold: float, condition: str, region: str, currency: str):
    db = SessionLocal()
    try:
        alert = PriceAlert(
            name=name,
            ticker=ticker,
            threshold=threshold,
            condition=condition,
            region=region,
            currency=currency
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert.id
    except Exception as e:
        db.rollback()
        print(f"Alert save error: {e}")
        return None
    finally:
        db.close()
def get_alerts() -> list:
    db = SessionLocal()
    try:
        alerts = db.query(PriceAlert).order_by(PriceAlert.created_at.desc()).all()
        return [{
            "id": a.id,
            "name": a.name,
            "ticker": a.ticker,
            "threshold": a.threshold,
            "condition": a.condition,
            "region": a.region,
            "currency": a.currency,
            "triggered": a.triggered,
            "created_at": a.created_at.isoformat(),
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None
        } for a in alerts]
    finally:
        db.close()

def trigger_alert(alert_id: int):
    db = SessionLocal()
    try:
        alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
        if alert:
            alert.triggered = 1
            alert.triggered_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()

def delete_alert(alert_id: int):
    db = SessionLocal()
    try:
        alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
        if alert:
            db.delete(alert)
            db.commit()
    finally:
        db.close()

def reset_alert(alert_id: int):
    db = SessionLocal()
    try:
        alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
        if alert:
            alert.triggered = 0
            alert.triggered_at = None
            db.commit()
    finally:
        db.close()

def save_market_snapshots(event_id: int, snapshots: list):
    """Save market price snapshots at prediction time. snapshots = [{ticker, name, price}, ...]"""
    db = SessionLocal()
    try:
        for s in snapshots:
            snap = MarketSnapshot(
                event_id=event_id,
                ticker=s["ticker"],
                ticker_name=s["name"],
                price_at_prediction=s["price"]
            )
            db.add(snap)
        db.commit()
        print(f"Snapshots saved for event {event_id}: {len(snapshots)} tickers")
    except Exception as e:
        db.rollback()
        print(f"Snapshot save error: {e}")
    finally:
        db.close()

def get_trackable_predictions(min_days: int = 0) -> list:
    """Get past predictions that have market snapshots, ordered by most recent."""
    import json
    db = SessionLocal()
    try:
        events = db.query(CrisisEvent).order_by(CrisisEvent.created_at.desc()).limit(50).all()
        result = []
        for e in events:
            snapshots = db.query(MarketSnapshot).filter(MarketSnapshot.event_id == e.id).all()
            if not snapshots:
                continue
            days_elapsed = (datetime.utcnow() - e.created_at).days
            result.append({
                "id": e.id,
                "event": e.event,
                "region": e.region,
                "event_type": e.event_type,
                "risk_level": e.risk_level,
                "executive_summary": e.executive_summary,
                "top_impacts": json.loads(e.top_impacts) if e.top_impacts else [],
                "outlook": e.outlook,
                "created_at": e.created_at.isoformat(),
                "days_elapsed": days_elapsed,
                "is_mature": days_elapsed >= 30,
                "snapshots": [{
                    "ticker": s.ticker,
                    "name": s.ticker_name,
                    "price_at_prediction": s.price_at_prediction
                } for s in snapshots]
            })
        return result
    finally:
        db.close()