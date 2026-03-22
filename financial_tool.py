import yfinance as yf

def get_usd_to_inr() -> float:
    try:
        t = yf.Ticker("USDINR=X")
        hist = t.history(period="1d")
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
        return 83.5  # fallback rate
    except:
        return 83.5  # fallback rate

REGION_TICKERS = {
    "middle east": ["CL=F", "BZ=F", "^GSPC"],
    "india": ["^BSESN", "INRUSD=X", "CL=F"],
    "china": ["000001.SS", "CNYUSD=X", "CL=F"],
    "europe": ["^STOXX50E", "EURUSD=X", "TTF=F"],
    "usa": ["^GSPC", "^DJI", "CL=F"],
    "ukraine": ["EURUSD=X", "WEAT", "CL=F"],
    "taiwan": ["^TWII", "TWDUSD=X", "CL=F"],
    "global": ["CL=F", "^GSPC", "GC=F"],
}

COMMODITY_TICKERS = {
    "oil": "CL=F",
    "gas": "NG=F",
    "wheat": "ZW=F",
    "gold": "GC=F",
    "semiconductor": "SOXX",
    "copper": "HG=F",
}

# Comprehensive price map — region → commodity → ticker
PRICE_MAP = {
   "india": {
    "Crude Oil (per barrel)":  "CL=F",
    "Gold (per gram)":         "GC=F",
    "Silver (per gram)":       "SI=F",
    "BSE Sensex":              "^BSESN",
    "Nifty 50":                "^NSEI",
    "USD/INR":                 "USDINR=X",
    "Natural Gas (per MMBtu)": "NG=F",
    "Wheat (per bushel)":      "ZW=F",
    "Reliance Industries":     "RELIANCE.NS",
    "TCS":                     "TCS.NS",
},
"global": {
    "Crude Oil (per barrel)":  "CL=F",
    "Brent Oil (per barrel)":  "BZ=F",
    "Natural Gas (per MMBtu)": "NG=F",
    "Gold (per troy oz)":      "GC=F",
    "Silver (per troy oz)":    "SI=F",
    "Copper (per lb)":         "HG=F",
    "Wheat (per bushel)":      "ZW=F",
    "Corn (per bushel)":       "ZC=F",
    "S&P 500":                 "^GSPC",
    "Dow Jones":               "^DJI",
    "NASDAQ":                  "^IXIC",
    "Bitcoin (per coin)":      "BTC-USD",
    "Ethereum (per coin)":     "ETH-USD",
},
"usa": {
    "Crude Oil (per barrel)":  "CL=F",
    "Gasoline (per gallon)":   "RB=F",
    "Natural Gas (per MMBtu)": "NG=F",
    "Gold (per troy oz)":      "GC=F",
    "Silver (per troy oz)":    "SI=F",
    "S&P 500":                 "^GSPC",
    "Dow Jones":               "^DJI",
    "NASDAQ":                  "^IXIC",
    "Apple":                   "AAPL",
    "Tesla":                   "TSLA",
},
"europe": {
    "Brent Oil (per barrel)":  "BZ=F",
    "Natural Gas (per MMBtu)": "NG=F",
    "Gold (per troy oz)":      "GC=F",
    "Euro Stoxx 50":           "^STOXX50E",
    "EUR/USD":                 "EURUSD=X",
    "GBP/USD":                 "GBPUSD=X",
    "FTSE 100":                "^FTSE",
    "DAX":                     "^GDAXI",
    "Wheat (per bushel)":      "ZW=F",
    "Copper (per lb)":         "HG=F",
},
"china": {
    "Crude Oil (per barrel)":  "CL=F",
    "Gold (per troy oz)":      "GC=F",
    "Shanghai Index":          "000001.SS",
    "CNY/USD":                 "CNYUSD=X",
    "Copper (per lb)":         "HG=F",
    "Natural Gas (per MMBtu)": "NG=F",
    "Wheat (per bushel)":      "ZW=F",
    "Alibaba":                 "BABA",
    "Baidu":                   "BIDU",
    "Silver (per troy oz)":    "SI=F",
},
"middle east": {
    "Crude Oil (per barrel)":  "CL=F",
    "Brent Oil (per barrel)":  "BZ=F",
    "Natural Gas (per MMBtu)": "NG=F",
    "Gold (per troy oz)":      "GC=F",
    "Silver (per troy oz)":    "SI=F",
    "USD/SAR":                 "USDRSAR=X",
    "Copper (per lb)":         "HG=F",
    "Wheat (per bushel)":      "ZW=F",
    "Saudi Aramco":            "2222.SR",
    "S&P 500":                 "^GSPC",
},
"japan": {
    "Crude Oil (per barrel)":  "CL=F",
    "Gold (per troy oz)":      "GC=F",
    "Nikkei 225":              "^N225",
    "USD/JPY":                 "USDJPY=X",
    "Natural Gas (per MMBtu)": "NG=F",
    "Sony":                    "SONY",
    "Toyota":                  "TM",
    "Silver (per troy oz)":    "SI=F",
    "Copper (per lb)":         "HG=F",
    "Wheat (per bushel)":      "ZW=F",
},
}

