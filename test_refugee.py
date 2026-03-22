import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import refugee_allocation, RefugeeInput

async def test_ref():
    try:
        res = await refugee_allocation(RefugeeInput(event="7.8 Earthquake", epicenter="Gaziantep, Turkey"))
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ref())
