import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, LLM, Process
from dotenv import load_dotenv
from news_tool import get_news, get_targeted_news
from financial_tool import get_oil_price, get_market_data, get_region_market_data, get_scenario_market_data, get_prices_for_region
from world_data_tool import get_world_bank_data
from database import save_event, get_past_events, get_similar_past_events, init_db, create_alert, get_alerts, trigger_alert, delete_alert, reset_alert, save_market_snapshots, get_trackable_predictions
from pdf_generator import generate_crisis_report_pdf
from fastapi.responses import Response
from email_alert import send_alert_email
# Initialize DB on startup
init_db()
load_dotenv()

app = FastAPI(title="Crisis Decision System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

class EventInput(BaseModel):
    event: str

class ScenarioInput(BaseModel):
    scenario: str
    delta: str
    region: str = "global"

def build_crew(event: str, region: str = "global"):
    news_queries = [
        event,
        f"{event} economic impact",
        f"{event} {region}" if region != "global" else event,
    ]
    real_news = get_targeted_news(news_queries)
    region_markets = get_region_market_data(region)
    scenario_markets = get_scenario_market_data(event)

    economic_agent = Agent(
        role="Economic Impact Analyst",
        goal=f"Predict economic consequences specifically for {region} using real market data",
        backstory=f"Expert macroeconomist specializing in {region} economics.",
        llm=llm
    )
    trade_agent = Agent(
        role="Trade & Supply Chain Analyst",
        goal=f"Identify specific import/export disruptions affecting {region}",
        backstory=f"Former WTO trade advisor with deep knowledge of {region} supply chains.",
        llm=llm
    )
    energy_agent = Agent(
        role="Energy Markets Analyst",
        goal=f"Assess energy supply disruptions specific to {region}",
        backstory=f"Ex-OPEC analyst specializing in energy markets affecting {region}.",
        llm=llm
    )
    social_agent = Agent(
        role="Social Impact Analyst",
        goal=f"Predict humanitarian consequences specific to {region}",
        backstory=f"UN crisis response veteran specialized in {region} social dynamics.",
        llm=llm
    )
    decision_agent = Agent(
        role="Crisis Decision Coordinator",
        goal=f"Produce a specific data-backed decision report for {region}",
        backstory="Senior policy advisor producing precise region-specific actionable crisis reports.",
        llm=llm
    )

    economic_task = Task(
        description=f"""
            Analyze the SPECIFIC economic impact of: {event}
            Target region: {region}
            LIVE MARKET DATA: {region_markets}
            COMMODITY DATA: {scenario_markets}
            REAL NEWS: {real_news}
            Be SPECIFIC to {region}. Reference actual numbers.
            Return JSON with: inflation_risk (string), currency_impact (string), gdp_impact (string), affected_sectors (list of strings).
        """,
        agent=economic_agent,
        expected_output="JSON with inflation_risk, currency_impact, gdp_impact, affected_sectors as simple strings and list of strings"
    )
    trade_task = Task(
        description=f"""
            Analyze SPECIFIC trade disruptions from: {event}
            Target region: {region}
            REAL NEWS: {real_news}
            LIVE MARKET DATA: {region_markets}
            Return JSON with: affected_trade_routes (list of strings), disrupted_imports (list of strings), estimated_delay (string), most_vulnerable_countries (list of strings).
        """,
        agent=trade_agent,
        expected_output="JSON with all values as simple strings or lists of strings"
    )
    energy_task = Task(
        description=f"""
            Analyze SPECIFIC energy impact of: {event}
            Target region: {region}
            LIVE ENERGY PRICES: {scenario_markets}
            REAL NEWS: {real_news}
            Return JSON with: oil_price_change (string), gas_supply_risk (string), affected_pipelines (list of strings), energy_alternatives (list of strings).
        """,
        agent=energy_agent,
        expected_output="JSON with all values as simple strings or lists of strings"
    )
    social_task = Task(
        description=f"""
            Analyze SPECIFIC social impact of: {event}
            Target region: {region}
            REAL NEWS: {real_news}
            Return JSON with: displacement_estimate (string), unrest_risk (string), humanitarian_needs (list of strings), affected_population (string).
        """,
        agent=social_agent,
        expected_output="JSON with all values as simple strings or lists of strings"
    )
    decision_task = Task(
        description=f"""
            Produce a SPECIFIC final crisis report for:
            Event: {event}, Region: {region}
            LIVE DATA: {region_markets} | {scenario_markets}
            Use the 4 specialist analyses above. Reference specific numbers.
            Return JSON with:
            - overall_risk_level (integer 1-10)
            - executive_summary (string, 2-3 sentences)
            - top_5_predicted_impacts (list of 5 strings)
            - immediate_actions (list of 5 strings)
            - 30_day_outlook (string)
            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=decision_agent,
        expected_output="JSON with overall_risk_level as integer, all other values as strings or lists of strings only",
        context=[economic_task, trade_task, energy_task, social_task]
    )

    return Crew(
        agents=[economic_agent, trade_agent, energy_agent, social_agent, decision_agent],
        tasks=[economic_task, trade_task, energy_task, social_task, decision_task],
        process=Process.sequential
    )

@app.get("/")
def root():
    return {"status": "Crisis Decision System is running"}

@app.post("/analyze")
async def analyze_event(input: EventInput):
    # Fetch similar past events for agent memory
    past = get_similar_past_events(input.event)
    past_context = ""
    if past:
        past_context = "\n\nHISTORICAL MEMORY FROM PAST ANALYSES:\n"
        for p in past:
            past_context += f"- [{p['created_at'][:10]}] {p['event']} → Risk Level {p['risk_level']}: {p['executive_summary']}\n"

    crew = build_crew(input.event + past_context, region="global")
    result = crew.kickoff()

    # Parse and save to DB
    event_id = None
    try:
        clean = str(result).replace("```json", "").replace("```", "").strip()
        import json
        parsed = json.loads(clean)
        event_id = save_event(input.event, "global", "analyze", parsed)
    except:
        pass

    # Save market snapshots for AI vs Reality tracking
    if event_id:
        try:
            snapshots = capture_market_snapshots("global")
            save_market_snapshots(event_id, snapshots)
        except Exception as e:
            print(f"Snapshot capture error: {e}")

    return {
        "event": input.event,
        "report": str(result),
        "past_events_used": len(past)
    }

@app.post("/simulate")
async def simulate_scenario(input: ScenarioInput):
    event = f"{input.scenario} by {input.delta}"

    past = get_similar_past_events(event)
    past_context = ""
    if past:
        past_context = "\n\nHISTORICAL MEMORY FROM PAST ANALYSES:\n"
        for p in past:
            past_context += f"- [{p['created_at'][:10]}] {p['event']} → Risk Level {p['risk_level']}: {p['executive_summary']}\n"

    region_markets = get_region_market_data(input.region)
    scenario_markets = get_scenario_market_data(input.scenario)
    crew = build_crew(event + past_context, region=input.region)
    result = crew.kickoff()

    event_id = None
    try:
        clean = str(result).replace("```json", "").replace("```", "").strip()
        import json
        parsed = json.loads(clean)
        event_id = save_event(event, input.region, "simulate", parsed)
    except:
        pass

    # Save market snapshots for AI vs Reality tracking
    if event_id:
        try:
            snapshots = capture_market_snapshots(input.region)
            save_market_snapshots(event_id, snapshots)
        except Exception as e:
            print(f"Snapshot capture error: {e}")

    return {
        "scenario": input.scenario,
        "delta": input.delta,
        "region": input.region,
        "live_market_data": {
            "region": region_markets,
            "scenario": scenario_markets,
        },
        "simulation_report": str(result),
        "past_events_used": len(past)
    }

class PricesInput(BaseModel):
    region: str = "global"

@app.post("/prices")
async def get_live_prices(input: PricesInput):
    prices = get_prices_for_region(input.region)
    return {
        "region": input.region,
        "prices": prices
    }

@app.get("/history")
async def get_history():
    events = get_past_events(limit=20)
    return {"events": events}

# ─── HELPER: Capture market snapshots ─────────────────────────────
SNAPSHOT_TICKERS = [
    ("CL=F", "Crude Oil"),
    ("GC=F", "Gold"),
    ("^GSPC", "S&P 500"),
    ("^DJI", "Dow Jones"),
    ("BTC-USD", "Bitcoin"),
    ("USDINR=X", "USD/INR"),
]

def capture_market_snapshots(region: str) -> list:
    """Capture current prices of core tickers for tracking predictions vs reality."""
    import yfinance as yf
    snapshots = []
    for ticker, name in SNAPSHOT_TICKERS:
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="5d")
            if not hist.empty:
                price = float(hist['Close'].iloc[-1])
                snapshots.append({"ticker": ticker, "name": name, "price": round(price, 2)})
        except:
            pass
    return snapshots

# ─── AI vs REALITY TRACKER ────────────────────────────────────────
@app.get("/tracker")
async def get_tracker():
    """Compare AI predictions vs actual market movements."""
    import yfinance as yf
    from datetime import datetime, timedelta

    predictions = get_trackable_predictions()
    results = []

    for pred in predictions:
        prediction_date = datetime.fromisoformat(pred["created_at"])
        target_date = prediction_date + timedelta(days=30)

        comparison = []
        correct_directions = 0
        total_compared = 0

        for snap in pred["snapshots"]:
            ticker_data = {
                "ticker": snap["ticker"],
                "name": snap["name"],
                "price_at_prediction": snap["price_at_prediction"],
                "price_after_30d": None,
                "change_pct": None,
                "direction": None,
            }

            if pred["is_mature"]:
                try:
                    t = yf.Ticker(snap["ticker"])
                    # Get price around 30 days after prediction
                    start = (target_date - timedelta(days=3)).strftime("%Y-%m-%d")
                    end = (target_date + timedelta(days=3)).strftime("%Y-%m-%d")
                    hist = t.history(start=start, end=end)
                    if not hist.empty:
                        actual_price = float(hist['Close'].iloc[-1])
                        change_pct = ((actual_price - snap["price_at_prediction"]) / snap["price_at_prediction"]) * 100
                        direction = "up" if change_pct > 0 else "down" if change_pct < 0 else "flat"
                        ticker_data["price_after_30d"] = round(actual_price, 2)
                        ticker_data["change_pct"] = round(change_pct, 2)
                        ticker_data["direction"] = direction

                        # Simple accuracy check: high risk predictions should correlate with market drops
                        total_compared += 1
                        if pred["risk_level"] and pred["risk_level"] >= 7 and direction == "down":
                            correct_directions += 1
                        elif pred["risk_level"] and pred["risk_level"] < 5 and direction == "up":
                            correct_directions += 1
                        elif pred["risk_level"] and 5 <= pred["risk_level"] < 7:
                            correct_directions += 1  # Moderate risk = any direction is "right"
                except Exception as e:
                    print(f"Tracker fetch error for {snap['ticker']}: {e}")

            comparison.append(ticker_data)

        accuracy = round((correct_directions / total_compared) * 100) if total_compared > 0 else None

        results.append({
            "id": pred["id"],
            "event": pred["event"],
            "region": pred["region"],
            "event_type": pred["event_type"],
            "risk_level": pred["risk_level"],
            "executive_summary": pred["executive_summary"],
            "outlook": pred["outlook"],
            "created_at": pred["created_at"],
            "days_elapsed": pred["days_elapsed"],
            "is_mature": pred["is_mature"],
            "days_remaining": max(0, 30 - pred["days_elapsed"]),
            "market_comparison": comparison,
            "accuracy_score": accuracy,
        })

    return {"predictions": results}

class PDFInput(BaseModel):
    event: str
    region: str = "global"
    report: dict

@app.post("/generate-pdf")
async def generate_pdf(input: PDFInput):
    pdf_bytes = generate_crisis_report_pdf(input.event, input.region, input.report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=crisis-report-{input.event[:30]}.pdf"}
    )

class NewsFeedInput(BaseModel):
    query: str
    pageSize: int = 10

@app.post("/news")
async def get_news_feed(input: NewsFeedInput):
    from news_tool import _fetch_news
    articles_raw = _fetch_news(input.query, pageSize=input.pageSize)
    
    # Also fetch raw articles with full details
    import requests
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": input.query,
        "sortBy": "publishedAt",
        "pageSize": input.pageSize,
        "language": "en",
        "apiKey": os.getenv("NEWS_API_KEY")
    }
    response = requests.get(url, params=params)
    articles = response.json().get("articles", [])
    
    return {
        "query": input.query,
        "articles": [
            {
                "title": a.get("title"),
                "description": a.get("description"),
                "url": a.get("url"),
                "source": a.get("source", {}).get("name"),
                "publishedAt": a.get("publishedAt", "")[:10],
                "urlToImage": a.get("urlToImage"),
            }
            for a in articles if a.get("title")
        ]
    }

class CountryImpactInput(BaseModel):
    event: str
    country: str

@app.post("/country-impact")
async def country_impact(input: CountryImpactInput):
    real_news = get_targeted_news([
        input.event,
        f"{input.event} {input.country}",
        f"{input.country} economy {input.event}",
    ])
    region_markets = get_region_market_data(input.country)
    scenario_markets = get_scenario_market_data(input.event)

    country_agent = Agent(
        role=f"{input.country} Impact Specialist",
        goal=f"Analyze exactly how {input.country} is specifically affected by this event",
        backstory=f"Expert analyst specializing in {input.country}'s economy, trade, politics, and social dynamics.",
        llm=llm
    )

    task = Task(
        description=f"""
            Analyze SPECIFICALLY how {input.country} is affected by: {input.event}

            LIVE MARKET DATA FOR {input.country.upper()}:
            {region_markets}

            RELEVANT COMMODITY DATA:
            {scenario_markets}

            REAL NEWS:
            {real_news}

            Be extremely specific to {input.country}. Include:
            - {input.country}'s direct trade relationships affected
            - Impact on {input.country}'s currency and stock market
            - Which industries in {input.country} are most affected
            - What {input.country}'s government should do
            - How ordinary citizens of {input.country} will be affected

            Return JSON with:
            - risk_level (1-10)
            - executive_summary (3 sentences specific to {input.country})
            - economic_impact (string, specific numbers)
            - trade_impact (string)
            - currency_impact (string)
            - most_affected_industries (list of 4)
            - citizen_impact (string, how everyday people are affected)
            - government_actions (list of 4 specific to {input.country})
            - opportunity (string, any silver lining for {input.country})
        """,
        agent=country_agent,
        expected_output="JSON with all fields specific to the country"
    )

    crew = Crew(agents=[country_agent], tasks=[task], process=Process.sequential)
    result = crew.kickoff()

    try:
        clean = str(result).replace("```json", "").replace("```", "").strip()
        import json
        parsed = json.loads(clean)
        save_event(f"{input.event} - {input.country} impact", input.country, "analyze", {
            "overall_risk_level": parsed.get("risk_level", 5),
            "executive_summary": parsed.get("executive_summary", ""),
            "top_5_predicted_impacts": parsed.get("most_affected_industries", []),
            "immediate_actions": parsed.get("government_actions", []),
            "30_day_outlook": parsed.get("citizen_impact", "")
        })
        return {"event": input.event, "country": input.country, "report": parsed}
    except:
        return {"event": input.event, "country": input.country, "report": str(result)}
    
# ─── PRICE ALERTS ─────────────────────────────────────────────────

class AlertInput(BaseModel):
    name: str
    ticker: str
    threshold: float
    condition: str  # "above" or "below"
    region: str = "global"
    currency: str = "USD"

@app.post("/alerts")
async def create_price_alert(input: AlertInput):
    alert_id = create_alert(
        input.name, input.ticker, input.threshold,
        input.condition, input.region, input.currency
    )
    return {"success": True, "alert_id": alert_id}

@app.get("/alerts")
async def list_alerts():
    alerts = get_alerts()
    return {"alerts": alerts}

@app.delete("/alerts/{alert_id}")
async def remove_alert(alert_id: int):
    delete_alert(alert_id)
    return {"success": True}

@app.put("/alerts/{alert_id}/reset")
async def reset_price_alert(alert_id: int):
    reset_alert(alert_id)
    return {"success": True}

@app.get("/alerts/check")
async def check_alerts():
    import yfinance as yf
    from financial_tool import get_usd_to_inr

    alerts = get_alerts()
    triggered = []
    usd_to_inr = get_usd_to_inr()

    for alert in alerts:
        if alert["triggered"] == 1:
            continue
        try:
            t = yf.Ticker(alert["ticker"])
            hist = t.history(period="5d")
            if hist.empty or len(hist) == 0:
                print(f"No data for {alert['ticker']}, skipping")
                continue
            price = float(hist['Close'].iloc[-1])

            if alert["currency"] == "INR" and not any(x in alert["ticker"] for x in [".NS", ".BO", "^BSESN", "^NSEI"]):
                if alert["ticker"] in ["GC=F", "SI=F"]:
                    # Gold/Silver futures: convert from per troy oz to per gram in INR
                    # Add ~13% India premium (import duty + GST)
                    price = (price / 31.1035) * usd_to_inr * 1.13
                    # Apply 22K purity factor if alert name contains "22k" or "22K"
                    if "22k" in alert["name"].lower() or "22K" in alert["name"]:
                        price = price * (22 / 24)
                else:
                    price = price * usd_to_inr

            condition_met = (
                (alert["condition"] == "above" and price >= alert["threshold"]) or
                (alert["condition"] == "below" and price <= alert["threshold"])
            )

            if condition_met:
                trigger_alert(alert["id"])
                send_alert_email(
                    alert["name"],
                    alert["condition"],
                    alert["threshold"],
                    round(price, 2),
                    alert["currency"]
                )
                triggered.append({
                    "id": alert["id"],
                    "name": alert["name"],
                    "condition": alert["condition"],
                    "threshold": alert["threshold"],
                    "current_price": round(price, 2),
                    "currency": alert["currency"]
                })
        except Exception as e:
            print(f"Alert check error for {alert['ticker']}: {e}")

    return {"triggered": triggered, "checked": len(alerts)}

# ─── CRISIS CHAIN REACTION (Enhanced Multi-Agent) ─────────────────

class ChainReactionInput(BaseModel):
    event: str
    region: str = "global"

@app.post("/chain-reaction")
async def chain_reaction(input: ChainReactionInput):
    """Predict cascading second & third-order effects using 3-agent crew with rich data."""
    from financial_tool import get_extended_market_context

    # ── Gather rich data from multiple sources ──
    real_news = get_targeted_news([
        input.event,
        f"{input.event} consequences",
        f"{input.event} economic impact",
        f"{input.event} {input.region} ripple effects",
        f"{input.event} historical precedent",
    ])
    region_markets = get_region_market_data(input.region)
    scenario_markets = get_scenario_market_data(input.event)
    market_trends = get_extended_market_context(input.region)
    world_bank = get_world_bank_data(input.region)

    # Past analyses from DB for consistency
    past = get_similar_past_events(input.event)
    past_context = ""
    if past:
        past_context = "\nPAST ANALYSES FROM DATABASE:\n"
        for p in past:
            past_context += f"- [{p['created_at'][:10]}] {p['event']} → Risk Level {p['risk_level']}: {p['executive_summary']}\n"

    # ── Combined data block for all agents ──
    data_block = f"""
        === REAL-TIME DATA PACKAGE ===

        LIVE NEWS:
        {real_news}

        LIVE MARKET SNAPSHOTS:
        {region_markets}
        {scenario_markets}

        30-DAY MARKET TRENDS & VOLATILITY:
        {market_trends}

        MACROECONOMIC INDICATORS (World Bank):
        {world_bank}

        {past_context}
    """

    # ── Agent 1: Historical Precedent Researcher ──
    research_agent = Agent(
        role="Historical Crisis Researcher",
        goal=f"Find real historical events that closely parallel '{input.event}' and document what actually happened in each case",
        backstory="PhD historian specializing in crisis economics. You have deep knowledge of events like the 1973 Oil Embargo, 2008 Financial Crisis, 1997 Asian Crisis, COVID-19, Gulf Wars, Fukushima disaster, Suez Canal blockage, and hundreds more. You always cite REAL events with REAL dates and outcomes.",
        llm=llm
    )

    research_task = Task(
        description=f"""
            Research REAL historical events that parallel: {input.event}
            Target region: {input.region}

            {data_block}

            Find 4-6 REAL historical precedents that are similar to this event.
            For EACH precedent, document:
            1. What the event was and when it happened (exact year)
            2. What the cascading consequences were (the domino chain that actually happened)
            3. How severe it was and how long the effects lasted
            4. Key statistics (e.g., "oil rose 300%", "GDP fell 4.2%")

            Return a JSON object with:
            - "precedents" (array of 4-6 objects, each with):
                - "event" (string, name and year, e.g. "1973 OPEC Oil Embargo")
                - "similarity" (string, why it's similar to the current event)
                - "what_happened" (string, 2-3 sentences on the actual cascading consequences)
                - "key_stats" (list of 2-3 strings with real numbers)
                - "duration" (string, how long effects lasted)

            CRITICAL: Only cite REAL events that actually happened. Do NOT fabricate historical events.
            ALL values must be simple strings or lists of strings. No nested objects.
        """,
        agent=research_agent,
        expected_output="JSON with precedents array containing real historical events"
    )

    # ── Agent 2: Cascade Modeler ──
    model_agent = Agent(
        role="Crisis Cascade Modeler",
        goal=f"Build a precise 6-link domino chain for '{input.event}' grounded in historical precedents and live data",
        backstory="Former IMF chief economist who builds crisis cascade models. You combine historical patterns with current market data to predict domino effects. You assign confidence levels based on how well-supported each prediction is by historical evidence and current data trends.",
        llm=llm
    )

    model_task = Task(
        description=f"""
            Build a PRECISE 6-link cascading chain reaction for: {input.event}
            Target region: {input.region}

            You have been given historical precedent research from a colleague (see context).
            Use it to ground each chain link in REAL historical patterns.

            ALSO USE THIS LIVE DATA:
            {data_block}

            RULES FOR HIGH ACCURACY:
            1. Each chain link must be LOGICALLY connected — one causes the next
            2. Use the historical precedents to calibrate severity and timeframes
            3. Use the 30-day market trends to calibrate current market sensitivity
            4. Use World Bank indicators to understand the economic baseline
            5. Assign confidence levels honestly — if data is weak, confidence should be lower
            6. Cite the most relevant historical precedent for each link

            Return a JSON object with:
            - "chain" (array of exactly 6 objects, each with):
                - "order" (integer 1, 2, or 3 — 1=direct, 2=secondary, 3=tertiary)
                - "title" (short label, 3-5 words max)
                - "description" (2-3 sentences explaining WHY this happens, referencing data)
                - "severity" (one of: "critical", "high", "moderate", "low")
                - "timeframe" (e.g. "Immediate", "1-2 weeks", "1-3 months", "3-6 months")
                - "affected_sectors" (list of 2-3 industry/sector strings)
                - "confidence" (integer 1-100, how confident based on evidence)
                - "historical_precedent" (string, cite a REAL event, e.g. "Similar to 1973 Oil Embargo when oil rose 300%")
            - "overall_cascade_risk" (integer 1-10, calibrated against historical parallels)
            - "cascade_summary" (2-3 sentences summarizing the full domino effect with data)
            - "potential_circuit_breakers" (list of 3 strings — actions that could STOP the chain)

            IMPORTANT:
            - Links 1-2: order=1 (direct consequences, within days to weeks)
            - Links 3-4: order=2 (secondary consequences, weeks to months)
            - Links 5-6: order=3 (tertiary consequences, months to quarters)
            - Confidence should reflect: data support, historical precedent strength, market trend alignment
            - ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=model_agent,
        expected_output="JSON with chain (6 links with confidence and historical_precedent), overall_cascade_risk, cascade_summary, potential_circuit_breakers",
        context=[research_task]
    )

    # ── Agent 3: Accuracy Validator ──
    validator_agent = Agent(
        role="Crisis Prediction Validator",
        goal="Cross-check every chain link against data and historical evidence, flag weaknesses, and produce the final validated chain",
        backstory="Risk assessment auditor at a major sovereign wealth fund. You challenge every assumption, verify claims against data, and only approve predictions that have solid evidence. You adjust confidence scores based on data alignment.",
        llm=llm
    )

    validator_task = Task(
        description=f"""
            You are the final quality gate. Review the cascade chain model from your colleague (see context).

            VALIDATE each of the 6 chain links against this data:
            {data_block}

            FOR EACH LINK, check:
            1. Does the description logically follow from the previous link?
            2. Is the severity calibrated correctly against historical parallels?
            3. Is the timeframe realistic based on how fast similar events unfolded historically?
            4. Is the confidence score honest? Reduce it if evidence is weak, increase if strong.
            5. Is the historical precedent citation accurate and relevant?

            PRODUCE THE FINAL VALIDATED CHAIN. You may adjust:
            - severity (up or down)
            - confidence scores (be stricter — most links should be 40-80, not 90+)
            - descriptions (add more specific data references)
            - circuit breakers (make more specific and actionable)

            Return the FINAL JSON object with this exact structure:
            - "chain" (array of exactly 6 objects, each with):
                - "order" (integer 1, 2, or 3)
                - "title" (string, 3-5 words max)
                - "description" (string, 2-3 sentences with data references)
                - "severity" (one of: "critical", "high", "moderate", "low")
                - "timeframe" (string)
                - "affected_sectors" (list of 2-3 strings)
                - "confidence" (integer 1-100, calibrated honestly)
                - "historical_precedent" (string, verified real event citation)
            - "overall_cascade_risk" (integer 1-10)
            - "cascade_summary" (string, 2-3 sentences with specific numbers)
            - "potential_circuit_breakers" (list of 3 specific actionable strings)
            - "data_quality_note" (string, 1 sentence on how well-supported this analysis is)

            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=validator_agent,
        expected_output="Final validated JSON with chain, overall_cascade_risk, cascade_summary, potential_circuit_breakers, data_quality_note",
        context=[research_task, model_task]
    )

    # ── Run the 3-agent crew ──
    crew = Crew(
        agents=[research_agent, model_agent, validator_agent],
        tasks=[research_task, model_task, validator_task],
        process=Process.sequential
    )
    result = crew.kickoff()

    # Parse and save
    parsed = None
    try:
        import json
        clean = str(result).replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
        save_event(f"Chain Reaction: {input.event}", input.region, "chain", {
            "overall_risk_level": parsed.get("overall_cascade_risk", 5),
            "executive_summary": parsed.get("cascade_summary", ""),
            "top_5_predicted_impacts": [link.get("title", "") for link in parsed.get("chain", [])],
            "immediate_actions": parsed.get("potential_circuit_breakers", []),
            "30_day_outlook": " → ".join([link.get("title", "") for link in parsed.get("chain", [])])
        })
    except Exception as e:
        print(f"Chain reaction parse error: {e}")

    return {
        "event": input.event,
        "region": input.region,
        "chain_reaction": parsed if parsed else str(result),
        "raw": str(result)
    }

# ─── SUPPLY CHAIN AUTO-REROUTING ──────────────────────────────────

class SupplyChainInput(BaseModel):
    disruption: str
    region: str = "global"

class RefugeeInput(BaseModel):
    event: str
    epicenter: str

@app.post("/supply-chain")
async def supply_chain(input: SupplyChainInput):
    from financial_tool import get_oil_price, get_extended_market_context
    from search_tool import get_search_results

    # Fetch extreme accuracy live web data
    live_web_data = get_search_results(f"{input.disruption} supply chain impact routes update", max_results=5)

    real_news = get_targeted_news([
        input.disruption,
        f"{input.disruption} supply chain",
        f"{input.disruption} shipping",
        f"{input.disruption} logistics delay",
    ])
    oil_price = get_oil_price()
    market_trends = get_extended_market_context(input.region)

    logistics_agent = Agent(
        role="Global Logistics & Routing Specialist",
        goal="Identify alternative freight routes and estimate transit delays caused by the disruption",
        backstory="Veteran maritime and air freight coordinator. You know global shipping lanes, choke points, and port capacities intimately.",
        llm=llm
    )

    cost_agent = Agent(
        role="Freight Cost Analyzer",
        goal="Calculate the financial impact of rerouting, considering live oil prices and longer transit times",
        backstory="Senior supply chain financial analyst. You calculate how extra nautical miles and current bunker fuel prices translate to increased container costs.",
        llm=llm
    )

    impact_agent = Agent(
        role="Inventory & Industry Impact Predictor",
        goal="Predict which downstream industries will face critical material shortages first",
        backstory="Supply chain risk manager who understands the cascading effects of delayed components on manufacturing and retail.",
        llm=llm
    )

    auditor_agent = Agent(
        role="External Source Auditor",
        goal="Fact-check every metric and route proposed by the crew against live internet searches and historical precedents. Reject hallucinations.",
        backstory="Fierce truth and realism validator. You distrust AI hallucinations. You use live internet searches to verify shipping constraints, economic indicators, and historical disruption data. You demand URLs as citations.",
        llm=llm
    )

    logistics_task = Task(
        description=f"""
            Analyze the following supply chain disruption: {input.disruption}
            Region: {input.region}
            LIVE NEWS: {real_news}

            1. Identify the primary shipping/freight routes affected.
            2. Determine possible rerouting strategies. IMPORTANT: Recognize geographic realities. For example, if the Strait of Hormuz is blocked, the Suez Canal and Bab-el-Mandeb are ALSO blocked for those shipments. The only real workarounds for Gulf oil are pipelines or extremely long sea routes (like the Cape of Good Hope).
            3. Estimate the transit delay. IMPORTANT: Do not use fixed numbers if uncertain. If it's an immediate supply shock (like Hormuz), state "Immediate supply shock" or "Delays vary widely depending on rerouting and supply adjustments".

            Return JSON with: primary_affected_route (string), alternative_routes (list of strings), estimated_delay (string).
        """,
        agent=logistics_agent,
        expected_output="JSON with primary_affected_route, alternative_routes, estimated_delay"
    )

    cost_task = Task(
        description=f"""
            Calculate the freight cost increase for rerouting around: {input.disruption}
            Use the alternative routes and delays from the logistics analysis.
            LIVE OIL PRICE: {oil_price}
            MARKET TRENDS: {market_trends}

            Estimate how the live fuel price and longer routes will impact shipping costs.
            IMPORTANT: Do not make up overly specific fixed numbers like "$2500 per TEU". Instead, provide a range or reasoning, for example: "Freight costs may increase significantly due to fuel price spikes and longer routes."
            
            Return JSON with: cost_increase_estimate (string), reasoning (string).
        """,
        agent=cost_agent,
        expected_output="JSON with cost_increase_estimate and reasoning",
        context=[logistics_task]
    )

    impact_task = Task(
        description=f"""
            Predict the downstream impact of the delay and cost increase from: {input.disruption}
            Using the logistics and cost analyses:
            
            1. Identify the top 4 industries/sectors that will face critical shortages first.
            2. Write a 3-sentence executive summary of the total supply chain impact.
            IMPORTANT: Do not ignore the energy crisis. If the disruption involves major oil routes (like Hormuz), explicitly mention the global oil supply disruption, oil price spikes, inflation, and global market shock.

            Return JSON with: 
            - risk_level (integer 1-10)
            - executive_summary (string)
            - primary_affected_route (string, from logistics)
            - alternative_routes (list of 3 strings, from logistics)
            - estimated_delay (string, from logistics)
            - cost_increase_estimate (string, from cost)
            - most_affected_industries (list of 4 strings)
            - immediate_mitigation_actions (list of 3 strings)
            
            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=impact_agent,
        expected_output="JSON matching the 8 requested fields",
        context=[logistics_task, cost_task]
    )

    auditor_task = Task(
        description=f"""
            Review the complete supply chain analysis from the Impact Predictor.
            Use the following LIVE INTERNET SEARCH DATABASE to verify the geographic reality of the alternative routes and the realism of the economic impact estimates.
            
            --- LIVE INTERNET SEARCH DATABASE ---
            {live_web_data}
            -------------------------------------
            
            If the agent claims are unrealistic or hallucinated according to these live internet facts, fix them.
            Assign a confidence_score (1-100) based on how well the data holds up to your internet fact-checking.
            List the top 3 specific URLs or publication names you used for verification from the database above.

            Return the FINAL JSON with these exact fields:
            - risk_level (integer 1-10)
            - executive_summary (string)
            - primary_affected_route (string)
            - alternative_routes (list of 3 strings)
            - estimated_delay (string)
            - cost_increase_estimate (string)
            - most_affected_industries (list of 4 strings)
            - immediate_mitigation_actions (list of 3 strings)
            - confidence_score (integer 0-100)
            - sources_cited (list of strings)

            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=auditor_agent,
        expected_output="Final validated JSON with confidence_score and sources_cited",
        context=[impact_task]
    )

    crew = Crew(
        agents=[logistics_agent, cost_agent, impact_agent, auditor_agent],
        tasks=[logistics_task, cost_task, impact_task, auditor_task],
        process=Process.sequential
    )
    result = crew.kickoff()

    parsed = None
    try:
        import json
        import re
        
        # Extract everything between the first { and the last }
        match = re.search(r"\{.*\}", str(result), re.DOTALL)
        if match:
            clean = match.group(0)
            parsed = json.loads(clean)
        else:
            # Fallback
            clean = str(result).replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean)

        save_event(f"Supply Chain: {input.disruption}", input.region, "supply_chain", {
            "overall_risk_level": parsed.get("risk_level", 5),
            "executive_summary": parsed.get("executive_summary", ""),
            "top_5_predicted_impacts": parsed.get("most_affected_industries", []),
            "immediate_actions": parsed.get("immediate_mitigation_actions", []),
            "30_day_outlook": f"Delay: {parsed.get('estimated_delay', 'Unknown')} | Cost offset: {parsed.get('cost_increase_estimate', 'Unknown')}"
        })
    except Exception as e:
        print(f"Supply chain parse error: {e}")

    return {
        "disruption": input.disruption,
        "region": input.region,
        "report": parsed if parsed else str(result),
        "raw": str(result)
    }

@app.post("/refugee-allocation")
async def refugee_allocation(input: RefugeeInput):
    from search_tool import get_search_results

    from news_tool import get_news

    # Fetch extreme accuracy live web data and verified news articles
    news_data = get_news(f"{input.epicenter} {input.event} crisis refugees")
    live_web_data = get_search_results(f"{input.event} {input.epicenter} refugees latest numbers", max_results=3)

    migration_agent = Agent(
        role="Migration Forecaster",
        goal="Predict the likeliest border crossings and volume of displaced people",
        backstory="Expert humanitarian geographer. You analyze epicenters and predict where displaced populations will flee based on borders and safety.",
        llm=llm
    )

    supply_agent = Agent(
        role="Supply Logistics Planner",
        goal="Calculate exact 48-hour emergency supply needs at the predicted borders",
        backstory="Veteran disaster relief coordinator. You know exactly how many medical kits, tents, and water bladders are needed per 10,000 displaced people.",
        llm=llm
    )

    finance_agent = Agent(
        role="Financial Aid Estimator",
        goal="Estimate the immediate financial aid required for host countries",
        backstory="UN financial analyst. You calculate the hosting cost strain on neighboring nations.",
        llm=llm
    )

    auditor_agent = Agent(
        role="UN-Certified Fact-Checker",
        goal="Strictly fact-check all estimated refugee populations and supply needs against the live UN database. Reject hallucinations.",
        backstory="Fierce humanitarian data validator. You distrust AI hallucinations. You use the provided live UN database to verify population displacements, supply constraints, and financial requests. You demand URLs as citations.",
        llm=llm
    )

    migration_task = Task(
        description=f"""
            Analyze the following crisis event: {input.event}
            Epicenter: {input.epicenter}

            Use the following LIVE INTERNET SEARCH DATABASE to ground your predictions in reality:
            --- LIVE INTERNET SEARCH DATABASE ---
            {live_web_data}
            -------------------------------------

            1. Estimate the total volume of displaced people.
            2. Identify the top 3 neighboring borders or safe zones they will likely flee to.

            Return JSON with: displaced_volume_estimate (string), top_3_migration_routes (list of strings).
        """,
        agent=migration_agent,
        expected_output="JSON with displaced_volume_estimate and top_3_migration_routes"
    )

    supply_task = Task(
        description=f"""
            Plan the 48-hour emergency logistics for the displaced people heading to the borders identified by the Migration Forecaster.

            1. Calculate the essential medical, sheltering, and food supplies needed.
            2. Identify the top 4 critical supply items needed IMMEDIATELY (within 48 hours).

            Return JSON with: medical_kits_needed (string), tents_needed (string), daily_water_liters (string), critical_48h_supplies (list of 4 strings).
        """,
        agent=supply_agent,
        expected_output="JSON with medical_kits_needed, tents_needed, daily_water_liters, critical_48h_supplies",
        context=[migration_task]
    )

    finance_task = Task(
        description=f"""
            Estimate the financial strain on the host countries receiving the refugees.
            Using the volume from the Migration Forecaster and supplies from the Supply Planner:

            1. Estimate the total immediate financial aid required (in USD).
            
            Return JSON with: estimated_financial_aid_usd (string).
        """,
        agent=finance_agent,
        expected_output="JSON with estimated_financial_aid_usd",
        context=[migration_task, supply_task]
    )

    auditor_task = Task(
        description=f"""
            Review the complete humanitarian analysis from the Forecaster, Planner, and Estimator.
            Use the following LIVE INTERNET SEARCH DATABASE and verified NEWS ARTICLES to verify the reality of the crisis and the realism of the estimates.
            
            --- LIVE NEWS & SEARCH DATABASE ---
            NEWS ARTICLES:
            {news_data}
            
            SEARCH RESULTS:
            {live_web_data}
            -------------------------------------
            
            If the agent claims are unrealistic or hallucinated according to these live facts, fix them. 
            Assign a confidence_score (1-100) based on how well the data holds up to your real-world fact-checking. 
            
            CRITICAL INSTRUCTION: If the live databases return 'No recent news found', YOU MUST NOT RETURN 'Unknown'. Instead, you must fall back on established historical demographic modeling, geographic constraints, and SPHERE humanitarian standard ratios to validate the numbers. In this case, assign a confidence_score around 60-75.
            
            List the top 3 specific URLs, news outlets, or specify 'Historical Demographic Modeling' / 'SPHERE Humanitarian Standards' if live data was unavailable.

            Return the FINAL JSON with these exact fields:
            - risk_level (integer 1-10)
            - executive_summary (string)
            - displaced_volume_estimate (string)
            - top_3_migration_routes (list of 3 strings)
            - medical_kits_needed (string)
            - tents_needed (string)
            - daily_water_liters (string)
            - critical_48h_supplies (list of 4 strings)
            - estimated_financial_aid_usd (string)
            - confidence_score (integer 0-100)
            - sources_cited (list of strings)
            
            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=auditor_agent,
        expected_output="Final validated JSON with confidence_score and sources_cited",
        context=[finance_task]
    )

    crew = Crew(
        agents=[migration_agent, supply_agent, finance_agent, auditor_agent],
        tasks=[migration_task, supply_task, finance_task, auditor_task],
        process=Process.sequential
    )
    result = crew.kickoff()

    parsed = None
    try:
        import json
        import re
        match = re.search(r"\{.*\}", str(result), re.DOTALL)
        if match:
            clean = match.group(0)
            parsed = json.loads(clean)
        else:
            clean = str(result).replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean)

        save_event(f"Refugee Crisis: {input.event}", input.epicenter, "refugee_allocation", {
            "overall_risk_level": parsed.get("risk_level", 9),
            "executive_summary": parsed.get("executive_summary", ""),
            "top_5_predicted_impacts": parsed.get("top_3_migration_routes", []),
            "immediate_actions": parsed.get("critical_48h_supplies", []),
            "30_day_outlook": f"Volume: {parsed.get('displaced_volume_estimate', 'Unknown')} | Aid: {parsed.get('estimated_financial_aid_usd', 'Unknown')}"
        })
    except Exception as e:
        print(f"Refugee allocation parse error: {e}")

    return {
        "event": input.event,
        "epicenter": input.epicenter,
        "report": parsed if parsed else str(result),
        "raw": str(result)
    }

# ─── MULTI-COUNTRY COMPARISON ─────────────────────────────────────

class CompareCountriesInput(BaseModel):
    event: str
    countries: list[str]  # 3-5 countries

COUNTRY_FLAGS = {
    "india": "🇮🇳", "usa": "🇺🇸", "china": "🇨🇳", "japan": "🇯🇵",
    "germany": "🇩🇪", "uk": "🇬🇧", "france": "🇫🇷", "brazil": "🇧🇷",
    "russia": "🇷🇺", "saudi arabia": "🇸🇦", "australia": "🇦🇺",
    "south korea": "🇰🇷", "canada": "🇨🇦", "italy": "🇮🇹",
    "mexico": "🇲🇽", "indonesia": "🇮🇩", "turkey": "🇹🇷",
    "taiwan": "🇹🇼", "nigeria": "🇳🇬", "south africa": "🇿🇦",
    "egypt": "🇪🇬", "pakistan": "🇵🇰", "bangladesh": "🇧🇩",
    "vietnam": "🇻🇳", "thailand": "🇹🇭", "uae": "🇦🇪",
    "iran": "🇮🇷", "ukraine": "🇺🇦", "poland": "🇵🇱",
    "spain": "🇪🇸", "netherlands": "🇳🇱", "singapore": "🇸🇬",
}

@app.post("/compare-countries")
async def compare_countries(input: CompareCountriesInput):
    """Analyze the same event across multiple countries — 3-agent crew with rich data."""
    from financial_tool import get_extended_market_context
    import json

    if len(input.countries) < 2 or len(input.countries) > 6:
        return {"error": "Please provide 2-6 countries to compare."}

    # ── Gather RICH data per country ──
    country_data = {}
    for country in input.countries:
        news = get_targeted_news([
            f"{input.event} {country}",
            f"{country} economy {input.event}",
            f"{country} trade impact {input.event}",
            f"{country} economic vulnerability",
        ])
        markets = get_region_market_data(country)
        market_trends = get_extended_market_context(country)
        world_bank = get_world_bank_data(country)
        country_data[country] = f"""
            LIVE NEWS for {country}:
            {news}

            MARKET SNAPSHOTS for {country}:
            {markets}

            30-DAY MARKET TRENDS for {country}:
            {market_trends}

            WORLD BANK ECONOMIC INDICATORS for {country}:
            {world_bank}
        """

    scenario_markets = get_scenario_market_data(input.event)
    countries_list = ", ".join(input.countries)

    # Past analyses from DB for consistency
    past = get_similar_past_events(input.event)
    past_context = ""
    if past:
        past_context = "\nPAST ANALYSES FROM DATABASE:\n"
        for p in past:
            past_context += f"- [{p['created_at'][:10]}] {p['event']} → Risk Level {p['risk_level']}: {p['executive_summary']}\n"

    all_country_data = "\n\n".join([f"{'='*60}\n=== {c.upper()} ===\n{'='*60}\n{d}" for c, d in country_data.items()])

    data_block = f"""
        === GLOBAL DATA ===
        COMMODITY DATA: {scenario_markets}
        {past_context}

        === PER-COUNTRY DATA ===
        {all_country_data}
    """

    # ── Agent 1: Historical Precedent Researcher ──
    research_agent = Agent(
        role="Historical Country Impact Researcher",
        goal=f"Find real historical events similar to '{input.event}' and document how they actually affected each country: {countries_list}",
        backstory="PhD economic historian specializing in comparative country analysis during crises. You know exactly how the 1973 Oil Crisis hit Japan differently from the USA, how the 2008 crash affected Iceland vs Germany, and how COVID impacted India vs China. You always cite REAL events with REAL data.",
        llm=llm
    )

    research_task = Task(
        description=f"""
            Research how REAL historical events similar to '{input.event}' affected each of these countries differently: {countries_list}

            {data_block}

            For EACH country, find 1-2 real historical parallels showing how that specific country was affected by a similar crisis.

            Return a JSON object with:
            - "country_precedents" (array, one per country, each with):
                - "country" (string)
                - "precedents" (array of 1-2 objects, each with):
                    - "event" (string, real event name and year)
                    - "impact_on_country" (string, 2-3 sentences on what actually happened to THIS country)
                    - "key_stats" (list of 2-3 strings with real numbers specific to this country)
                    - "recovery_time" (string)

            CRITICAL: Only cite REAL events. Use the data provided to ground your research.
            ALL values must be simple strings or lists of strings. No nested objects beyond what's specified.
        """,
        agent=research_agent,
        expected_output="JSON with country_precedents array containing per-country historical analysis"
    )

    # ── Agent 2: Multi-Country Analyst ──
    analyst_agent = Agent(
        role="Multi-Country Crisis Analyst",
        goal=f"Analyze how '{input.event}' affects each country differently: {countries_list}, grounded in historical evidence and live data",
        backstory="Senior economist at the IMF who specializes in comparative country analysis. You evaluate how the same crisis impacts different nations based on their economic structure, trade dependencies, energy mix, geopolitical position, and historical precedent. You assign confidence levels based on data quality.",
        llm=llm
    )

    analyst_task = Task(
        description=f"""
            Analyze how this crisis affects EACH country differently: {input.event}
            Countries to compare: {countries_list}

            You have historical precedent research from a colleague (see context).
            Use it to ground your analysis in REAL patterns.

            ALSO USE THIS LIVE DATA:
            {data_block}

            RULES FOR HIGH ACCURACY:
            1. Use World Bank indicators to understand each country's economic baseline
            2. Use 30-day market trends to see current market sensitivity
            3. Use historical precedents to calibrate severity and confidence
            4. Reference SPECIFIC numbers from the data (GDP rates, trade %, etc.)
            5. Assign confidence honestly based on data quality

            Return a JSON object with:
            - "countries" (array of objects, one per country, each with):
                - "country" (string, country name)
                - "risk_level" (integer 1-10, specific to this country)
                - "economic_impact" (string, 2-3 sentences with REAL numbers from data)
                - "trade_impact" (string, 1-2 sentences with data references)
                - "citizen_impact" (string, how everyday people are affected)
                - "most_affected_sectors" (list of 3-4 industry strings)
                - "vulnerability_reason" (string, 1-2 sentences referencing specific economic indicators)
                - "key_stat" (string, one headline number from the data, e.g. "Energy imports at 36% of use makes India highly exposed")
                - "confidence" (integer 1-100, based on data quality and historical evidence)
                - "historical_precedent" (string, cite the most relevant real event for this country)

            IMPORTANT:
            - Risk levels MUST vary — no two countries should have the same risk level
            - Reference REAL numbers from World Bank data provided
            - Confidence should reflect data coverage: more data = higher confidence
            - ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=analyst_agent,
        expected_output="JSON with countries array, each with risk_level, impact fields, confidence, and historical_precedent",
        context=[research_task]
    )

    # ── Agent 3: Validation Ranker ──
    validator_agent = Agent(
        role="Country Risk Validation Ranker",
        goal="Cross-check every country assessment against data, verify accuracy, adjust confidence, and produce the final ranked comparison",
        backstory="Chief risk officer at a global reinsurance firm and former World Bank auditor. You challenge every assumption, verify claims against the actual data provided, ensure risk levels are properly differentiated, and only approve assessments backed by real evidence.",
        llm=llm
    )

    validator_task = Task(
        description=f"""
            You are the FINAL QUALITY GATE. Review the country analysis from your colleagues (see context).
            Event: {input.event}
            Countries: {countries_list}

            VERIFY against this data:
            {data_block}

            FOR EACH COUNTRY, check:
            1. Does the economic_impact reference REAL numbers from the World Bank data?
            2. Is the risk_level properly calibrated against historical parallels?
            3. Is the confidence score honest? Lower it if data is sparse, raise if well-supported.
            4. Is the historical_precedent citation real and relevant to THIS specific country?
            5. Are risk levels properly SPREAD OUT? No two countries should have the same level.

            PRODUCE THE FINAL RANKED COMPARISON:
            1. SORT countries by risk_level descending (highest risk first)
            2. Ensure each country's assessment cites real data
            3. Write a data-grounded comparative summary

            Return the FINAL JSON object with:
            - "countries" (array SORTED by risk_level descending, each with):
                - "country" (string)
                - "rank" (integer, 1 = most affected)
                - "risk_level" (integer 1-10, verified and differentiated)
                - "economic_impact" (string, with specific data references)
                - "trade_impact" (string)
                - "citizen_impact" (string)
                - "most_affected_sectors" (list of 3-4 strings)
                - "vulnerability_reason" (string)
                - "key_stat" (string, verified against data)
                - "confidence" (integer 1-100, honestly calibrated)
                - "historical_precedent" (string, verified real event)
            - "comparative_summary" (string, 3-4 sentences with specific numbers)
            - "most_vulnerable" (string, country name)
            - "most_resilient" (string, country name)
            - "key_differentiator" (string, 1-2 sentences on the key factor)
            - "data_quality_note" (string, 1 sentence on overall data reliability)

            ALL values must be simple strings, integers, or lists of strings. No nested objects.
        """,
        agent=validator_agent,
        expected_output="Final validated JSON with ranked countries, comparative_summary, data_quality_note",
        context=[research_task, analyst_task]
    )

    # ── Run the 3-agent crew ──
    crew = Crew(
        agents=[research_agent, analyst_agent, validator_agent],
        tasks=[research_task, analyst_task, validator_task],
        process=Process.sequential
    )
    result = crew.kickoff()

    # Parse and save
    parsed = None
    try:
        clean = str(result).replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)

        # Add flag emojis
        if parsed and "countries" in parsed:
            for c in parsed["countries"]:
                c["flag"] = COUNTRY_FLAGS.get(c.get("country", "").lower(), "🌍")

        save_event(
            f"Compare: {input.event} ({countries_list})",
            countries_list, "compare", {
                "overall_risk_level": max((c.get("risk_level", 5) for c in parsed.get("countries", [])), default=5),
                "executive_summary": parsed.get("comparative_summary", ""),
                "top_5_predicted_impacts": [f"{c.get('country')}: Risk {c.get('risk_level')}" for c in parsed.get("countries", [])],
                "immediate_actions": [parsed.get("most_vulnerable", ""), parsed.get("most_resilient", ""), parsed.get("key_differentiator", "")],
                "30_day_outlook": parsed.get("comparative_summary", "")
            }
        )
    except Exception as e:
        print(f"Compare countries parse error: {e}")

    return {
        "event": input.event,
        "countries": input.countries,
        "comparison": parsed if parsed else str(result),
        "raw": str(result)
    }