def get_oil_price() -> str:
    return get_ticker_price("CL=F", "Crude Oil")

def get_market_data(ticker: str) -> str:
    return get_ticker_price(ticker, ticker)

def get_ticker_price(ticker: str, label: str) -> str:
    try:
        t = yf.Ticker(ticker)
        price = t.fast_info['last_price']
        return f"{label}: ${price:.2f}"
    except:
        return f"{label}: data unavailable"

def get_region_market_data(region: str) -> str:
    region_lower = region.lower()
    matched = "global"
    for key in REGION_TICKERS:
        if key in region_lower:
            matched = key
            break
    tickers = REGION_TICKERS[matched]
    results = []
    for ticker in tickers:
        result = get_ticker_price(ticker, ticker)
        results.append(result)
    return f"Live market data for {region}:\n" + "\n".join(results)

def get_scenario_market_data(scenario: str) -> str:
    scenario_lower = scenario.lower()
    results = []
    for keyword, ticker in COMMODITY_TICKERS.items():
        if keyword in scenario_lower:
            result = get_ticker_price(ticker, keyword.upper())
            results.append(result)
    results.append(get_ticker_price("CL=F", "Crude Oil"))
    results.append(get_ticker_price("^GSPC", "S&P 500"))
    results.append(get_ticker_price("GC=F", "Gold"))
    return "Relevant live market data:\n" + "\n".join(results)

# Tickers that need gram conversion (gold, silver)
GRAM_CONVERT = {"GC=F", "SI=F"}
TROY_OZ_TO_GRAM = 31.1035

def get_prices_for_region(region: str) -> list:
    region_lower = region.lower()
    matched = "global"
    for key in PRICE_MAP:
        if key in region_lower:
            matched = key
            break

    commodities = PRICE_MAP[matched]
    results = []

    # Fetch live USD to INR rate once
    usd_to_inr = get_usd_to_inr()
    is_india = "india" in region_lower

    for name, ticker in commodities.items():
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="2d")
            if hist.empty or len(hist) < 1:
                raise ValueError("No data")

            price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) >= 2 else price
            change = price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close else 0

            # Convert gold/silver from troy oz to grams
            if ticker in GRAM_CONVERT:
                price = price / TROY_OZ_TO_GRAM
                change = change / TROY_OZ_TO_GRAM
                name = name.replace("per troy oz", "per gram")
                if is_india:
                   price = price * 0.96
                   change = change * 0.96

            # Determine currency and convert USD → INR for India region
            if ".NS" in ticker or ".BO" in ticker or "^BSESN" in ticker or "^NSEI" in ticker:
                currency = "INR"
            elif ticker.endswith("=X") and "INR" in ticker:
                currency = "INR per USD"
            elif ".SR" in ticker:
                currency = "SAR"
            elif "000001.SS" in ticker:
                currency = "CNY"
            elif "^N225" in ticker:
                currency = "JPY"
            elif "^STOXX" in ticker or "^GDAXI" in ticker:
                currency = "EUR"
            elif "^FTSE" in ticker:
                currency = "GBP"
            else:
                # USD commodity/stock — convert to INR if India region
                if is_india:
                    price = price * usd_to_inr
                    change = change * usd_to_inr
                    currency = "INR"
                else:
                    currency = "USD"

            results.append({
                "name": name,
                "ticker": ticker,
                "price": round(float(price), 2),
                "change": round(float(change), 4),
                "change_pct": round(float(change_pct), 2),
                "currency": currency
            })
        except:
            results.append({
                "name": name,
                "ticker": ticker,
                "price": None,
                "change": None,
                "change_pct": None,
                "currency": "N/A"
            })

    return results


