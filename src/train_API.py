import requests
import datetime
import hmac
import hashlib
import base64
import json
import re

class CreateTaskExecutor:
    def __init__(self, host, uri, api_key, request_id):
        self._host = host
        self._uri = uri
        self._api_key = api_key
        self._request_id = request_id


    def _send_request(self, create_request):

        headers = {
            'Authorization': self._api_key,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }
        result = requests.post(self._host + self._uri, json=create_request, headers=headers).json()
        return result

    def execute(self, create_request):
        res = self._send_request(create_request)
        if 'status' in res and res['status']['code'] == '20000':
            return res['result']
        else:
            return res

class FindTaskExecutor:
    def __init__(self, host, uri, api_key, request_id):
        self._host = host
        self._uri = uri
        self._api_key = api_key
        self._request_id = request_id

    def _send_request(self, task_id):
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': self._api_key,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }

        result = requests.get(self._host + self._uri + task_id, headers=headers).json()
        return result

    def execute(self, taskId):
        res = self._send_request(taskId)
        if 'status' in res and res['status']['code'] == '20000':
            return res['result']
        else:
            return res

def create_tuning():
    completion_executor = CreateTaskExecutor(
        host='https://clovastudio.stream.ntruss.com',
        uri='/tuning/v2/tasks',
        api_key='Bearer nv-17385a251c36440aab340ff38f8242e3EhLs',
        request_id='ait7-nc02',
    )

    request_data = {'name': 'generation_task',
                    'model': 'HCX-003',
                    'tuningType': 'PEFT',
                    'taskType': 'GENERATION',
                    'trainEpochs': '8',
                    'learningRate': '1e-5f',
                    'trainingDatasetBucket': 'cv09storage',
                    'trainingDatasetFilePath': 'finetune_dataset.csv',
                    'trainingDatasetAccessKey': 'ncp_iam_BPASKRXTnu9ha6ZsK3IA',
                    'trainingDatasetSecretKey': 'ncp_iam_BPKSKRLOdXh0sByyp8nE4FPLseFhFze68f'
                    }
    response_text = completion_executor.execute(request_data)
    print(request_data)
    print(response_text)

def get_tuning():
    completion_executor = FindTaskExecutor(
        host='https://clovastudio.stream.ntruss.com',
        uri='/tuning/v2/tasks/',
        api_key='Bearer nv-17385a251c36440aab340ff38f8242e3EhLs',
        request_id='ait7-nc02'
    )

    taskId = '2wk3hqg0' #'stoezxa7'
    response_text = completion_executor.execute(taskId)
    print(taskId)
    print(response_text)


class GetDemoExecutor:
    def __init__(self, host, api_key, request_id):
        self._host = host
        self._api_key = api_key
        self._request_id = request_id

    def execute(self, completion_request):
        headers = {
            "Authorization": "Bearer nv-17385a251c36440aab340ff38f8242e3EhLs",  # Replace with your actual API Key
            "X-NCP-CLOVASTUDIO-REQUEST-ID": "ait7-nc02",  # Replace with your Request ID
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }

        with requests.post(self._host + '/testapp/v2/tasks/2wk3hqg0/chat-completions',
                           headers=headers, json=completion_request, ) as r:
            for i,line in enumerate(r.iter_lines()):
                if line and i%4 == 2:
                    text = line.decode("utf-8")
                    if "result" in text:
                        print(text.split('"content":')[1].split('}')[0])
                        


