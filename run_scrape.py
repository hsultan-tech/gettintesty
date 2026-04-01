#!/usr/bin/env python3
"""
Simple script to run the scraper directly
"""
from scraper import run_scrape

print("Starting Scotia iTrade scraper...")
print("=" * 60)

for message in run_scrape():
    print(message, end='', flush=True)

print("=" * 60)
print("Scraping complete!")
