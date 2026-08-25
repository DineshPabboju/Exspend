import sys
import os
import time
from datetime import date
from fastapi.testclient import TestClient

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.main import app

client = TestClient(app)

def test_flow():
    print("1. Testing Register User...")
    email = f"test_{int(time.time())}_user@example.com"
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    if register_response.status_code != 201:
        print(f"FAILED to register: {register_response.status_code} - {register_response.text}")
    assert register_response.status_code == 201
    user_data = register_response.json()
    assert user_data["email"] == email
    assert user_data["monthly_budget"] == 1000.0
    print("[OK] Registration successful!")

    print("\n2. Testing Login Token Generation...")
    login_response = client.post(
        "/api/auth/token",
        data={
            "username": email,
            "password": "testpassword123"
        }
    )
    if login_response.status_code != 200:
        print(f"FAILED to login: {login_response.status_code} - {login_response.text}")
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Login token generated successfully!")

    print("\n3. Testing Get Current User...")
    me_response = client.get("/api/users/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
    print("[OK] Current user profile authenticated successfully!")

    print("\n4. Testing Update User Budget Limit...")
    budget_response = client.put(
        "/api/users/budget",
        headers=headers,
        json={"monthly_budget": 1500.0}
    )
    assert budget_response.status_code == 200
    assert budget_response.json()["monthly_budget"] == 1500.0
    print("[OK] Budget updating works!")

    print("\n5. Testing Create Expense...")
    expense_data = {
        "title": "Grocery Shopping",
        "amount": 120.50,
        "category": "Food",
        "date": str(date.today()),
        "description": "Weekly grocery run at supermarket"
    }
    expense_response = client.post("/api/expenses", headers=headers, json=expense_data)
    assert expense_response.status_code == 201
    expense_json = expense_response.json()
    assert expense_json["title"] == "Grocery Shopping"
    assert expense_json["amount"] == 120.50
    assert expense_json["category"] == "Food"
    expense_id = expense_json["id"]
    print("[OK] Expense creation successful!")

    print("\n6. Testing Get Expenses List...")
    list_response = client.get("/api/expenses", headers=headers)
    assert list_response.status_code == 200
    expenses_list = list_response.json()
    assert len(expenses_list) >= 1
    assert expenses_list[0]["title"] == "Grocery Shopping"
    print("[OK] Expense list retrieval works!")

    print("\n7. Testing Dashboard Stats Summary...")
    summary_response = client.get("/api/expenses/summary", headers=headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["total_spent"] == 120.50
    assert summary["monthly_budget"] == 1500.0
    assert summary["remaining_budget"] == 1379.50
    assert len(summary["category_breakdown"]) == 1
    assert summary["category_breakdown"][0]["category"] == "Food"
    assert summary["category_breakdown"][0]["amount"] == 120.50
    print("[OK] Dashboard statistics calculations are correct!")

    print("\n8. Testing Delete Expense...")
    delete_response = client.delete(f"/api/expenses/{expense_id}", headers=headers)
    assert delete_response.status_code == 204
    
    # Confirm it's gone
    list_response_after = client.get("/api/expenses", headers=headers)
    assert len(list_response_after.json()) == 0
    print("[OK] Expense deletion works!")
    
    print("\n--- ALL BACKEND INTEGRATION TESTS PASSED ---")

if __name__ == "__main__":
    test_flow()
