from typing import List
from PIL import Image
import json

from fastapi import APIRouter, HTTPException, status, UploadFile
from pydantic import BaseModel

from FAST_API.dependencies import get_model
from data_utils.generate_prompt import generate_inference_caption
from Inference import get_demo

router = APIRouter()

class PredictionResponse(BaseModel):
    result: str

@router.post("/predict")
def predict(files: List[UploadFile],
            jsons: UploadFile) -> PredictionResponse:
    images = []
    for file in files:
        assert file.content_type.startswith('image')

        img = Image.open(file.file)
        img = img.resize((512,512))
        images.append(img)

    model = get_model()
    captions = []

    for image in images:
        caption = model.generate_caption_with_json(image)
        captions.append(caption)

    with open('data/jeju_example.json', 'r') as json_file:
        input_json = json.load(json_file)
    
    assert len(input_json['texts']) == len(captions)
    prompt = generate_inference_caption(input_json,captions)
    prediction = get_demo(prompt)

    return PredictionResponse(result = prediction)