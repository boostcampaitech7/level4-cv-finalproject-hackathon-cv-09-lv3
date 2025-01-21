import requests

from generate_caption import VLM
from generate_prompt import generate_inference_caption
from train_API import GetDemoExecutor

def get_demo(prompt):
    completion_executor = GetDemoExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key='Bearer nv-17385a251c36440aab340ff38f8242e3EhLs',
        request_id='ait7-nc02'
    )

    preset_text = [{"role": "system", "content": "test"},
                   {"role":"user","content": prompt}]

    request_data = {
        'messages': preset_text,
        'topP': 0.8,
        'topK': 0,
        'maxTokens': 2048,
        'temperature': 0.5,
        'repeatPenalty': 5,
        'stopBefore': [],
        'includeAiFilters': True
    }

    print(preset_text)
    completion_executor.execute(request_data)

def main(jsons,images):
    model = VLM()
    captions = []

    for image in images:
        caption = model.generate_caption_with_json(image)
        captions.append(caption)
    
    assert len(jsons['text']) == len(captions)
    prompt = generate_inference_caption(jsons,captions)
    get_demo(prompt)

if __name__ == "__main__":
    main()


    
