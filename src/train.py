import requests
import datetime
import hmac
import hashlib
import base64


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

    taskId = 'stoezxa7'
    response_text = completion_executor.execute(taskId)
    print(taskId)
    print(response_text)

def get_demo():
    # API URL
    url = "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003"

    # Headers
    headers = {
        "Authorization": "Bearer nv-17385a251c36440aab340ff38f8242e3EhLs",  # Replace with your actual API Key
        "X-NCP-CLOVASTUDIO-REQUEST-ID": "ait7-nc02",  # Replace with your Request ID
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    # Payload
    data = {
        "topK": 0,
        "includeAiFilters": True,
        "maxTokens": 2048,
        "temperature": 0.5,
        "messages": [
            {"role": "system", "content": "test"},
            {"role": "user", "content": '너는 여행블로그를 써주는 에이전트야. 아래에 블로그에 들어갈 사진들에 대한 설명과 블로그 요약을 줄게. 한국어로 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘. \n<image0>: 이 이미지는 사원이나 신사로 이어지는 계단을 묘사하고 있습니다. \n<image1>: 이 이미지는 동남아시아 문화권에서 흔히 볼 수 있는 신화 속 생물인 나가로 추정되는 머리가 많은 뱀의 크고 화려한 동상을 묘사하고 있습니다. \n<image2>: 그 이미지는 명상적인 자세로 앉아 있는 황금 불상을 묘사하고 있습니다. 이는 부처님의 깨달음을 목격하기 위한 땅의 손길을 의미하는 "부미스파르샤 무드라"로 알려져 있습니다. \n<image3>: 이미지는 복잡한 조각이 있는 크고 오래된 석조 구조물의 클로즈업 뷰를 보여줍니다. \n<image4>: 그 이미지는 세 개의 큰 황금 불상이 있는 고요한 야외 장면을 묘사하고 있습니다. \n<image5>: 그 이미지는 전통적인 태국 신사나 사찰 장면을 묘사하고 있습니다. \n<image6>: 그 이미지는 빨간색과 금색 받침대 위에 서 있는 커다란 황금 불상을 묘사하고 있습니다. \n<image7>: 이 이미지는 사찰 또는 유사한 영적 배경 내에 있는 실내 종교 사원이나 제단을 묘사하고 있습니다. \n<image8>: 그 이미지는 명상적인 자세로 앉아 있는 커다란 황금 불상을 묘사하고 있습니다. \n<image9>: 그 이미지는 불교 사원의 한 장면을 묘사하고 있습니다. \n<image10>: 이 이미지는 건축 양식과 문화적 요소를 고려할 때 태국에 있는 것으로 추정되는 사찰이나 종교 유적지의 한 장면을 묘사하고 있습니다. \n<image11>: 그 이미지는 두 손을 무릎 위에 얹은 채 명상적인 자세로 앉아 있는 큰 황금 불상을 묘사하고 있습니다. \n<image12>: 이 이미지는 사찰이나 종교 유적지의 한 장면을 묘사하고 있습니다. \n<image13>: 그 이미지는 현대적이고 전통적인 건축 양식이 혼합된 도시 경관의 경치를 묘사하고 있습니다. \n<image14>: 그 이미지는 승려가 콘크리트 길을 걷는 고요한 야외 장면을 묘사하고 있습니다. \n<image15>: 이미지에는 금속 표면에 세 개의 작은 금속 그릇이 놓여 있는 모습이 담겨 있습니다. \n<image16>: 이 이미지는 태국 전통 사찰의 한 장면을 묘사하고 있습니다. \n<image17>: 이미지는 연꽃 모양의 다채로운 떠다니는 양초 컬렉션을 보여줍니다. \n<image18>: 그 이미지는 두 손을 무릎 위에 얹은 채 명상적인 자세로 앉아 있는 큰 황금 불상을 묘사하고 있습니다. \n<image19>: 그 이미지는 두 손을 무릎 위에 얹은 채 명상적인 자세로 앉아 있는 큰 황금 불상을 묘사하고 있습니다. \n<image20>: 그 이미지는 두 손을 무릎 위에 얹은 채 명상적인 자세로 앉아 있는 큰 황금 불상을 묘사하고 있습니다. \n<image21>: 그 이미지는 명상적인 자세로 앉아 있는 큰 황금 불상을 묘사하고 있습니다. \n<image22>: 그 이미지는 불교 사원에서 온 듯한 고요하고 문화적으로 풍부한 장면을 묘사하고 있습니다. \n<image23>: 그 이미지는 야외에 서 있는 커다란 황금 불상을 묘사하고 있습니다. \n<image24>: 이미지는 주로 지폐와 장식 요소에 초점을 맞춘 다양한 품목의 화려하고 정교한 배열을 묘사합니다. \n<image25>: 그 이미지는 독특한 건축 양식을 가진 태국 전통 사찰 구조를 묘사하고 있습니다. \n<image26>: 그 이미지는 시장 지역으로 보이는 번화한 거리 풍경을 묘사하고 있습니다. \n<image27>: 이미지는 일몰 동안 고요한 해변 장면을 묘사합니다'}
        ],
        "stopBefore": [],
        "repeatPenalty": 5.0,
        "topP": 0.8,
    }

    # POST Request
    response = requests.post(url, headers=headers, json=data)

    # Response Handling
    if response.status_code == 200:
        print("Response:")
        print(response.text)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    get_demo()
