# 🌍 AI Crisis Decision System

The **AI Crisis Decision System** is a full-stack, predictive multi-agent application built to forecast geopolitical, economic, supply chain, and humanitarian crises in real-time. By orchestrating a specialized crew of AI models using live internet validation, statistical fallback modeling, and authoritative data sources, the system generates actionable intelligence for decision-makers.

---

## ⚡ Core Features

1. **⛓️ Chain Reaction Simulator**
   - Automatically models Nth-order consequences of macroscopic events (e.g., "Taiwan Semiconductor Factory halted").
   - Traces primary disruptions to secondary and tertiary economic impacts globally.

2. **📊 AI vs Reality Performance Tracker**
   - Prevents AI hallucinations by routinely tracking former predictions against actual market outcomes 30 days later, providing a live "Accuracy Track Record" UI dashboard.

3. **🚢 Supply Chain Outage Predictor**
   - Ingests specific choke-point disruptions (e.g., "Strait of Hormuz blocked") and calculates real-world delays, alternate routing fees, and specific commodity price spikes using a dedicated "External Source Auditor" agent.

4. **⛺ Humanitarian Resource & Refugee Allocator**
   - Highly robust geographic migration forecaster for conflict zones and natural disasters.
   - **Fact-Checked Demographics**: Scrapes verified UN sources (UNHCR, WHO, IOM, ReliefWeb) and News articles to predict accurate population displacement volumes.
   - **Logistics Modeling**: Computes exact 48-hour physical requirements (medical kits, tents, water liters) and host-country financial strain, gracefully falling back to historical *SPHERE Humanitarian Standards* if live internet queries fail.
     
  
<details>
<summary>📋 View all 12 modules</summary>

🔍 Analyze — Ingests raw crisis data and performs initial macroeconomic and geopolitical impact extraction
🧪 Simulate — Multi-agent event simulator that models deep hypothetical "what-if" disruption scenarios
📈 Live Prices — Real-time integration with Yahoo Finance to fetch live commodity and index fluctuations triggered by crises
📰 News Feed — Real-time global event ingestion via NewsAPI to automatically track breaking events
🚢 Supply Chain Outage Predictor — Calculates real-world shipping delays, alternate routing fees, and commodity price spikes for choke-point disruptions
🕐 History — Local comprehensive database of previous crises and their validated resolutions
🌍 Country Impact — Deep dive into national GDP damage using live population and trade data from the World Bank API
🔔 Alerts — Automated threshold monitors that notify personnel when regional threats cross predefined risk levels
📊 AI vs Reality Tracker — Tracks former predictions against actual market outcomes 30 days later with a live accuracy dashboard
⛓️ Chain Reaction Simulator — Models 1st, 2nd, and 3rd order economic impacts globally from factory halts or border tensions
🏆 Compare Countries — Measures macroeconomic resiliency of nations against identical crisis parameters side-by-side
⛺ Humanitarian Resource & Refugee Allocator — Geographic migration forecaster with UN-verified demographics (UNHCR, WHO, IOM, ReliefWeb) and SPHERE Standards fallback for 48-hour logistics modeling

</details>

---

## 🛠 Tech Stack

### Backend
- **Python / FastAPI**: High-performance REST API routing.
- **CrewAI & LangChain**: Multi-Agent orchestration framework allowing AI modules (Forecasters, Logistics Planners, Auditors) to recursively challenge one another.
- **SQLite / SQLAlchemy**: Local database modeling for persisting the AI's historic predictions to be evaluated by the Reality Tracker module.
- **Groq / Llama-3-70b**: Ultra-fast LLM inferencing engine handling simultaneous multi-agent taskings.

### Frontend
- **Next.js / React**: Interactive, component-driven client.
- **Tailwind CSS**: Rapid, dynamic styling featuring glass-morphism, dark-mode styling, and real-time loading UI state visualizers.

---

## 🔗 APIs & Tools Used

- **NewsAPI**: Pulls legitimate journalism articles regarding real-time crises to fact-check AI assumptions natively.
- **DuckDuckGo Search (`ddgs`)**: Allows the AI Agents to autonomously browse the internet for missing knowledge and current commodity pricing.
- **World Bank API (`world_data_tool`)**: Provides exact GDP, structural demographics, and global dependencies for assessing collateral damage to national economies.
- **Yahoo Finance (`yfinance`)**: Extracts stock market ticker prices in real-time to monitor predicted versus real market disruption.

---

## 🏗 Real World Applications & Use Cases

- **Government & Defense Operations**: Scenario planning for active conflict zones (e.g., forecasting massive refugee influxes at neighboring borders within 48-hours to pre-position resources).
- **Supply Chain Logistics Companies**: Preemptively altering global sea routes to avoid calculated geopolitical blockades before freight competitors.
- **Financial Institutions**: Stress-testing portfolios by simulating immediate 2nd and 3rd order impacts from a spontaneous foreign market collapse. 
- **NGOs (Non-Governmental Organizations)**: Using the Refugee Allocator's UN-Certified search functionality to swiftly dispatch exact figures of emergency supplies (water bladders, tents, med kits) to earthquake epicenters.
---

🚀 How to Run
```
bash# Backend
pip install fastapi uvicorn crewai langchain sqlalchemy yfinance
uvicorn app:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```
Set your API keys in .env:
```
GROQ_API_KEY=your_key
NEWS_API_KEY=your_key
```
----
