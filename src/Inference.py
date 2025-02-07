import requests
import yaml

from data_utils.generate_caption import VLM
from data_utils.generate_prompt import generate_inference_caption

with open('src/api_keys.yaml') as f:
    keys = yaml.load(f,Loader = yaml.FullLoader)
api_key = keys['api_key']

class GetDemoExecutor:
    def __init__(self, host, api_key, request_id):
        self._host = host
        self._api_key = api_key
        self._request_id = request_id

    def execute(self, completion_request):
        headers = {
            "Authorization": api_key,  # Replace with your actual API Key
            "X-NCP-CLOVASTUDIO-REQUEST-ID": "ait7-nc02",  # Replace with your Request ID
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }

        with requests.post(self._host + '/testapp/v2/tasks/a3rb0o5p/chat-completions', #'/testapp/v1/chat-completions/HCX-003'
                           headers=headers, json=completion_request, ) as r:
            for i,line in enumerate(r.iter_lines()):
                if line and i%4 == 2:
                    text = line.decode("utf-8")
                    if "result" in text:
                        return text.split('"content":')[1].split('}')[0]
                    elif "status" in text:
                        return text
                    else:
                        pass
                else: 
                    pass



def get_demo(system_prompt, prompt, seed):
    completion_executor = GetDemoExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key=api_key,
        request_id='ait7-nc02'
    )

    preset_text = [{"role": "system", "content": system_prompt + prompt},
                   {"role":"user","content": '주어진 블로그 정보와 규칙에 맞게 블로그를 작성하세요'}]

    request_data = {
        'messages': preset_text,
        'topP': 0.8,
        'topK': 0,
        'maxTokens': 1000,
        'temperature': 0.3,
        'repeatPenalty': 7,
        'stopBefore': [],
        'includeAiFilters': True,
        'seed': seed
    }

    request_text = completion_executor.execute(request_data)
    return request_text

def main(jsons,images):
    model = VLM()
    captions = []

    for image in images:
        caption = model.generate_caption_with_json(image)
        captions.append(caption)
    
    assert len(jsons['text']) == len(captions)
    prompt = generate_inference_caption(jsons,captions)
    request_text =get_demo(prompt)
    #results = postprocessing(request_text, files)
    

if __name__ == "__main__":
    main()


    
