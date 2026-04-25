import urllib.request
import json
import os

# Updated API Key from aapicred.txt
RA_API_KEY = "f3edb74ebae01e95760836b8b89a6f66080cab980b15c3030daf055399c44a9633127c2b5d8d1a07b5d43a65c0b1fd85"
BASE_URL = "https://resolutionassurance.com.au/wp-json/ra/v2"

def force_merge():
    # Use the import-graph-bridge endpoint which is responsible for promoting locked signals to the public graph
    endpoint = f"{BASE_URL}/admin/import-graph-bridge"
    req = urllib.request.Request(endpoint, data=b'{}', method='POST')
    req.add_header("Content-Type", "application/json")
    req.add_header("X-API-Key", RA_API_KEY)
    req.add_header("Authorization", f"Bearer {RA_API_KEY}")
    req.add_header("User-Agent", "ResolutionAssurance-Validator/7.0.8")
    
    print(f"Calling force merge at {endpoint}...")
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            res_data = response.read().decode('utf-8')
            print(f"Response: {res_data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_merge()
