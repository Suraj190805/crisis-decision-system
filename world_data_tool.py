"""
World Bank API data tool — fetches macroeconomic indicators for regions.
Free API, no key required.
"""
import requests

# World Bank country codes for supported regions
REGION_CODES = {
    "india": "IND",
    "usa": "USA",
    "china": "CHN",
    "europe": "EUU",   # European Union aggregate
    "germany": "DEU",
    "japan": "JPN",
    "middle east": "MEA",  # Middle East & North Africa aggregate
    "saudi arabia": "SAU",
    "brazil": "BRA",
    "uk": "GBR",
    "global": "WLD",    # World aggregate
    "russia": "RUS",
    "ukraine": "UKR",
    "taiwan": "TWN",
}

# Key indicators and their World Bank codes
INDICATORS = {
    "NY.GDP.MKTP.KD.ZG": "GDP Growth (%)",
    "FP.CPI.TOTL.ZG": "Inflation Rate (%)",
    "NE.TRD.GNFS.ZS": "Trade (% of GDP)",
    "EG.IMP.CONS.ZS": "Energy Imports (% of use)",
    "BN.CAB.XOKA.CD": "Current Account Balance (USD)",
    "FI.RES.TOTL.CD": "Total Reserves (USD)",
    "SL.UEM.TOTL.ZS": "Unemployment Rate (%)",
    "GC.DOD.TOTL.GD.ZS": "Government Debt (% of GDP)",
}


def _fetch_indicator(country_code: str, indicator: str) -> dict | None:
    """Fetch a single indicator from World Bank API v2."""
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/{indicator}"
    params = {
        "format": "json",
        "per_page": 5,
        "mrv": 3,  # most recent 3 values
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if len(data) < 2 or not data[1]:
            return None
        # Find the most recent non-null value
        for entry in data[1]:
            if entry.get("value") is not None:
                return {
                    "value": round(entry["value"], 2),
                    "year": entry["date"],
                }
        return None
    except Exception:
        return None


def get_world_bank_data(region: str) -> str:
    """
    Fetch key economic indicators for a region from World Bank.
    Returns a formatted text summary for AI agents to use.
    """
    region_lower = region.lower().strip()

    # Match region to country code
    country_code = None
    for key, code in REGION_CODES.items():
        if key in region_lower:
            country_code = code
            break
    if not country_code:
        country_code = "WLD"  # fallback to world

    results = []
    for indicator_code, label in INDICATORS.items():
        data = _fetch_indicator(country_code, indicator_code)
        if data:
            results.append(f"  - {label}: {data['value']} ({data['year']})")

    if not results:
        return f"World Bank data for {region}: unavailable"

    header = f"WORLD BANK ECONOMIC INDICATORS for {region.upper()} ({country_code}):\n"
    return header + "\n".join(results)


def get_multi_region_data(regions: list[str]) -> str:
    """Fetch World Bank data for multiple regions at once."""
    all_data = []
    for region in regions:
        data = get_world_bank_data(region)
        all_data.append(data)
    return "\n\n".join(all_data)