def get_extended_market_context(region: str) -> str:
    """
    Get 30-day price trends and volatility for key tickers.
    Returns rich trend context (not just snapshots) for AI agents.
    """
    region_lower = region.lower()
    matched = "global"
    for key in REGION_TICKERS:
        if key in region_lower:
            matched = key
            break

    # Use broader set of tickers for trend analysis
    core_tickers = [
        ("CL=F", "Crude Oil"),
        ("GC=F", "Gold"),
        ("^GSPC", "S&P 500"),
        ("^DJI", "Dow Jones"),
        ("BTC-USD", "Bitcoin"),
        ("NG=F", "Natural Gas"),
        ("ZW=F", "Wheat"),
        ("HG=F", "Copper"),
    ]

    # Add region-specific tickers
    region_extra = {
        "india": [("^BSESN", "BSE Sensex"), ("USDINR=X", "USD/INR")],
        "china": [("000001.SS", "Shanghai Index"), ("CNYUSD=X", "CNY/USD")],
        "europe": [("^STOXX50E", "Euro Stoxx 50"), ("EURUSD=X", "EUR/USD")],
        "japan": [("^N225", "Nikkei 225"), ("USDJPY=X", "USD/JPY")],
        "usa": [("^IXIC", "NASDAQ"), ("AAPL", "Apple")],
        "middle east": [("BZ=F", "Brent Oil"), ("2222.SR", "Saudi Aramco")],
    }
    tickers = core_tickers + region_extra.get(matched, [])

    results = []
    for ticker, name in tickers:
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="1mo")
            if hist.empty or len(hist) < 2:
                continue

            current = float(hist['Close'].iloc[-1])
            week_ago = float(hist['Close'].iloc[-5]) if len(hist) >= 5 else float(hist['Close'].iloc[0])
            month_ago = float(hist['Close'].iloc[0])

            change_7d = ((current - week_ago) / week_ago) * 100
            change_30d = ((current - month_ago) / month_ago) * 100

            # Calculate volatility (std dev of daily returns)
            daily_returns = hist['Close'].pct_change().dropna()
            volatility = float(daily_returns.std() * 100)

            high_30d = float(hist['High'].max())
            low_30d = float(hist['Low'].min())

            trend = "📈 RISING" if change_30d > 2 else "📉 FALLING" if change_30d < -2 else "➡️ STABLE"

            results.append(
                f"  {name} ({ticker}): ${current:.2f} | "
                f"7d: {change_7d:+.1f}% | 30d: {change_30d:+.1f}% | "
                f"Trend: {trend} | Volatility: {volatility:.2f}% | "
                f"30d Range: ${low_30d:.2f}-${high_30d:.2f}"
            )
        except Exception:
            pass

    if not results:
        return f"Extended market trends for {region}: unavailable"

    header = f"30-DAY MARKET TRENDS for {region.upper()}:\n"
    return header + "\n".join(results)