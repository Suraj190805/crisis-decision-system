import pytest

def test_maritime_delay_and_distance_math():
    """Verify rerouting calculation around Cape of Good Hope vs Suez Canal."""
    suez_nautical_miles = 8500
    cape_nautical_miles = 11800
    extra_distance = cape_nautical_miles - suez_nautical_miles
    avg_speed_knots = 14.0

    extra_hours = extra_distance / avg_speed_knots
    extra_days = extra_hours / 24.0

    assert extra_distance == 3300
    assert 9.0 <= extra_days <= 11.0, f"Expected ~10 days delay, got {extra_days:.1f}"

def test_sphere_humanitarian_standards_math():
    """Verify UN SPHERE minimum water and resource standards for displacement."""
    displaced_population = 250000
    liters_per_person_per_day = 15.0  # SPHERE minimum
    daily_water_needed_liters = displaced_population * liters_per_person_per_day

    people_per_tent = 5.0
    tents_needed = displaced_population / people_per_tent

    assert daily_water_needed_liters == 3750000.0
    assert tents_needed == 50000.0

def test_financial_delta_math():
    """Verify percentage change calculation for asset pricing."""
    price_before = 82.50
    price_after = 91.48

    delta_pct = ((price_after - price_before) / price_before) * 100
    assert round(delta_pct, 2) == 10.88
