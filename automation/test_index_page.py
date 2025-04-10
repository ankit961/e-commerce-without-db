from playwright.sync_api import sync_playwright

def test_add_to_cart_updates_badge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("http://localhost:5000/")

        # Add the first item
        page.click('text=Add')
        page.wait_for_selector('#cartBadge:not(.hidden)')
        badge_value = page.inner_text('#cartBadge')
        assert badge_value == '1'
        browser.close()
