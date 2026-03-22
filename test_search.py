from search_tool import get_search_results

print("Testing concise UN search...")
query = "Khartoum Sudan refugees statistics UN"
print(get_search_results(query, max_results=5))
