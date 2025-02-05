from typing import List, Optional, Union
from PIL import Image
import json
import time
from io import BytesIO

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel,HttpUrl

from FAST_API.dependencies import get_model
from data_utils.processing import preprocessing,get_blog,get_dalle, multi_process

router = APIRouter()

class PredictionResponse(BaseModel):
    result: str
    image: List[HttpUrl]
    #stamp: List[HttpUrl]

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

    
    if jsons:
        json_file = jsons.file.read()
        input_json = json.loads(json_file)

    model = get_model()

    #generate blog_caption
    captions = preprocessing(model,images)
    
    assert len(input_json['texts']) == len(captions)

    #generate blog, dalle
    start_time = time.time()
    #results = get_blog(input_json,captions,files)
    #postcard_urls = get_dalle(model, images, input_json)    

    results, postcard_urls = multi_process(model,images,input_json,captions,files)

    end_time = time.time()
    elapsed_time = end_time - start_time
    print(elapsed_time)
    
    return PredictionResponse(result = results, image = postcard_urls)