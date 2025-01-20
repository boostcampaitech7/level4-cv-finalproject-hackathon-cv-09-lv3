import torch
from torch.utils.data import DataLoader
import os
import pandas as pd
from tqdm import tqdm
import re
import requests

from datasets import load_dataset
from transformers import Qwen2VLForConditionalGeneration, AutoTokenizer, AutoProcessor

from blog_image import blog_image_dataset


def my_collate_fn(batches):
    return batches[0]

def generate_caption():
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    image_csv = pd.read_csv('data/blog_test_data/blog_crawling_results.csv')['blog_number']
    images_path = []
    
    image_paths = []
    for idx,strings in enumerate(image_csv):
        blog_path = os.path.join('data/blog_images',strings)
        image_list = os.listdir(blog_path)
        image_num = len(image_list)
        for i in range(1,image_num+1):
            try: 
                image = [img for img in image_list if img.startswith('image_'+str(i)+'_')]
                if image[0].endswith('gif'):
                    pass
                else:
                    image_paths.append(os.path.join(blog_path,image[0]))
            except:
                pass

    
    # default: Load the model on the available device(s)
    model = Qwen2VLForConditionalGeneration.from_pretrained(
        "Qwen/Qwen2-VL-7B-Instruct", torch_dtype=torch.float16, device_map={"":"cuda:0"}
    ).to(device)

    processor = AutoProcessor.from_pretrained("Qwen/Qwen2-VL-7B-Instruct")

    dataset = blog_image_dataset(dataset = image_paths, processor = processor)
    loader = DataLoader(dataset,batch_size=1,shuffle=False,collate_fn=my_collate_fn)

    model.eval()
    caption_csv = pd.DataFrame({'image_path':[],'captions': []})

    current_path = 'blog_1'
    for path, inputs in tqdm(loader):
        torch.cuda.empty_cache()
        inputs = inputs.to(device)
        generated_ids = model.generate(**inputs, max_new_tokens=512)
        generated_ids_trimmed = [
        out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = processor.batch_decode(
            generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )
        row = pd.DataFrame({'image_path':path, 'captions': output_text})

        caption_csv = pd.concat([caption_csv, row], ignore_index = True)

        if current_path != path.split('/')[0]:
            print(current_path + '완료!')
            caption_csv.to_csv('blog_image_captions.csv',index=False)
            current_path = path.split('/')[0]