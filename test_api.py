import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import supply_chain, SupplyChainInput

async def test_sc():
    try:
        res = await supply_chain(SupplyChainInput(disruption="Suez Canal Blocked", region="global"))
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_sc())
