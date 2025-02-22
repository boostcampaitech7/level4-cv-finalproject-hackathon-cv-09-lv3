import torch
from torch.utils.data import DataLoader
import os
import pandas as pd
from tqdm import tqdm
import json
import requests

from datasets import load_dataset
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor
from qwen_vl_utils import process_vision_info

try:
    from .blog_image import dataset_for_train
except:
    from blog_image import dataset_for_train


def my_collate_fn(batches):
    return batches[0]

class VLM():
    '''
    generate caption with Qwen2VL model
    '''
    def __init__(self, model_path):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

        # default: Load the model on the available device(s)
        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            model_path, torch_dtype=torch.float16, device_map={"":"cuda:0"}
        ).to(self.device)

        self.processor = AutoProcessor.from_pretrained(model_path)

    def generate_caption(self, inputs):
        torch.cuda.empty_cache()
        inputs = inputs.to(self.device)
        generated_ids = self.model.generate(**inputs, max_new_tokens=512)
        generated_ids_trimmed = [
        out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = self.processor.batch_decode(
            generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )
        return output_text

        
    def generate_caption_from_csv(self, csv_path, image_path):
        """
        Finetuning에 활용될 크롤링 블로그의 이미지들에 대한 캡션을 생성합니다.

        Parameters:
            csv_path: 크롤링된 블로그 데이터셋 경로
            image_path: 캡션을 생성할 이미지 경로

        Returns:
            dataframe: 캡션이 저장된 데이터셋
        """
    
        image_csv = pd.read_csv(csv_path)['blog_number'][450:]

        image_paths = []
        for idx,strings in enumerate(image_csv):
            blog_path = os.path.join(image_path,strings)
            image_list = os.listdir(blog_path)
            image_num = len(image_list)
            for i in range(1,image_num+1):
                try: 
                    image = [img for img in image_list if img.split('.')[0] == 'image_'+str(i)]
                    if image[0].endswith('gif'):
                        pass
                    else:
                        image_paths.append(os.path.join(blog_path,image[0]))
                except:
                    pass

        dataset = dataset_for_train(dataset = image_paths, processor = self.processor)
        loader = DataLoader(dataset,batch_size=1,shuffle=False,collate_fn=my_collate_fn)

        self.model.eval()
        caption_csv = pd.DataFrame({'image_path':[],'captions': []})

        current_path = 'blog_1'
        for path, inputs in tqdm(loader):
            output_text = self.generate_caption(inputs)
            row = pd.DataFrame({'image_path':path, 'captions': output_text})

            caption_csv = pd.concat([caption_csv, row], ignore_index = True)

            if current_path != path.split('/')[0]:
                print(current_path + '완료!')
                caption_csv.to_csv('blog_image_captions2_3.csv',index=False, encoding = 'utf-8-sig')
                current_path = path.split('/')[0]
    
        caption_csv.to_csv('blog_image_captions2_3.csv',index=False, encoding = 'utf-8-sig')

    def generate_caption_for_blog(self,image):
        """
        블로그 생성을 위한 사용자의 input 이미지들에 대한 캡션을 생성합니다.

        Parameters:
            image: 사용자의 input image

        Returns:
            str: 이미지 캡션
        """

        image = image.resize((512,512))

        prompt = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image
                    },
                    {"type": "text", "text": "I want to know where it is and description about this image"},
                ]
            },
        ]
        
        text = self.processor.apply_chat_template(
            prompt, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(prompt)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
            truncation=True
        )

        caption = self.generate_caption(inputs)

        return caption
    
    def generate_caption_for_dalle(self,image):
        """
        달리를 통한 엽서 생성을 위한 사용자의 input 이미지들에 대한 캡션을 생성합니다.

        Parameters:
            image: 사용자의 input image

        Returns:
            str: 이미지 캡션
        """

        image = image.resize((512,512))

        prompt = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "image": image
                    },
                    {"type": "text", "text": "Caption for DALL-E in English:"},
                ]
            },
        ]
        
        text = self.processor.apply_chat_template(
            prompt, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(prompt)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
            truncation=True
        )

        caption = self.generate_caption(inputs)

        return caption
        
if __name__ == "__main__":
    model_path = 'Qwen/Qwen2-VL-7B-Instruct'
    csv = '/data/ephemeral/home/travel_blog/data/blog_images2/crawling/blog_crawling_results.csv'
    path = "/data/ephemeral/home/travel_blog/data/blog_images2/blog_data/images"
    vlm = VLM(model_path)
    vlm.generate_caption_from_csv(csv,path)