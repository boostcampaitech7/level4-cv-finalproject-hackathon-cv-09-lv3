import os
from openai import OpenAI
import requests
# import pytesseract
from PIL import Image
import json
from io import BytesIO
from data_utils.postcard import truncate_prompt, MAX_PROMPT_LENGTH

def generate_stamp_image(api_key: str, final_prompt: str) -> str:
    """
    OpenAI의 이미지 생성 API를 호출하여 final_prompt를 바탕으로 스탬프 이미지를 생성하고,
    생성된 이미지의 URL을 반환합니다.
    """
    client = OpenAI(api_key=api_key)

    response = client.images.generate(prompt=final_prompt,
    model="dall-e-3",
    n=1,
    size="1024x1024"
    )
    
    image_url = response.data[0].url
    return image_url


def create_stamp(api_key: str, input_json: json) -> None:
    """
    OpenAI의 이미지 생성 API로 스탬프 이미지를 생성
    
    """
    place = input_json['meta_data']['Country/City']
    place = '/'.join(place.split('/')[::-1])

    prompt = (
        f"A circular passport stamp on a pure white background, featuring iconic landmarks and cultural elements from {place}."
    )
    # 프롬프트 길이 제한 적용
    final_prompt = truncate_prompt(prompt, MAX_PROMPT_LENGTH)


    print("\n[최종 프롬프트]---------------------------------")
    print(final_prompt)
    print("--------------------------------------------")

    # -------------------------------
    # 여권 스탬프 이미지 생성
    # -------------------------------
    stamp_url = generate_stamp_image(api_key, final_prompt)
    print(f" - 생성된 스탬프 이미지 URL: {stamp_url}")
    return stamp_url


def main():
    # OpenAI API 키 설정
    OPEN_AI_KEY = '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'

    place = 'Europe'
    # 사용자 입력: 폴더 이름
    place = input("Enter the visited place (e.g., Japan): ").strip()
    
    # 프롬프트 생성
    prompt = (
        f"A circular passport stamp on a pure white background, featuring iconic landmarks and cultural elements from {place}."
    )
    
    # 이미지 생성
    try:
        url = create_stamp(OPEN_AI_KEY, prompt)
    except Exception as e:
        print(f"Failed to generate passport stamp: {e}")
    
    
if __name__ == "__main__":
    main()