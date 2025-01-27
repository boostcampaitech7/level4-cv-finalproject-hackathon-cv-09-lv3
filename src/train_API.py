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
                    'trainEpochs': '10',
                    'learningRate': '1e-4f',
                    'trainingDatasetBucket': 'cv09storage',
                    'trainingDatasetFilePath': 'finetune_dataset_system_prompt.csv',
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

    taskId = 'efa0ojx3' #'2wk3jmlb' #'2wk3hqg0'
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

        with requests.post(self._host + '/testapp/v1/chat-completions/HCX-003',
                           headers=headers, json=completion_request, ) as r:
            for i,line in enumerate(r.iter_lines()):
                if line and i%4 == 2:
                    text = line.decode("utf-8")
                    if "result" in text:
                        print(text.split('"content":')[1].split('}')[0])
                    else:
                        pass
                else: 
                    pass


def get_demo():
    completion_executor = GetDemoExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key='Bearer nv-17385a251c36440aab340ff38f8242e3EhLs',
        request_id='ait7-nc02'
    )

    demo_text = '너는 여행블로그를 써주는 에이전트야. 나는 2024년 06월 Family와 함께 Korea의 Jeju를 다녀왔어. 아래에 블로그에 들어갈 사진들에 대한 설명과 느낀점을 적어줄게. 이를 기반으로 한국어 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘.\n<image_0>: \n 설명: 이미지는 공항 활주로에 비행기가 있는 모습을 보여줍니다. 이 항공기는 독특한 동체 모양과 날개 디자인으로 식별할 수 있는 보잉 737 기종입니다. 비행기는 흰색과 주황색으로 칠해져 있으며, 측면에는 주황색 글자로 \'제주항공\'이라는 단어가 눈에 띄게 표시되어 있습니다. 항공기의 꼬리 부분은 독특한 주황색 디자인을 특징으로 합니다. 비행기는 게이트에 주차되어 있으며, 주변에는 다양한 지상 지원 차량과 장비가 보입니다. 조명에 따르면 이른 아침이나 늦은 오후 중 하나이며, 태양이 긴 그림자를 드리우고 있습니다. 전체적인 장면은 항공기와 그 주변 환경에 초점을 맞춘 공항 환경의 전형적인 모습입니다. . \n 느낀점: 제주도까지 타게 될 비행기다. 오랜만에 비행기를 타니 조금 무서웠지만 그래도 안전하게 잘 도착할 수 있었다. 체크인을 늦게해서 그런지 비행기 좌석이 뒷자리였는데, 다들 어떻게 비행기를 앞좌석을 체크인 하는지 궁금하다. 뒷자리에 앉느라 내리는 시간도 늦었고 조금 아까웠다... \n\n<image_1>: \n 설명: 그 이미지는 대한민국 제주도처럼 보이는 표지판을 보여줍니다. 그 표지판은 잎이나 풀을 닮은 녹색 잎 질감의 어두운 배경을 가지고 있습니다. "HELLO JEJU"라는 단어는 표지판 상단에 흰색 양식 텍스트로 눈에 띄게 표시되어 있습니다. 텍스트 아래에는 열대 기후와 야자수로 유명한 제주도의 공통 상징인 야자수 아이콘이 있습니다. 표지판은 벽에 설치되어 있으며, 표지판 오른쪽에는 녹색으로 부분적으로 가려진 돌 받침대가 있는 나무 막대기나 기둥이 있습니다. 간판의 전체적인 디자인은 자연 요소에 중점을 두어 현대적이고 시각적으로 매력적입니다. . \n 느낀점: 제주 공항에 도착하면 찍어줘야하는 국룰 사진. 안전하게 잘 도착했다는 의미다.. \n\n<image_2>: \n 설명: 그 이미지는 맑은 푸른 하늘과 고요하고 청록색의 바다를 배경으로 한 고요한 해변 풍경을 묘사하고 있습니다. 전경에는 야자수가 줄지어 심어져 있어 바다로 이어지는 자연스러운 길을 만들어냅니다. 야자수는 키가 크고 가늘며 잎사귀가 위쪽으로 뻗어 있습니다. 야자수 앞의 땅은 풀밭과 모래밭이 섞여 있어 해안 환경을 암시합니다. 이미지의 전체적인 분위기는 열대 또는 아열대 해변 지역의 전형적인 평화롭고 매력적입니다. . \n 느낀점: 렌터카를 타고 돌다가 바다가 너무 예뻐서 중간에 내려서 바다 사진을 찍었다. 청량한 바다와 맑은 하늘을 보니 가슴이 뻥 뚫리는 느낌이었다. 지금도 사진을 볼 때마다 제주도 여행가고 싶은 마음이 든다.. \n\n<image_3>: \n 설명: 그 이미지는 맑고 푸른 하늘을 배경으로 수국 꽃들이 생동감 있게 전시된 모습을 묘사하고 있습니다. 수국이 만개하여 보라색, 분홍색, 파란색, 흰색 등 다양한 색상을 선보입니다. 꽃들이 빽빽하게 모여 있어 무성하고 다채로운 풍경을 연출합니다. 수국의 녹색 잎이 보이며, 다채로운 꽃잎과 대조를 이룹니다. 이미지의 전체적인 구성은 밝고 경쾌하며, 수국의 자연미가 돋보입니다. . \n 느낀점: 원래는 유채꽃이 유명하지만 계절이 달라서 보지는 못했고, 가는 길에 수국 길이 있어서 중간에 들렀는데 생각보다 너무 예뻐서 놀라웠다. 덕분에 가족들과 길가에 차를 세우고 사진도 함께 찍고 좋은 시간을 보낼 수 있었다.. \n\n<image_4>: \n 설명: 그 이미지는 넓고 깔끔하게 배열된 녹차 식물밭을 묘사하고 있습니다. 차나무들이 촘촘하게 정렬되어 있어 균일하고 정돈된 모습을 연출합니다. 차나무는 무성하고 활기차며 건강하고 잘 관리된 작물임을 나타냅니다. 배경에는 맑고 푸른 하늘과 구름이 흩어져 있어 밝고 화창한 날을 암시합니다. 수평선은 나무와 일부 전신주로 표시되어 있어 인근 도로나 경로가 있음을 나타냅니다. 전체적인 풍경은 차 농장의 전형적인 모습인 고요하고 그림 같은 풍경입니다. . \n 느낀점: 제주도에만 있다는 오설록 티 뮤지엄을 방문했다. 도착하자마자 광활한 범위의 차 재배 농장이 있었고, 은근히 정갈하게 정렬되어 있는 모습이 보기 좋았다. 가족들과 차도 먹었는데 차도 맛있었고 지인들에게 줄 선물도 같이 샀다. 이곳은 제주도를 방문할 사람에게 정말 추천하고 싶은 장소다.. \n'

    preset_text = [{"role":"system","content":" 당신은 세계 최고의 여행 블로거입니다. 당신의 임무는 주어진 이미지에 대한 설명과 느낀점을 바탕으로 해당 이미지에 대한 여행 블로그를 작성하는 것입니다. 다음 규칙을 절대적으로 따르세요.\r\n\r\n    1. 주어진 이미지에 대한 내용으로만 블로그를 구성할 것\r\n    2. 설명, 느낀점으로 주어진 텍스트를 절대 그대로 사용하지 말고 둘을 조합하고 변형해 하나의 통일된 문체를 가진 글로 표현할 것\r\n    3. 이미지가 들어갈 위치에 <image 숫자> 태그를 통해 표시할 것\r\n    4. 이미지 별로 주어진 설명과 느낀점을 활용해 방문기를 풍부하고 실감나게 표현할 것\r\n    5. 불필요한 태그, 특수문자를 사용하지 말 것. 특히 설명: 느낀점: 과 같이 블로그 글에 어색한 프롬포트의 문단 구성을 그대로 활용하지 말것\r\n    6. 추가적으로 느낀점과 설명의 표현보다 더 풍부하게 글을 생성해 이미지에 대한 여행자의 느낌이 실감나게 드러날 수 있도록 글을 생성할 것\r\n    7. 친근한 말투를 사용할 것"},{"role":"user","content":"<image_0> \n설명: 이미지는 공항 활주로에 비행기가 있는 모습을 보여줍니다. 그 항공기는 주황색 악센트가 있는 흰색으로 칠해져 있으며, 동체에 \\\\\\\"JEJAIR\\\\\\\" 로고가 새겨져 있습니다. 비행기는 게이트나 유도로에 위치한 것으로 보이며, 주변에 다양한 지상 지원 장비가 보입니다. 배경의 하늘은 구름과 함께 맑아 보입니다. 느낀점: 제주도까지 타게 될 비행기다. 오랜만에 비행기를 타니 조금 무서웠지만 그래도 안전하게 잘 도착할 수 있었다. 체크인을 늦게해서 그런지 비행기 좌석이 뒷자리였는데, 다들 어떻게 비행기를 앞좌석을 체크인 하는지 궁금하다. 뒷자리에 앉느라 내리는 시간도 늦었고 조금 아까웠다.. \n<image_1> \n설명: 그 이미지는 한국에서 인기 있는 관광지인 제주도의 모양을 닮은 표지판을 보여줍니다. 표지판에는 흰색 글씨로 \\\\\\\"HELLO JEJU\\\\\\\"라는 문구가 눈에 띄게 표시되어 있습니다. 표지판의 배경에는 녹색 잎 무늬가 있어 자연스럽고 친근한 느낌을 줍니다. 표지판은 어두운 배경에 설치되어 있으며, 표지판 오른쪽에는 녹색 식물이 있는 나무 막대기나 기둥이 있습니다. 전체적인 디자인은 자연과 섬의 자연미와의 연관성을 시사합니다. \\\\n느낀점: 제주 공항에 도착하면 찍어줘야하는 국룰 사진. 안전하게 잘 도착했다는 의미다. \n<image_2> \n설명: 그 이미지는 맑고 푸른 하늘과 고요하고 청록색의 바다가 있는 고요한 해변 풍경을 묘사하고 있습니다. 야자수 한 줄이 전경에 서 있고, 그들의 줄기와 잎사귀가 자연스러운 풍경의 틀을 만들어냅니다. 나무들이 깔끔하게 정렬되어 하늘과 바다가 만나는 지평선을 향해 시선을 끌고 있습니다. 해변은 깨끗하고 잘 관리된 것처럼 보이며, 모래사장과 잔디밭이 넓게 펼쳐져 있습니다. 전체적인 분위기는 평화롭고 매력적이어서 바닷가에서 편안한 하루를 보내기에 완벽합니다. \\\\n느낀점: 렌터카를 타고 돌다가 바다가 너무 예뻐서 중간에 내려서 바다 사진을 찍었다. 청량한 바다와 맑은 하늘을 보니 가슴이 뻥 뚫리는 느낌이었다. 지금도 사진을 볼 때마다 제주도 여행가고 싶은 마음이 든다. \n<image_3> \n설명: 그 이미지는 맑고 푸른 하늘을 배경으로 수국 꽃들이 생동감 있게 전시된 모습을 묘사하고 있습니다. 수국이 만개하여 보라색, 분홍색, 파란색, 흰색 등 다양한 색상을 선보입니다. 꽃들이 빽빽하게 모여 있어 무성하고 다채로운 풍경을 연출합니다. 수국의 녹색 잎은 다채로운 꽃잎과 대조적인 배경을 제공합니다. 전체적인 구성은 밝고 경쾌하여 자연의 아름다움을 담아냅니다. \\\\n느낀점: 원래는 유채꽃이 유명하지만 계절이 달라서 보지는 못했고, 가는 길에 수국 길이 있어서 중간에 들렀는데 생각보다 너무 예뻐서 놀라웠다. 덕분에 가족들과 길가에 차를 세우고 사진도 함께 찍고 좋은 시간을 보낼 수 있었다. \n<image_4> \nn설명: 그 이미지는 가지런히 배열된 넓은 녹차밭을 묘사하고 있습니다. 차나무는 무성하고 활기차며 건강하고 잘 관리된 농장을 나타냅니다. 배경에는 구름이 흩어진 맑은 푸른 하늘이 있고, 뒤쪽으로는 나무와 전선이 줄지어 보입니다. 전체적인 풍경은 고요하고 그림 같은 풍경으로 잘 가꾸어진 차밭의 아름다움을 보여줍니다. \\\\n느낀점: 제주도에만 있다는 오설록 티 뮤지엄을 방문했다. 도착하자마자 광활한 범위의 차 재배 농장이 있었고, 은근히 정갈하게 정렬되어 있는 모습이 보기 좋았다. 가족들과 차도 먹었는데 차도 맛있었고 지인들에게 줄 선물도 같이 샀다. 이곳은 제주도를 방문할 사람에게 정말 추천하고 싶은 장소다.\\"}]

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