def get_demo():
    completion_executor = GetDemoExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key='Bearer nv-17385a251c36440aab340ff38f8242e3EhLs',
        request_id='ait7-nc02'
    )

    preset_text = [{"role": "system", "content": "test"},
                   {"role":"user","content":'너는 여행블로그를 써주는 에이전트야. 아래에 블로그에 들어갈 사진들에 대한 설명과 블로그 요약을 줄게. 한국어로 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘. \n<image0>: 이미지는 수영장이나 석호 같은 얕은 수역에 서 있는 일곱 명의 사람들을 묘사하고 있습니다. \n<image1>: 이미지에는 유리문이나 창문 앞에 서 있는 사람이 "BOB TOUR"라고 적힌 원형 표지판을 들고 있는 모습이 담겨 있습니다. \n<image2>: 이미지에는 트렁크를 열고 미니밴 옆 주차장에 서 있는 사람이 표시되어 있습니다. \n<image3>: 이미지는 고요한 야외 수영장 구역을 묘사하고 있습니다. \n<image4>: 이미지는 식사나 뷔페를 위한 다양한 요리가 담긴 테이블 세트를 묘사하고 있습니다. \n<image5>: 이 이미지는 수중에서 스쿠버 다이버로 추정되는 두 마리의 개체가 산호초를 탐험하는 모습을 보여줍니다. \n<image6>: 이미지에는 스쿠버 다이버로 추정되는 세 명의 개인이 물속에서 사진 촬영을 위해 포즈를 취하고 있는 모습이 담겨 있습니다. \n<image7>: 이미지는 고요하고 조명이 밝은 마사지 룸을 묘사하고 있습니다. \n<image8>: 이 이미지는 역사적 기념물이나 고대 건물의 일부일 가능성이 높은 오래된 풍화 구조물을 묘사하고 있습니다. \n<image9>: 이미지는 한국의 인기 주류인 진로 소주 작은 잔을 들고 있는 손을 클로즈업한 모습을 보여줍니다. \n<image10>: 그 이미지는 고요하고 그림 같은 장면을 묘사하고 있으며, 푸른 플랫폼이나 부두에 앉아 있는 사람이 고요하고 푸른 물의 광활한 범위로 뻗어 있습니다. \n<image11>: 이미지에는 여섯 명의 사람들이 물속에서 보트에 앉아 있는 모습이 담겨 있습니다. \n<image12>: 이미지는 바다나 바다일 가능성이 높은 맑고 청록색의 수역을 묘사하고 있습니다. \n<image13>: 이미지는 맑고 청록색의 물에서 헤엄치는 많은 물고기 무리와 함께 활기찬 수중 장면을 묘사합니다. \n<image14>: 이미지는 격자 패턴으로 배열된 여러 도시락 상자가 있는 테이블을 보여줍니다. \n<image15>: 이미지는 망고 반쪽 두 개를 들고 있는 두 손의 클로즈업을 보여줍니다. \n<image16>: 이미지는 낚시 활동에 참여하는 사람의 손을 클로즈업한 모습을 보여줍니다. \n<image17>: 이미지는 지붕에 매달린 여러 개의 구형 조명에 의해 조명되는 밤의 초가 지붕 구조를 묘사합니다. \n<image18>: 이미지에는 아시아 요리 레스토랑에서 온 것으로 보이는 다양한 요리로 가득 찬 테이블이 표시되어 있습니다. \n<image19>: 이미지는 교회 또는 유사한 종교 건물의 내부를 묘사합니다. \n<image20>: 이미지는 풍화된 돌담에 설치된 역사적 명판을 보여줍니다. \n<image21>: 이미지는 스테이크일 가능성이 높은 큰 구운 고기 조각이 슬라이스되고 있는 나무 도마를 묘사하고 있습니다. \n<image22>: 이미지에는 조비 바나나 칩 봉지를 들고 있는 손이 표시되어 있습니다. \n<image23>: 이미지에는 7D 말린 망고 패키지를 들고 있는 손이 표시되어 있습니다. \n<image24>: 그 이미지는 돌이나 콘크리트로 만들어진 큰 손 모양의 구조를 묘사하고 있습니다. \n<image25>: 이미지에는 레스토랑에서 가져온 다양한 요리가 담긴 테이블 세트가 표시되어 있습니다. \n<image26>: 이 이미지는 육각형 패턴의 포장도로가 있는 개방된 야외 공간의 야간 장면을 묘사하고 있습니다. \n<image27>: 이미지는 높은 위치에서 바라본 야간 도시 풍경을 묘사합니다. \n<image28>: 이미지는 다양한 식물과 구조물이 있는 야외 정원을 묘사하고 있습니다. \n<image29>: 이미지에는 여러 여행 문서가 클로즈업되어 있는 모습이 표시됩니다. \n<image30>: 그 이미지는 가격표를 한국어로 표시한 태블릿 스크린샷입니다. \n<image31>: 이미지는 한국어 광고 또는 정보 페이지가 표시된 태블릿의 스크린샷으로 보입니다'}]

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

if __name__ == "__main__":
    get_demo()
