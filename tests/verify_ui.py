from playwright.sync_api import sync_playwright
import subprocess
import time
import os

def run_verification():
    # Start a simple web server
    server = subprocess.Popen(["python3", "-m", "http.server", "8000"])
    time.sleep(2) # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(record_video_dir="tests/videos")
            page = context.new_page()

            # Go to site
            page.goto("http://localhost:8000")
            page.wait_for_timeout(1000)

            # 1. Verify FAQ
            # Scroll to FAQ
            faq_section = page.locator("#faq")
            faq_section.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            page.screenshot(path="tests/screenshots/faq_closed.png")

            # Open first FAQ item
            first_faq_header = page.locator("#faq .accordion-header").first
            first_faq_header.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="tests/screenshots/faq_open.png")

            # 2. Verify Lightbox
            # Scroll to Gallery
            gallery_section = page.locator("#galerie")
            gallery_section.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)

            # Click an image in the gallery
            first_gallery_item = page.locator(".gallery-item").first
            first_gallery_item.click()
            page.wait_for_timeout(1000)

            # Check if lightbox is visible
            page.screenshot(path="tests/screenshots/lightbox_open.png")

            # Close lightbox
            close_btn = page.locator(".lightbox-close")
            close_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="tests/screenshots/lightbox_closed.png")

            context.close()
            browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    run_verification()
