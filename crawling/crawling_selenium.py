import os
import sys
import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
from tqdm import tqdm
import re
import urllib.request
import argparse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

class NaverBlogTextCrawler:
    def __init__(self, driver_path):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.blog_counter = 1
        self.driver_path = driver_path
        self.driver = None
    
    def get_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-software-rasterizer")
        service = Service(self.driver_path)
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        return self.driver

    def restart_browser(self):
        """브라우저 재시작"""
        if self.driver:
            self.driver.quit()
        time.sleep(2)
        return self.get_driver()

    def search_blogs(self, display, post_num):
        """
        SELENIUM을 사용하여 블로그 검색
        """
        base_url = 'https://blog.naver.com/PostView.naver?blogId=hloveh01&logNo=223743809792&categoryNo=0&parentCategoryNo=0&viewDate=&currentPage=1&postListTopCurrentPage=&from=&userTopListOpen=true&userTopListCount=5&userTopListManageOpen=false&userTopListCurrentPage'
        driver = self.get_driver()

        post_url = f'{base_url}={display}'
        driver.get(post_url)

        post_title = driver.find_element(By.CSS_SELECTOR,f'#listTopForm > table > tbody > tr:nth-child({post_num}) > td.title > div > span')
        title = post_title.text
        post_title.click()
        time.sleep(1)

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        url = driver.current_url
        return soup, url, title

    def get_blog_content(self, soup):
        """
        블로그 본문 내용과 이미지 위치를 추출
        """
        try:
            # 이미지 URL 추출
            image_urls = []
            img_elements = soup.find_all('img', class_=['se-image-resource', 'se_mediaImage', '_image_source'])
            valid_image_count = 0  # 유효한 이미지 수 카운트
            
            for img in img_elements:
                img_url = None
                if img.get('data-lazy-src'):
                    img_url = img['data-lazy-src']
                elif img.get('data-original'):
                    img_url = img['data-original']
                elif img.get('src'):
                    img_url = img['src']
                
                if img_url:
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    if 'type=w' in img_url or 'type=m' in img_url:
                        img_url = img_url.replace('type=w80', 'type=w966')
                        img_url = img_url.replace('type=m120', 'type=w966')
                    image_urls.append(img_url)
                    valid_image_count += 1  # 유효한 이미지 URL을 찾을 때만 증가

            # 본문 컨텐츠 처리
            content_parts = []
            current_image_idx = 0
            seen_texts = set()
            seen_substrings = set()

            if soup.find('div', {'class': 'se-main-container'}):
                content_div = soup.find('div', {'class': 'se-main-container'})
                for element in content_div.find_all(['p', 'img', 'div']):
                    if element.name == 'img':
                        if current_image_idx < valid_image_count:  # 유효한 이미지 수만큼만 태그 추가
                            content_parts.append(f' <image_{current_image_idx + 1}> ')
                            current_image_idx += 1
                    else:
                        text = element.get_text(strip=True)
                        if text and len(text) > 1:
                            text = self.clean_text(text)
                            if text.strip():
                                if text not in seen_texts:
                                    is_duplicate = False
                                    text_parts = text.split()
                                    for part in text_parts:
                                        if len(part) > 5 and part in seen_substrings:
                                            is_duplicate = True
                                            break
                                        seen_substrings.add(part)
                                    
                                    if not is_duplicate:
                                        content_parts.append(text)
                                        seen_texts.add(text)

            content = ' '.join(content_parts)
            content = re.sub(r'\s+', ' ', content).strip()

            return {
                'content': content,
                'image_urls': image_urls
            }
        
        except Exception as e:
            print(f"블로그 내용 추출 중 오류: {str(e)}")
            return {'content': '', 'image_urls': []}

    def clean_text(self, text):
        """
        텍스트 정제 함수
        """
        if pd.isna(text):
            return ""
        
        image_tags = re.findall(r'<image_\d+>', text)
        text = re.sub(r'#\w+', '', text)
        text = re.sub(r'http\S+|www.\S+', '', text)
        text = re.sub(r'[^\u0000-\uFFFF]', '', text)
        text = re.sub(r'[^\w\s가-힣.,!?]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        for tag in image_tags:
            text = text.strip() + ' ' + tag + ' '
        
        return text.strip()

    def download_images(self, soup, url, blog_index, save_dir="/data/ephemeral/home/DY/DATA/40_2/blog_images"):
        """
        블로그 포스트의 고품질 이미지 다운로드
        """
        try:
            folder_name = f"blog_{blog_index}"
            blog_save_path = os.path.join(save_dir, folder_name)
            os.makedirs(blog_save_path, exist_ok=True)

            downloaded_images = []
            img_elements = soup.find_all('img', class_=['se-image-resource', 'se_mediaImage', '_image_source'])
            
            for idx, img in enumerate(img_elements):  
                try:
                    img_url = None
                    if img.get('data-lazy-src'):
                        img_url = img['data-lazy-src']
                    elif img.get('data-original'):
                        img_url = img['data-original']
                    elif img.get('src'):
                        img_url = img['src']
                    
                    if img_url:
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        if 'type=w' in img_url or 'type=m' in img_url:
                            img_url = img_url.replace('type=w80', 'type=w966')
                            img_url = img_url.replace('type=m120', 'type=w966')
                        
                        file_name = f"image_{idx + 1}.jpg"
                        save_path = os.path.join(blog_save_path, file_name)
                        urllib.request.urlretrieve(img_url, save_path)
                        downloaded_images.append(save_path)
                        time.sleep(0.5)
                        
                except Exception as e:
                    print(f"이미지 {idx + 1} 다운로드 중 오류: {str(e)}")
                    continue

            return downloaded_images

        except Exception as e:
            print(f"블로그 {url} 이미지 처리 중 오류: {str(e)}")
            return []

def check_available_space(path):
    """디스크 여유 공간을 GB 단위로 반환"""
    # overlay 파일시스템 공간 체크
    try:
        import subprocess
        df_output = subprocess.check_output(['df', '/']).decode('utf-8')
        overlay_avail = float(df_output.split('\n')[1].split()[3]) / (1024 * 1024)  # GB로 변환
        
        # ephemeral 공간 체크
        stats = os.statvfs(path)
        ephemeral_avail = (stats.f_bavail * stats.f_frsize) / (1024 * 1024 * 1024)  # GB로 변환
        
        return min(overlay_avail, ephemeral_avail)
    except:
        # 에러 발생시 기존 방식으로 체크
        stats = os.statvfs(path)
        return (stats.f_bavail * stats.f_frsize) / (1024 * 1024 * 1024)

def main():
    parser = argparse.ArgumentParser(description='네이버 블로그 크롤러')
    parser.add_argument('--pages', type=int, default=1,
                      help='크롤링할 페이지 수 (기본값: 1)')
    parser.add_argument('--save-dir', type=str, default="/data/ephemeral/home/DY/DATA/40_2/blog_data",
                      help='결과를 저장할 디렉토리 (기본값: /data/ephemeral/home/DY/DATA/40_2/blog_data)')
    parser.add_argument('--driver-path', type=str, default="/data/ephemeral/home/DY/chromedriver-linux64/chromedriver",
                      help='크롬드라이버 경로 (기본값: /data/ephemeral/home/DY/chromedriver-linux64/chromedriver)')
    
    args = parser.parse_args()
    
    os.makedirs(args.save_dir, exist_ok=True)
    os.makedirs(os.path.join(args.save_dir, "images"), exist_ok=True)

    crawler = NaverBlogTextCrawler(args.driver_path)
    driver = crawler.get_driver()
    
    results = []
    space_warning_shown = False
    post_count = 0  # 처리한 포스트 수를 추적

    for i in range(args.pages):
        for p in range(1,11):
            # 5개 포스트마다 브라우저 재시작 (수정된 부분)
            post_count += 1
            if post_count % 5 == 0:
                print("\n브라우저를 재시작합니다...")
                driver = crawler.restart_browser()
                print("브라우저가 재시작되었습니다.")
                # Chrome 임시 파일 삭제
                os.system('rm -rf /tmp/.com.google.Chrome.*')
                os.system('rm -rf /tmp/.org.chromium.Chromium.*')

            # 사용 가능한 공간 체크
            available_space = check_available_space("/data/ephemeral")
            if available_space < 5:
                if not space_warning_shown:
                    print(f"\n경고: 저장 공간이 5GB 미만입니다 ({available_space:.2f}GB). 크롤링을 중단합니다.")
                    space_warning_shown = True
                
                if results:
                    results_df = pd.DataFrame(results)
                    results_df.to_csv(os.path.join(args.save_dir, 'blog_crawling_results.csv'), 
                                    index=False, encoding='utf-8-sig')
                    print(f"\n크롤링이 중단되었습니다.")
                    print(f"처리된 블로그 수: {len(results)}")
                    print(f"결과가 {args.save_dir}에 저장되었습니다.")
                
                driver.quit()  # 브라우저 종료
                return

            idx = 10 * i + p
            
            try:
                blog_soup, url, title = crawler.search_blogs(display=i, post_num=p)
                content_result = crawler.get_blog_content(blog_soup)
                downloaded_images = crawler.download_images(blog_soup, url, idx, 
                                                        os.path.join(args.save_dir, "images"))

                print(f'blog {idx} 완료 (남은 용량: {available_space:.2f}GB)')
                
                result_entry = {
                    'blog_number': f"blog_{idx}",
                    'url': url,
                    'title': title,
                    'content': content_result['content'],
                    'image_count': len(downloaded_images)
                }
                results.append(result_entry)

            except Exception as e:
                print(f"블로그 {idx} 처리 중 오류: {str(e)}")
                continue
            
        time.sleep(1)
    
    if results:
        results_df = pd.DataFrame(results)
        results_df.to_csv(os.path.join(args.save_dir, 'blog_crawling_results.csv'), 
                         index=False, encoding='utf-8-sig')
        
        print("\n크롤링이 완료되었습니다.")
        print(f"처리된 블로그 수: {len(results)}")
        print(f"결과가 {args.save_dir}에 저장되었습니다.")
    
    driver.quit()  # 작업 완료 후 브라우저 종료

if __name__ == "__main__":
    main() 