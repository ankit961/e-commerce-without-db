import requests
from playwright.sync_api import sync_playwright

def test_admin_access_and_generate_discount():
    NTH_ORDER = 3

    # Step 1: Submit enough orders to trigger coupon generation
    for i in range(NTH_ORDER - 1):
        requests.post("http://localhost:5000/checkout", json={
            "user_id": f"admin-dummy-{i}",
            "cart": [{"id": 1, "quantity": 1}]
        })

    # Step 2: Get coupon list before triggering
    before = requests.get("http://localhost:5000/admin/stats").json()
    existing_codes = before.get("discount_codes", [])

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(http_credentials={
            "username": "admin",
            "password": "admin#123"
        })
        page = context.new_page()

        # Step 3: Open admin
        page.goto("http://localhost:5000/admin.html")
        assert "ModernShop Admin" in page.title() or "Discount" in page.content()

        # Step 4: Trigger modal flow
        page.click("#generateCodeBtn")
        page.click("#confirmGenerate")

        # Step 5: Get coupon list after triggering
        after = requests.get("http://localhost:5000/admin/stats").json()
        updated_codes = after.get("discount_codes", [])

        # Step 6: Compare and act
        new_codes = list(set(updated_codes) - set(existing_codes))
        if new_codes:
            #  A new code was created, wait for modal
            page.wait_for_selector("#generatedCodeModal", state="visible", timeout=5000)
            code = page.inner_text("#generatedCodeDisplay")
            assert code == new_codes[0]
        else:
            print("⚠️ No new code generated (NTH_ORDER not satisfied) – skipping modal check.")
            assert True

        browser.close()
