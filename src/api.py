from typing import List, Optional, Union
from PIL import Image
import json
import requests
from io import BytesIO

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel,HttpUrl

from FAST_API.dependencies import get_model
from data_utils.generate_prompt import generate_inference_caption
from Inference import get_demo
from data_utils.postcard import generate_prompt, generate_postcard

system_prompt = '''
    당신은 세계 최고의 여행 블로거입니다. 당신의 임무는 주어진 이미지에 대한 설명과 느낀점을 바탕으로 해당 이미지에 대한 여행 블로그를 작성하는 것입니다. 다음 규칙을 절대적으로 따르세요.

    1. 주어진 이미지에 대한 내용으로만 블로그를 구성할 것
    2. 설명, 느낀점으로 주어진 텍스트를 절대 그대로 사용하지 말고 둘을 조합하고 변형해 하나의 통일된 문체를 가진 글로 표현할 것
    3. 이미지가 들어갈 위치에 <image 숫자> 태그를 통해 표시할 것
    4. 이미지 별로 주어진 설명과 느낀점을 활용해 방문기를 풍부하고 실감나게 표현할 것
    5. 불필요한 태그, 특수문자를 사용하지 말 것. 특히 설명: 느낀점: 과 같이 블로그 글에 어색한 프롬포트의 문단 구성을 그대로 활용하지 말것
    6. 추가적으로 느낀점과 설명의 표현보다 더 풍부하게 글을 생성해 이미지에 대한 여행자의 느낌이 실감나게 드러날 수 있도록 글을 생성할 것
    7. 친근한 말투를 사용할 것
    
    '''

base_prompt = '여행에 대한 정보: 여행 시기: {}년 {}월, 여행지: {}의 {}, 동행: {}'

router = APIRouter()
OPEN_AI_KEY = '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'

class PredictionResponse(BaseModel):
    result: str
    image: List[HttpUrl]

@router.post("/predict")
def predict(files: List[UploadFile] = File(...),
            jsons: UploadFile = File(...)) -> PredictionResponse:
    images = []
    print(files)
    print(jsons)
    # for file in files:
    #     assert file.content_type.startswith('image')
    #     img = Image.open(file.file)
    #     img = img.resize((512,512))
    #     images.append(img)
    for file in files:
        if file.content_type.startswith('image/'):
            try:
                img = Image.open(file.file)
                img = img.resize((512, 512))  
                images.append(img)
            except Exception as e:
                print(f"Error processing file {file.filename}: {e}")
        else:
            print(f"Skipped non-image file: {file.filename}, type: {file.content_type}")
    
    print(f"Processed {len(images)} images.")

    model = get_model()
    captions = []
    blog_captions = []

    for image in images:
        caption = model.generate_caption_with_json(image)
        captions.append(caption)
        blog_captions.append('.'.join(caption[0].split('.')[:2]))
    
    if jsons:
        json_file = jsons.file.read()
        input_json = json.loads(json_file)
    
    assert len(input_json['texts']) == len(captions)
    blog_prompt = generate_inference_caption(input_json,captions, base_prompt)
    prediction = get_demo(system_prompt, blog_prompt)

    postcard_prompt = generate_prompt(input_json,blog_captions)
    print(postcard_prompt)

    postcard_urls = []

    '''for i in range(3):
        postcard_url = generate_postcard(OPEN_AI_KEY, postcard_prompt)
        postcard_urls.append(postcard_url)'''


    return PredictionResponse(result = prediction, image = postcard_urls)  