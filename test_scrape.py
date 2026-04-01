"""
Quick test script to verify Firecrawl scraping works
"""
import os
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
import json

load_dotenv()

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
START_URL = "https://www.scotiaitrade.com/en/home.html"
MAX_PAGES = 5  # Small test

print("Testing Firecrawl scraping...")
print(f"API Key: {FIRECRAWL_API_KEY[:10]}...")
print(f"Target: {START_URL}")
print(f"Max pages: {MAX_PAGES}\n")

app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)

print("Starting crawl...")
crawl_result = app.crawl_url(
    START_URL,
    params={
        "limit": MAX_PAGES,
        "scrapeOptions": {"formats": ["markdown"]},
    },
    poll_interval=5,
)

pages = crawl_result.data if hasattr(crawl_result, "data") else []
print(f"\n✓ Crawled {len(pages)} pages successfully!\n")

# Save to file
output = []
for i, page in enumerate(pages):
    url = getattr(page, "url", "")
    markdown = getattr(page, "markdown", "") or getattr(page, "content", "")
    output.append({"url": url, "content": markdown[:500]})
    print(f"  [{i+1}] {url} ({len(markdown)} chars)")

with open("scraped_test.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\n✓ Saved to scraped_test.json")
print("Firecrawl is working correctly!")
