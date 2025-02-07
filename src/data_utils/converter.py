# 튜닝 안된 친굽로 바꾸는 방법
import requests
import yaml

with open('src/api_keys.yaml') as f:
    keys = yaml.load(f,Loader = yaml.FullLoader)
api_key = keys['api_key']

class ConvertStyleExecutor:
    def __init__(self, host, api_key, request_id):
        self._host = host
        self._api_key = api_key
        self._request_id = request_id

    def execute(self, completion_request):
        headers = {
            "Authorization": api_key,
            "X-NCP-CLOVASTUDIO-REQUEST-ID": "ait7-nc02",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }

        answer = ""
        with requests.post(self._host + '/testapp/v1/chat-completions/HCX-003',
                           headers=headers, json=completion_request, ) as r:
            for i,line in enumerate(r.iter_lines()):
                if line and i%4 == 2:
                    text = line.decode("utf-8")
                    if "result" in text:
                        answer += text.split('"content":')[1].split('}')[0].strip('"')
        return answer


def convert_style(user_prompt, text):
    completion_executor = ConvertStyleExecutor(
        host='https://clovastudio.stream.ntruss.com',
        api_key=api_key,
        request_id='ait7-nc02'
    )

    tags = []
    inputs = []
    texts = []
    text_split = text.split('\n')
    if len(text_split) == 1:
        text_split = text.split('\\n')
    
    for split in text_split:
        if (".jpg" in split) and (".png" in split):
            inputs.append(''.join(texts))
            tags.append(split)
            texts = []
            continue
        else:
            texts.append(split)

    inputs.append(''.join(texts))
    tags.append('')
    if len(inputs) != len(tags):
        raise AssertionError(f'Length is different! : inputs:{len(inputs)}, tags:{len(tags)}')
    answers = []    
    for input_text,t in zip(inputs,tags):
        print(input_text)
        if len(input_text)<10:
            continue
        else:
            preset_text = [{"role":"system","content":f"너는 블로그 글의 문체를 바꿔주는 에이전트야. 위는 LLM으로 생성된 블로그 글의 초본이야.{user_prompt}"},{"role":"user","content":f"{input_text}"}]

            request_data = {
                'messages': preset_text,    
                'topP': 0.8,
                'topK': 0,
                'maxTokens': 2048,
                'temperature': 0.3,
                'repeatPenalty': 5,
                'stopBefore': [],
                'includeAiFilters': True
            }
            answer = completion_executor.execute(request_data)
            print(answer)
            answers.append(answer)
            answers.append(t)
    
    results = '/n'.join(answers)
    
    return results

if __name__ == "__main__":
    # 테스트용 예시
    sample_prompt = "친근한 말투로 바꿔줘"  
    sample_text = "<image_0>\n\n제주도로 떠나는 날! 내가 탈 비행기는 주황색 악센트가 있는 흰색이었고, 'JEJAIR'이라는 로고가 새겨져 있었다. 이 비행기를 타고 무사히 제주도에 도착하길 바라며 탑승했다. 비록 체크인을 늦게 해서 뒷좌석에 앉았지만, 다행히 날씨가 좋아서 창 밖으로 보이는 경치를 즐길 수 있었다.\n<image_1>\n\n드디어 제주공항에 도착! 내리자마자 바로 \"HELLO JEJU\"라고 쓰인 표지판부터 찾았다. 많은 사람들이 여기서 사진을 찍길래 나도 따라 찍었는데, 역시 명소답게 예쁘게 나왔다. 이제 본격적으로 제주도 여행을 시작해야겠다!\n<image_2>\n\n렌터카를 빌려서 해안 도로를 달리던 중, 너무나 아름다운 해변을 발견했다. 파란 하늘과 초록빛 바다, 그리고 야자수가 어우러져 마치 해외에 온 듯한 느낌이었다. 당장이라도 물에 뛰어들고 싶었지만, 우선은 카메라에 멋진 풍경을 담는 게 먼저였다. 나중에 다시 오면 꼭 수영도 해봐야지!\n<image_3>\n\n원래는 유채꽃을 보러 가려 했지만, 시기가 맞지 않아 대신 수국길을 찾았다. 형형색색의 수국들이 한데 모여 있으니 더욱 예뻤다. 마침 날씨도 좋아서 찍는 사진마다 인생샷이 나왔다. 이렇게 예쁜 꽃들을 보고 있으니 저절로 힐링이 되는 기분이었다.\n<image_4>\\n\\n마지막으로 향한 곳은 오설록 티 뮤지엄이다. 드넓게 펼쳐진 녹차밭을 보니 입이 떡 벌어졌다. 가지런하게 정돈된 차나무들은 푸릇푸릇하니 생기가 넘쳤다. 전망대에 올라가 내려다보니 그야말로 장관이었다. 직접 딴 찻잎으로 만든 차를 마시며 여유로운 시간을 보냈는데, 이것이야말로 진정한 휴식이 아닐까 싶었다. 이번 제주도 여행은 잊지 못할 추억으로 남을 것 같다. 또 와야지!"
    result = convert_style(sample_prompt, sample_text)
    print(result)

# 문체 전환