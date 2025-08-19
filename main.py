import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urljoin

app = FastAPI(
    title="Web Image Scraper API",
    description="image scraper",
    version="1.0.0"
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: HttpUrl 

def setup_driver():
    print("Setting up Selenium WebDriver")
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    driver = webdriver.Chrome(service=service, options=options)
    print("WebDriver setup complete.")
    return driver

def scroll_page(driver, attempts):
    print(f"Scrolling down {attempts} times")
    for i in range(attempts):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
    print("Scrolling complete.")

def extract_image_urls(driver, base_url):
    print("Extracting image URLs")
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    image_urls = set()
    for img_tag in soup.find_all('img'):
        src = img_tag.get('src') or img_tag.get('data-src')
        if src:
            absolute_url = urljoin(base_url, src)
            if absolute_url.startswith('http'):
                image_urls.add(absolute_url)
    print(f"Found {len(image_urls)} unique image URLs.")
    return list(image_urls)


@app.post("/scrape")
async def scrape_images(request: ScrapeRequest):
    target_url = str(request.url)
    print(f"Received request to scrape: {target_url}")

    driver = setup_driver()
    try:
        driver.get(target_url)
        time.sleep(3)
        
        scroll_page(driver, attempts=3)
        
        urls = extract_image_urls(driver, target_url)
        
        return {"image_urls": urls}

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        driver.quit()
        print("WebDriver session closed.")

