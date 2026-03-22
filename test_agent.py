import os
from crewai import Agent, Task, Crew, LLM, Process
from dotenv import load_dotenv

load_dotenv()

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

# ─── AGENTS ───────────────────────────────────────────────────────

economic_agent = Agent(
    role="Economic Impact Analyst",
    goal="Predict economic consequences of crisis events",
    backstory="Expert macroeconomist who has analyzed 50+ global crises. Specializes in inflation, currency movements, and GDP impact.",
    llm=llm,
    verbose=True
)

trade_agent = Agent(
    role="Trade & Supply Chain Analyst",
    goal="Identify import/export disruptions and supply chain risks",
    backstory="Former WTO trade advisor with deep knowledge of global supply chains and trade route vulnerabilities.",
    llm=llm,
    verbose=True
)

energy_agent = Agent(
    role="Energy Markets Analyst",
    goal="Assess oil, gas, and energy supply disruptions",
    backstory="Ex-OPEC analyst specializing in energy price movements and geopolitical impacts on fuel supplies.",
    llm=llm,
    verbose=True
)

social_agent = Agent(
    role="Social Impact Analyst",
    goal="Predict social consequences like migration, unrest, and humanitarian impact",
    backstory="UN crisis response veteran who has assessed social impacts of 30+ major global events.",
    llm=llm,
    verbose=True
)

decision_agent = Agent(
    role="Crisis Decision Coordinator",
    goal="Synthesize all agent analyses into a final decision report with risk scores and action plan",
    backstory="Senior policy advisor who combines multi-domain intelligence into clear, actionable crisis reports for governments and organizations.",
    llm=llm,
    verbose=True
)

# ─── TASKS ────────────────────────────────────────────────────────

EVENT = "War breaks out between two major oil-producing nations in the Middle East"

economic_task = Task(
    description=f"""
        Analyze the economic impact of this event: {EVENT}
        Return JSON with:
        - inflation_risk (HIGH/MEDIUM/LOW)
        - currency_impact (string)
        - gdp_impact (string)
        - affected_sectors (list of 3)
    """,
    agent=economic_agent,
    expected_output="JSON with inflation_risk, currency_impact, gdp_impact, affected_sectors"
)

trade_task = Task(
    description=f"""
        Analyze trade and supply chain disruptions from: {EVENT}
        Return JSON with:
        - affected_trade_routes (list of 3)
        - disrupted_imports (list of 3)
        - estimated_delay (string)
        - most_vulnerable_countries (list of 3)
    """,
    agent=trade_agent,
    expected_output="JSON with affected_trade_routes, disrupted_imports, estimated_delay, most_vulnerable_countries"
)

energy_task = Task(
    description=f"""
        Analyze energy market impact of: {EVENT}
        Return JSON with:
        - oil_price_change (string, e.g. '+25-40%')
        - gas_supply_risk (HIGH/MEDIUM/LOW)
        - affected_pipelines (list)
        - energy_alternatives (list of 3)
    """,
    agent=energy_agent,
    expected_output="JSON with oil_price_change, gas_supply_risk, affected_pipelines, energy_alternatives"
)

social_task = Task(
    description=f"""
        Analyze the social and humanitarian impact of: {EVENT}
        Return JSON with:
        - displacement_estimate (string)
        - unrest_risk (HIGH/MEDIUM/LOW)
        - humanitarian_needs (list of 3)
        - affected_population (string)
    """,
    agent=social_agent,
    expected_output="JSON with displacement_estimate, unrest_risk, humanitarian_needs, affected_population"
)

decision_task = Task(
    description=f"""
        You are given analyses from 4 specialist agents on this crisis: {EVENT}

        Combine all previous analyses and produce a final decision report with:
        - overall_risk_level (1-10)
        - executive_summary (2-3 sentences)
        - top_5_predicted_impacts (list)
        - immediate_actions (list of 5, for governments/organizations)
        - 30_day_outlook (string)
    """,
    agent=decision_agent,
    expected_output="JSON with overall_risk_level, executive_summary, top_5_predicted_impacts, immediate_actions, 30_day_outlook",
    context=[economic_task, trade_task, energy_task, social_task]
)

# ─── CREW ─────────────────────────────────────────────────────────

crew = Crew(
    agents=[economic_agent, trade_agent, energy_agent, social_agent, decision_agent],
    tasks=[economic_task, trade_task, energy_task, social_task, decision_task],
    process=Process.sequential,
    verbose=True
)

print("\n" + "="*60)
print(f"ANALYZING EVENT: {EVENT}")
print("="*60 + "\n")

result = crew.kickoff()

print("\n" + "="*60)
print("FINAL DECISION REPORT")
print("="*60)
print(result)