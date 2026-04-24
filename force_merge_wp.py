import urllib.request
import json
import os

RA_API_KEY = "63b54dadada313e6d586c8dae6e4f0baa50844c8375ab8bdcc7aa78d8f2dbebb4c09cc245dd479372c2ef4e734d0a2ea"
BASE_URL = "https://resolutionassurance.com.au/wp-json/ra/v2"

def force_merge():
    endpoint = f"{BASE_URL}/admin/import-graph-bridge"
    req = urllib.request.Request(endpoint, data=b'{}', method='POST')
    req.add_header("Content-Type", "application/json")
    req.add_header("X-API-Key", RA_API_KEY)
    req.add_header("Authorization", f"Bearer {RA_API_KEY}")
    req.add_header("User-Agent", "ResolutionAssurance-Validator/1.0")
    
    print(f"Calling force merge at {endpoint}...")
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            res_data = response.read().decode('utf-8')
            print(f"Response: {res_data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_merge()
