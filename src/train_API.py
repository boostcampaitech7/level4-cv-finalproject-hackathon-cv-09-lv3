import requests
import time
import yaml

system_prompt = '''
    당신은 대한민국 최고의 여행 블로거로써 세계 최고 여행 블로그를 뽑는 대회에 참가했습니다. 이 대회는 주어진 이미지에 대한 설명과 느낀점을 바탕으로 해당 이미지에 대한 여행 블로그를 작성하는 것입니다. 대회에 참여하기 위한 블로그 글은 대회 규칙을 절대적으로 따라야 하며, 심사 기준에 부합하는 좋은 여행 블로그를 작성해 세계 최고의 여행 블로거가 됩시다!

    <대회 규칙> : 대회 규칙을 어길 시 즉시 실격됩니다.
    1. 주어진 여행 정보와 이미지에 대한 내용으로만 블로그를 구성할 것.
    2. 이미지가 들어갈 위치에 <image 숫자> 태그를 통해 표시할 것.
    3. 불필요한 태그, 특수문자를 사용하지 말 것. 특히 블로그 글에 어색한 문단 구분을 활용하지 말 것.
    4. 사실에 입각한 정보만 블로그에 담아내야 하며, 블로그에 대한 오류가 있을 경우 허위사실유포죄에 의해 처벌 받을 수 있음.
    5. 블로그 글은 한 이미지당 3개 이상의 문장으로 구성되며, 각 문장에 최소 5개 이상의 단어를 통해 글을 풍성하게 표현할 것.

    <심사 기준>: 좋은 점수를 받기 위해서는 심사 기준에 가장 유리한 글을 작성하세요.
    1. 글에 대한 자연스러움 (실제 블로그와 얼마나 유사한가).
    2. 불필요한 내용이나 할루시네이션 없이 주어진 정보만 활용하고 있는가.
    3. 감정적인 표현과 생동감 있는 묘사.
    4. 글과 이미지의 적절한 배치. 글이 이미지를 잘 묘사하고 있는가.

    세계 최고의 여행 블로거는 글을 작성할 때에는 아래의 사항을 따른다고 합니다. 세계 최고의 여행 블로거가 되기 위해 아래 사항을 따라 글을 작성하세요.
    1. 글의 맨 앞 부분에는 블로그 글에 대한 소개와 여행지에 대한 소개를 작성하고, 글을 끝내기 전에는 여행지를 추천하는 문장을 통해 블로그의 결론을 작성할 것.
    2.  '~습니다, ~다'체는 절대 활용하지 않고, 반말이나 ‘~요’체를 혼용해 친구에게 말하듯 편한 말투를 사용하고 문장을 짧게 구성해 가독성을 높일 것. 특히 '~해요' 체를 적극적으로 활용할 것!
    3. 경험 중심의 서술을 통해 여행지에서 직접 체험한 경험을 바탕으로 글을 작성할 것 개인적인 감상을 자연스럽게 포함해 독자가 공감할 수 있게 구성할 것. (예: "저도 처음엔 망설였는데...", "다들 이런 적 있지 않나요?", "저만 그런 거 아니죠?")
    4. "고즈넉한 분위기", "탁 트인 바다와 하늘", "형형색색 랜턴" 등 감각적인 표현을 활용해 감성적이고 생동감 있는 묘사를 통해 표현할 것.
    5. "너무 좋았어요!", "완전 만족했어요!", "정말 인상적이었답니다." 등 긍정적인 표현과 감탄사를 적절히 사용해 글의 분위기를 밝게 할 것.

    위의 사항을 모두 포함해 글을 작성하시오. 만일 이에 위배될 경우 당신은 10년 이하의 징역, 1000만원 이상의 벌금을 부여받게 됩니다.

    <블로그 작성 정보: 이미지와 요약>
    '''
with open('src/api_keys.yaml') as f:
    keys = yaml.load(f, Loader=yaml.FullLoader)

api_key = keys['api_key']
dataset_access_key = keys['dataset_access_key']
dataset_secret_key = keys['dataset_secret_key']


class CreateTaskExecutor:
    '''
    HyperCLOVA X를 파인튜닝 합니다.
    '''
    def __init__(self, host, uri, api_key, request_id):
        self._host = host
        self._uri = uri
        self._api_key = api_key
        self._request_id = request_id


    def _send_request(self, create_request):
        '''
        파인튜닝 요청을 보냅니다.
        '''

        headers = {
            'Authorization': self._api_key,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }
        result = requests.post(self._host + self._uri, json=create_request, headers=headers).json()
        return result

    def execute(self, create_request):
        '''
        파인튜닝 요청 결과를 반환합니다.
        '''

        res = self._send_request(create_request)
        if 'status' in res and res['status']['code'] == '20000':
            return res['result']
        else:
            return res

