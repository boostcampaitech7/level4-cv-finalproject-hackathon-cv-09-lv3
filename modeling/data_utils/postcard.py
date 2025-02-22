import csv
import os
import re
import yaml

from openai import OpenAI

MAX_PROMPT_LENGTH = 1000

with open('src/api_keys.yaml') as f:
    keys = yaml.load(f, Loader=yaml.FullLoader)

OPEN_AI_KEY = keys['stamp_ai_key']

def load_captions_for_folder(csv_path, folder_name):
    """
    특정 폴더 이름과 관련된 이미지 캡션을 CSV에서 로드합니다.

    Parameters:
        csv_path (str): CSV 파일 경로
        folder_name (str): 캡션을 로드할 이미지 폴더 이름

    Returns:
        list: 지정된 폴더에 해당하는 이미지 캡션 리스트
    """
    captions = []
    with open(csv_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            image_path = row["image_path"]

            # 디렉터리 이름 추출 (예: "blog_1/image_1_*" -> "blog_1")
            directory = os.path.dirname(image_path).split('/')[0]

            if directory == folder_name:
                caption = row["captions"]
                # 캡션을 최대 3문장으로 분리
                sentences = caption.split('. ')
                truncated_caption = '. '.join(sentences[:3]).strip()
                captions.append(truncated_caption if truncated_caption.endswith('.') else truncated_caption + '.')

    return captions


def truncate_prompt(prompt, max_length):
    """
    프롬프트가 최대 길이를 초과하면 잘라냅니다.

    Parameters:
        prompt (str): 원본 프롬프트
        max_length (int): 최대 길이

    Returns:
        str: 잘라낸 프롬프트
    """
    if len(prompt) <= max_length:
        return prompt
    return prompt[:max_length].rsplit(" ", 1)[0]


def generate_postcard(api_key, prompt, model="dall-e-3", size="1024x1024", quality="standard", n=1):
    """
    DALL·E API를 사용해 엽서 이미지를 생성.

    Parameters:
        prompt (str): 이미지 생성을 위한 프롬프트
        model (str): DALL·E 모델 이름 (기본값: dall-e-3)
        size (str): 생성할 이미지 크기 (기본값: 1024x1024)
        quality (str): 이미지 품질 (기본값: standard)
        n (int): 생성할 이미지 수 (기본값: 1)

    Returns:
        list: 생성된 이미지 URL 리스트
    """    
    client = OpenAI(api_key=api_key)
    response = client.images.generate(
        model=model,
        prompt=prompt,
        n=n,
        size=size,
        quality=quality
    )
    return response.data[0].url

def generate_prompt(inputs,captions):
    place = inputs['meta_data']['Country/City']
    # 프롬프트 생성
    postcard_captions = []
    phrases_to_remove = [
    'The image depicts', 'The image shows', 'The image appears',
    'This image appears', 'This image is', 'The image features',
    'The image captures', 'The image is', 'The image contains',
    'In the image,', 'This image depicts', 'The image displays',
    'The image showcases', 'This image shows'
    ]
    
    # 불필요 문구 제거
    for caption in captions:    
        pattern = r'\b(?:' + '|'.join(re.escape(phrase) for phrase in phrases_to_remove) + r')\b'
        cleaned_text = re.sub(pattern, '', caption, flags=re.IGNORECASE).strip()
        postcard_captions.append(cleaned_text)

    prompt = (
        f"An illustration that tells a story about photos taken on a trip to {place}.\n"
        f"The descriptions of the photos are as follows: {', '.join(postcard_captions)}"
    )
    # 프롬프트 길이 제한 적용
    prompt = truncate_prompt(prompt, MAX_PROMPT_LENGTH)
    return prompt



def main():
    # OpenAI API 키 설정
    OPEN_AI_KEY = OPEN_AI_KEY
    
    # CSV 파일 경로
    csv_path = "caption_data/blog_image_captions_p_caption_english.csv"

    # 사용자 입력: 폴더 이름
    folder_name = input("Enter the folder name (e.g., blog_1): ").strip()

    # 특정 폴더에 대한 캡션 데이터 로드
    captions = load_captions_for_folder(csv_path, folder_name)
 
    if not captions:
        print(f"No captions found for folder: {folder_name}")
        return

    place = 'Europe'
    
    # 프롬프트 생성
    prompt = (
        f"An illustration that tells a story about photos taken on a trip to {place}.\n"
        f"The descriptions of the photos are as follows: {', '.join(captions)}"
    )
    # 프롬프트 길이 제한 적용
    prompt = truncate_prompt(prompt, MAX_PROMPT_LENGTH)

    # 이미지 생성
    try:
        url = generate_postcard(OPEN_AI_KEY, prompt)
        print(f"Generated image URL for folder {folder_name}: {url}")
    except Exception as e:
        print(f"Failed to generate image for folder {folder_name}: {e}")


if __name__ == "__main__":
    main()
