# -*- coding: utf-8 -*-

import http.client
import json
import pandas as pd
from tqdm import tqdm
import time
import requests
import re

def text_processing(text):
    
    if not isinstance(text, str):
        print(text)
        raise TypeError("Input must be a string")

    pattern = re.compile(r"[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~` ]")
    return pattern.sub("", text)


class CompletionExecutor:
    def __init__(self, host, api_key, request_id):
        self._host = host
        self._api_key = api_key
        self._request_id = request_id

    def _send_request(self, completion_request):
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': self._api_key,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }

        conn = http.client.HTTPSConnection(self._host)
        conn.request('POST', '/testapp/v1/api-tools/summarization/v2', json.dumps(completion_request), headers)
        response = conn.getresponse()
        result = json.loads(response.read().decode(encoding='utf-8'))
        conn.close()
        return result

    def execute(self, completion_request):
        res = self._send_request(completion_request)
        if res['status']['code'] == '20000':
            return res['result']['text']
        else:
            print(res['status']['code'])
            return "Error"
#'https://clovastudio.stream.ntruss.com/testapp/v1/api-tools/summarization/v2'

def papago(text):
    # API 정보
    url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation'
    headers = {
        'X-NCP-APIGW-API-KEY-ID': 'mbxkxfsxqq',
        'X-NCP-APIGW-API-KEY': 'V8tk8q4M8TlrSMUovV7lZ40XVwFFtSfAv1Gxopat',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    processed_texts = []
    for t in text:
        processed_texts.append(text_processing(t))

    # 반복 처리
    data = {
        'source': 'en',
        'target': 'ko',
        'text': processed_texts
    }
    response = requests.post(url, headers=headers, data=data)
    response_text = response.json()

    if 'message' not in response_text.keys():
        print(response_text)
        time.sleep(60)
        response = requests.post(url, headers=headers, data=data)
        response_text = response.json()
    
    response_text = response_text['message']['result']['translatedText']
    return response_text

if __name__ == '__main__':
    text_csv = pd.read_csv('data/cleaned_text_crawling.csv')

    
    completion_executor = CompletionExecutor(
        host='clovastudio.stream.ntruss.com',
        api_key='Bearer nv-b506cff902b14a71882c5b46e031553dP4FS',
        request_id='28f8fee200ea4babbf18fc2391659072'
    )

    response_texts = []
    for j in range(20):
        for i in tqdm(text_csv['content'][j*50:(j+1)*50]):
            if len(i) > 35000:
                i = i[:35000]
            request_data = json.loads(f'''{{
            "texts" : ["{i}"],
            "segMinSize" : 300,
            "includeAiFilters" : false,
            "autoSentenceSplitter" : true,
            "segCount" : -1,
            "segMaxSize" : 1000
        }}''', strict=False)

            response_text = completion_executor.execute(request_data)
            if response_text == "Error":
                time.sleep(60)
                response_text = completion_executor.execute(request_data)
            response_texts.append(response_text)
    
    text_csv['summary'] = response_texts
    text_csv.to_csv('data/cleaned_text_crawling_with_summary.csv',index=False)