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

class NaverBlogTextCrawler:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.blog_counter = 1

    def search_blogs(self, query, display=1, start=1, sort='sim'):
        """
        네이버 검색 API를 사용하여 블로그 검색
        """
        encText = urllib.parse.quote(query)
        url = f"https://openapi.naver.com/v1/search/blog?query={encText}&display={display}&start={start}&sort={sort}"

        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", self.client_id)
        request.add_header("X-Naver-Client-Secret", self.client_secret)

        try:
            response = urllib.request.urlopen(request)
            if response.getcode() == 200:
                response_body = response.read()
                response_json = json.loads(response_body)
                return pd.DataFrame(response_json['items'])
            else:
                print(f"오류 코드: {response.getcode()}")
                return pd.DataFrame()
        except Exception as e:
            print(f"검색 중 오류 발생: {str(e)}")
            return pd.DataFrame()

    def get_blog_content(self, url):
        """
        블로그 본문 내용과 이미지 위치를 추출
        """
        try:
            # 모바일 URL로 변환
            if url.find("m.blog.naver.com") == -1:
                url = url.replace("blog.naver.com", "m.blog.naver.com")
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # 이미지 URL 추출
            image_urls = []
            file_box = soup.find('div', id='_photo_view_property')
            if file_box:
                file_info = file_box.get('attachimagepathandidinfo', '[]')
                try:
                    file_list = json.loads(file_info)
                    image_urls = [f"https://blogfiles.pstatic.net{img_info['path']}" for img_info in file_list]
                except:
                    file_list = []

            # 본문 컨텐츠 처리
            content_parts = []
            current_image_idx = 0
            seen_texts = set()  # 중복 텍스트 체크를 위한 set
            seen_substrings = set()  # 부분 문자열 중복 체크를 위한 set

            # 본문 내용 추출
            if soup.find('div', {'class': 'se-main-container'}):
                content_div = soup.find('div', {'class': 'se-main-container'})
                for element in content_div.find_all(['p', 'img', 'div']):
                    if element.name == 'img':
                        if current_image_idx < len(image_urls):
                            content_parts.append(f' <image_{current_image_idx + 1}> ')
                            current_image_idx += 1
                    else:
                        text = element.get_text(strip=True)
                        if text and len(text) > 1:
                            # 텍스트 정제
                            text = self.clean_text(text)
                            if text.strip():
                                # 완전히 동일한 텍스트 체크
                                if text not in seen_texts:
                                    # 부분 문자열 중복 체크
                                    is_duplicate = False
                                    text_parts = text.split()
                                    for part in text_parts:
                                        if len(part) > 5 and part in seen_substrings:  # 5자 이상인 부분 문자열만 체크
                                            is_duplicate = True
                                            break
                                        seen_substrings.add(part)
                                    
                                    if not is_duplicate:
                                        content_parts.append(text)
                                        seen_texts.add(text)

            # 텍스트 합치기
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
        
        # 이미지 태그 임시 저장
        image_tags = re.findall(r'<image_\d+>', text)
        
        # 해시태그 제거
        text = re.sub(r'#\w+', '', text)
        
        # URL 제거
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # 이모지 제거
        text = re.sub(r'[^\u0000-\uFFFF]', '', text)
        
        # 특수문자 제거 (한글, 영문, 숫자, 일부 기본 문장부호 제외)
        text = re.sub(r'[^\w\s가-힣.,!?]', ' ', text)
        
        # 여러 개의 공백을 하나로 치환
        text = re.sub(r'\s+', ' ', text)
        
        # 이미지 태그 복원
        for tag in image_tags:
            text = text.strip() + ' ' + tag + ' '
        
        return text.strip()

    def download_images(self, url, blog_index, save_dir="./blog_images"):
        """
        블로그 포스트의 이미지 다운로드
        """
        if url.find("m.blog.naver.com") == -1:
            url = url.replace("blog.naver.com", "m.blog.naver.com")
        
        try:
            response = requests.get(url, headers=self.headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 순차적인 블로그 폴더명 생성
            folder_name = f"blog_{blog_index}"
            
            # 이미지 저장 폴더 생성
            blog_save_path = os.path.join(save_dir, folder_name)
            os.makedirs(blog_save_path, exist_ok=True)

            # 이미지 URL 추출
            file_box = soup.find('div', id='_photo_view_property')
            if not file_box:
                return []

            file_info = file_box.get('attachimagepathandidinfo', '[]')
            try:
                file_list = json.loads(file_info)
            except:
                file_list = []
            downloaded_images = []

            for idx, img_info in enumerate(file_list):
                try:
                    img_url = "https://blogfiles.pstatic.net" + img_info['path']
                    file_name = f"image_{idx + 1}.jpg"
                    save_path = os.path.join(blog_save_path, file_name)
                    
                    # 이미지 다운로드
                    urllib.request.urlretrieve(img_url, save_path)
                    downloaded_images.append(save_path)
                    time.sleep(0.5)  # 서버 부하 방지
                    
                except Exception as e:
                    print(f"이미지 {idx + 1} 다운로드 중 오류: {str(e)}")
                    continue

            return downloaded_images

        except Exception as e:
            print(f"블로그 {url} 처리 중 오류: {str(e)}")
            return []

def main():
    # 명령줄 인자 파서 설정
    parser = argparse.ArgumentParser(description='네이버 블로그 크롤러')
    parser.add_argument('--pages', type=int, default=1,
                      help='크롤링할 페이지 수 (기본값: 1)')
    parser.add_argument('--display', type=int, default=1,
                      help='페이지당 크롤링할 블로그 수 (기본값: 1, 최대: 100)')
    parser.add_argument('--query', type=str, default="여행",
                      help='검색할 키워드 (기본값: 여행)')
    parser.add_argument('--save-dir', type=str, default="./blog_data",
                      help='결과를 저장할 디렉토리 (기본값: ./blog_data)')
    
    args = parser.parse_args()
    
    # 설정
    CLIENT_ID = "kS0dy8G_vaPxfEFZMJtk"
    CLIENT_SECRET = "Bk3PlkJR_A"
    
    # 페이지당 블로그 수 제한
    if args.display > 100:
        print("경고: 페이지당 최대 100개까지만 가능합니다. display를 100으로 설정합니다.")
        args.display = 100
    
    # 크롤러 인스턴스 생성
    crawler = NaverBlogTextCrawler(CLIENT_ID, CLIENT_SECRET)
    
    # 저장 디렉토리 생성
    os.makedirs(args.save_dir, exist_ok=True)
    os.makedirs(os.path.join(args.save_dir, "images"), exist_ok=True)
    
    # 검색 결과 수집
    all_results = pd.DataFrame()
    for i in range(args.pages):
        start = 1 + (args.display * i)
        print(f"\n{i+1}번째 페이지 검색 중 (시작위치: {start})")
        result = crawler.search_blogs(args.query, display=args.display, start=start)
        if not result.empty:
            all_results = pd.concat([all_results, result], ignore_index=True)
    
    # 결과를 저장할 리스트
    results = []
    
    # 전체 블로그 처리
    for idx, row in tqdm(all_results.iterrows(), total=len(all_results), desc="블로그 처리 중"):
        print(f"\n처리 중인 URL: {row['link']}")
        
        # 블로그 내용 추출
        content_result = crawler.get_blog_content(row['link'])
        
        # 이미지 다운로드
        downloaded_images = crawler.download_images(row['link'], idx + 1, 
                                                 os.path.join(args.save_dir, "images"))
        
        # 결과 저장
        result_entry = {
            'blog_number': f"blog_{idx + 1}",
            'url': row['link'],
            'title': row['title'],
            'content': content_result['content'],
            'image_count': len(downloaded_images)
        }
        results.append(result_entry)
        
        time.sleep(1)  # 서버 부하 방지
    
    # 결과를 DataFrame으로 변환
    results_df = pd.DataFrame(results)
    
    # 결과 저장
    results_df.to_csv(os.path.join(args.save_dir, 'blog_crawling_results.csv'), 
                     index=False, encoding='utf-8-sig')
    
    print("\n크롤링이 완료되었습니다.")
    print(f"처리된 블로그 수: {len(results)}")
    print(f"결과가 {args.save_dir}에 저장되었습니다.")

if __name__ == "__main__":
    main() 