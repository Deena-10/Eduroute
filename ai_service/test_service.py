import requests
import json

url = "http://localhost:5001/generate_career_roadmap_direct"
payload = {
    "domain": "Full Stack",
    "proficiency_level": "Beginner",
    "professional_goal": "job-ready",
    "current_status": "College student"
}


try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print(f"Error JSON:: {response.text}")
    else:
        print("Success")
except Exception as e:
    print(f"Script Error: {e}")

