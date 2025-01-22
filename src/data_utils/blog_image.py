import os
import pandas as pd
from torch.utils.data import Dataset,DataLoader
from PIL import Image

from qwen_vl_utils import process_vision_info

class dataset_for_train(Dataset):
    def __init__(self,dataset,processor):
        self.ds = dataset
        self.processor = processor

    def __len__(self):
        return len(self.ds)

    def __getitem__(self,idx):
        if isinstance(self.ds, pd.DataFrame): 
            data = self.ds[idx]
        data_idx = os.path.join(data.split('/')[2],data.split('/')[3])
        image = Image.open(data)
        image = image.resize((512,512))

        messages = self.generate_prompt(image)
        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
            truncation=True
        )

        return data_idx, inputs
    
    def dataset_for_inference(self, image):

        prompt = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image
                    },
                    {"type": "text", "text": "Please describe the image in detail.:"},
                ]
            },
        ]
        return prompt