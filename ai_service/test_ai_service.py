#!/usr/bin/env python3
"""
Test script to verify Flask AI service endpoints
"""
import requests
import json

BASE_URL = "http://localhost:5001"

def test_health_endpoint():
    """Test the root health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health Check ({response.status_code}):")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return False

def test_ask_ai_endpoint():
    """Test the ask_ai endpoint"""
    try:
        payload = {
            "question": "Hello, can you help me with Python programming?",
            "engine": "gemini",
            "uid": "test-user"
        }
        response = requests.post(f"{BASE_URL}/ask_ai", json=payload)
        print(f"✅ Ask AI Test ({response.status_code}):")
        if response.status_code == 200:
            print(f"Response: {response.json().get('answer', 'No answer')[:200]}...")
        else:
            print(f"Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Ask AI Test Failed: {e}")
        return False

def main():
    print("🔍 Testing Flask AI Service at http://localhost:5001")
    print("=" * 50)
    
    health_ok = test_health_endpoint()
    print()
    ask_ai_ok = test_ask_ai_endpoint()
    
    print("\n" + "=" * 50)
    if health_ok and ask_ai_ok:
        print("🎉 All tests passed! AI service is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\nTroubleshooting:")
        print("1. Make sure the Flask service is running: python application.py")
        print("2. Check if port 5001 is available")
        print("3. Verify environment variables are set (.env file)")

if __name__ == "__main__":
    main()