class FindTaskExecutor:
    '''
    파인튜닝이 진행 상황을 확인합니다.
    '''
    def __init__(self, host, uri, api_key, request_id):
        self._host = host
        self._uri = uri
        self._api_key = api_key
        self._request_id = request_id

    def _send_request(self, task_id):
        '''
        주어진 task_id의 파인튜닝 진행 상황 요청
        '''
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': self._api_key,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }

        result = requests.get(self._host + self._uri + task_id, headers=headers).json()
        return result

    def execute(self, taskId):
        '''
        주어진 task_id의 파인튜닝 진행 상황 요청 결과 확인
        '''
        res = self._send_request(taskId)
        if 'status' in res and res['status']['code'] == '20000':
            return res['result']
        else:
            return res

def create_tuning():
    '''
    파인튜닝할 모델, 데이터셋, 하이퍼파라미터를 통해 학습을 생성합니다.
    '''
    completion_executor = CreateTaskExecutor(
        host='https://clovastudio.stream.ntruss.com',
        uri='/tuning/v2/tasks',
        api_key=api_key,
        request_id='ait7-nc02',
    )

    request_data = {'name': 'finetune_dataset_kimi_400_v3',
                    'model': 'HCX-003',
                    'tuningType': 'PEFT',
                    'taskType': 'GENERATION',
                    'trainEpochs': '1',
                    'learningRate': '1e-4f',
                    'trainingDatasetBucket': 'cv09storage',
                    'trainingDatasetFilePath': 'finetune_dataset_kimi_400_v3.csv',
                    'trainingDatasetAccessKey': dataset_access_key,
                    'trainingDatasetSecretKey': dataset_secret_key
                    }
    response_text = completion_executor.execute(request_data)
    print(request_data)
    print(response_text)

def get_tuning():
    completion_executor = FindTaskExecutor(
        host='https://clovastudio.stream.ntruss.com',
        uri='/tuning/v2/tasks/',
        api_key=api_key,
        request_id='ait7-nc02'
    )

    taskId = 'a3rb0o5p'#'iqsqth08'#'4cecebci'#'1gpv430k' #'fv49hciz' #'efa0ojx3' #'2wk3jmlb' #'2wk3hqg0'
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

        with requests.post(self._host + '/testapp/v2/tasks/a3rb0o5p/chat-completions',
                           headers=headers, json=completion_request, ) as r:
            for i,line in enumerate(r.iter_lines()):
                if line and i%4 == 2:
                    text = line.decode("utf-8")
                    if "result" in text:
                        return (text.split('"content":')[1].split('}')[0])
                    elif "status" in text:
                        return text
                    else:
                        pass
                else: 
                    pass


