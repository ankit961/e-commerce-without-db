from playwright.sync_api import sync_playwright
import requests

import requests
from playwright.sync_api import sync_playwright

def test_checkout_with_valid_coupon():
    # Step 1: Ensure we create a coupon by simulating (NTH_ORDER - 1) orders
    NTH_ORDER = 3
    requests.post("http://localhost:5000/checkout", json={
        "user_id": "dummy1",
        "cart": [{"id": 1, "quantity": 1}]
    })
    requests.post("http://localhost:5000/checkout", json={
        "user_id": "dummy2",
        "cart": [{"id": 2, "quantity": 1}]
    })

    # Step 2: Generate a coupon — should succeed now
    gen_res = requests.post("http://localhost:5000/admin/generate-discount")
    gen_data = gen_res.json()
    assert "code" in gen_data, "❌ No discount code generated. NTH_ORDER logic failed."
    coupon_code = gen_data["code"]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Add item to cart
        page.goto("http://localhost:5000/")
        page.click('text=Add')

        # Go to cart page
        page.goto("http://localhost:5000/cart.html")
        page.fill("#discountCode", coupon_code)
        page.click("#applyDiscount")

        # Wait for discount to be applied
        page.wait_for_selector("#discountContainer", state="visible", timeout=5000)

        # Proceed to checkout
        def handle_dialog(dialog):
            assert "Order placed" in dialog.message
            dialog.accept()
        page.on("dialog", handle_dialog)

        page.click("#checkoutButton")
        page.wait_for_timeout(1000)
        browser.close()
def test_checkout_without_coupon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Add product
        page.goto("http://localhost:5000/")
        page.click('text=Add')

        # Checkout without applying any coupon
        page.goto("http://localhost:5000/cart.html")

        def handle_dialog(dialog):
            assert "Order placed" in dialog.message
            dialog.accept()
        page.on("dialog", handle_dialog)

        page.click("#checkoutButton")
        page.wait_for_timeout(1000)
        browser.close()