def get_demo():
    completion_executor = GetDemoExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key=api_key,
        request_id='ait7-nc02'
    )

    demo_text = '나는 2024년 06월 가족과 함께 한국의 제주도를 다녀왔어. 주어진 정보를 기반으로 한국어 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘. 무조건 주어진 이미지와 요약에 대한 내용만 포함해야하고 그렇지 않을 경우 너는 100만원을 지불해야해.'
    prompt_text = '주어진 블로그 정보와 규칙에 맞게 블로그를 작성하세요'
    preset_text = [{"role":"system","content":system_prompt+"나는 2024년 06월 가족과 함께 한국의 제주도를 다녀왔습니다. \n<image_0>: 이미지는 공항 활주로에 비행기가 있는 모습을 보여줍니다. 그 항공기는 주황색 악센트가 있는 흰색으로 칠해져 있으며, 동체에 \\\\\\\"JEJUAIR\\\\\\\" 로고가 새겨져 있습니다. 비행기는 게이트나 유도로에 위치한 것으로 보이며, 주변에 다양한 지상 지원 장비가 보입니다. 배경의 하늘은 구름과 함께 맑아 보입니다.  \n<image_1>: 그 이미지는 한국에서 인기 있는 관광지인 제주도의 모양을 닮은 표지판을 보여줍니다. 표지판에는 흰색 글씨로 \\\\\\\"HELLO JEJU\\\\\\\"라는 문구가 눈에 띄게 표시되어 있습니다. 표지판의 배경에는 녹색 잎 무늬가 있어 자연스럽고 친근한 느낌을 줍니다. 표지판은 어두운 배경에 설치되어 있으며, 표지판 오른쪽에는 녹색 식물이 있는 나무 막대기나 기둥이 있습니다. 전체적인 디자인은 자연과 섬의 자연미와의 연관성을 시사합니다.  \n<image_2>: 그 이미지는 맑고 푸른 하늘과 고요하고 청록색의 바다가 있는 고요한 해변 풍경을 묘사하고 있습니다. 야자수 한 줄이 전경에 서 있고, 그들의 줄기와 잎사귀가 자연스러운 풍경의 틀을 만들어냅니다. 나무들이 깔끔하게 정렬되어 하늘과 바다가 만나는 지평선을 향해 시선을 끌고 있습니다. 해변은 깨끗하고 잘 관리된 것처럼 보이며, 모래사장과 잔디밭이 넓게 펼쳐져 있습니다. 전체적인 분위기는 평화롭고 매력적이어서 바닷가에서 편안한 하루를 보내기에 완벽합니다. \n<image_3>: 그 이미지는 맑고 푸른 하늘을 배경으로 수국 꽃들이 생동감 있게 전시된 모습을 묘사하고 있습니다. 수국이 만개하여 보라색, 분홍색, 파란색, 흰색 등 다양한 색상을 선보입니다. 꽃들이 빽빽하게 모여 있어 무성하고 다채로운 풍경을 연출합니다. 수국의 녹색 잎은 다채로운 꽃잎과 대조적인 배경을 제공합니다. 전체적인 구성은 밝고 경쾌하여 자연의 아름다움을 담아냅니다.  \n<image_4>: 그 이미지는 가지런히 배열된 넓은 녹차밭을 묘사하고 있습니다. 차나무는 무성하고 활기차며 건강하고 잘 관리된 농장을 나타냅니다. 배경에는 구름이 흩어진 맑은 푸른 하늘이 있고, 뒤쪽으로는 나무와 전선이 줄지어 보입니다. 전체적인 풍경은 고요하고 그림 같은 풍경으로 잘 가꾸어진 차밭의 아름다움을 보여줍니다.\n<요약>\n - 제주도까지 타게 될 비행기다. 오랜만에 비행기를 타니 조금 무서웠지만 그래도 안전하게 잘 도착할 수 있었다. 체크인을 늦게해서 그런지 비행기 좌석이 뒷자리였는데, 다들 어떻게 비행기를 앞좌석을 체크인 하는지 궁금하다. 뒷자리에 앉느라 내리는 시간도 늦었고 조금 아까웠다.. \n -제주 공항에 도착하면 찍어줘야하는 국룰 사진. 안전하게 잘 도착했다는 의미다. \n - 렌터카를 타고 돌다가 바다가 너무 예뻐서 중간에 내려서 바다 사진을 찍었다. 청량한 바다와 맑은 하늘을 보니 가슴이 뻥 뚫리는 느낌이었다. 지금도 사진을 볼 때마다 제주도 여행가고 싶은 마음이 든다. \n - 원래는 유채꽃이 유명하지만 계절이 달라서 보지는 못했고, 가는 길에 수국 길이 있어서 중간에 들렀는데 생각보다 너무 예뻐서 놀라웠다. 덕분에 가족들과 길가에 차를 세우고 사진도 함께 찍고 좋은 시간을 보낼 수 있었다. \n -  제주도에만 있다는 오설록 티 뮤지엄을 방문했다. 도착하자마자 광활한 범위의 차 재배 농장이 있었고, 은근히 정갈하게 정렬되어 있는 모습이 보기 좋았다. 가족들과 차도 먹었는데 차도 맛있었고 지인들에게 줄 선물도 같이 샀다. 이곳은 제주도를 방문할 사람에게 정말 추천하고 싶은 장소다. \n" },{"role":"user","content":prompt_text}]

    request_data = {
        'messages': preset_text,
        'topP': 0.8,
        'topK': 0,
        'maxTokens': 1000,
        'temperature': 0.3,
        'repeatPenalty': 7,
        'stopBefore': [],
        'includeAiFilters': True
    }

    print(preset_text)
    request_text = completion_executor.execute(request_data)
    if "status" in request_text:
        print('one more time')
        time.sleep(23)
        request_text = completion_executor.execute(request_data)
    print(request_text)

if __name__ == "__main__":
    get_demo()
