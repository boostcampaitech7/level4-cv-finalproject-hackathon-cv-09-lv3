from concurrent import futures
import re
import time
import yaml

from data_utils.generate_prompt import generate_inference_caption
from Inference import get_blog_inference
from data_utils.postcard import generate_prompt, generate_postcard
from data_utils.stamp_generation import create_stamp

system_prompt = '''
    당신은 대한민국 최고의 여행 블로거로써 세계 최고 여행 블로그를 뽑는 대회에 참가했습니다. 이 대회는 주어진 이미지에 대한 설명과 느낀점을 바탕으로 해당 이미지에 대한 여행 블로그를 작성하는 것입니다. 대회에 참여하기 위한 블로그 글은 대회 규칙을 절대적으로 따라야 하며, 심사 기준에 부합하는 좋은 여행 블로그를 작성해 세계 최고의 여행 블로거가 됩시다!

    <대회 규칙> : 대회 규칙을 어길 시 즉시 실격됩니다.
    1. 주어진 여행 정보와 이미지에 대한 내용으로만 블로그를 구성할 것
    2. 이미지가 들어갈 위치에 <image 숫자> 태그를 통해 표시할 것
    3. 불필요한 태그, 특수문자를 사용하지 말 것. 특히 블로그 글에 어색한 문단 구분을 활용하지 말 것
    4. 사실에 입각한 정보만 블로그에 담아내야 하며, 블로그에 대한 오류가 있을 경우 허위사실유포죄에 의해 처벌 받을 수 있음.
    5. 블로그 글은 한 이미지당 3개 이상의 문장으로 구성되며, 각 문장에 최소 5개 이상의 단어를 통해 글을 풍성하게 표현할 것
    6. 블로그 글에 개인적인 정보 혹은 위험성 있는 단어는 제외되어야 한다.

    <심사 기준>: 좋은 점수를 받기 위해서는 심사 기준에 가장 유리한 글을 작성하세요.
    1. 글에 대한 자연스러움 (실제 블로그와 얼마나 유사한가)
    2. 불필요한 내용이나 할루시네이션 없이 사실에 입각한 정보만 활용하고 있는가
    3. 감정적인 표현과 생동감 있는 묘사
    4. 글과 이미지의 적절한 배치. 글이 이미지를 잘 묘사하고 있는가.
    5. 블로그 글에 개인적인 정보 혹은 위험성 있는 단어를 포함하고 있지 않은가.

    세계 최고의 여행 블로거는 글을 작성할 때에는 아래의 사항을 따른다고 합니다. 세계 최고의 여행 블로거가 되기 위해 아래 사항을 따라 글을 작성하세요.
    1. 글의 맨 앞 부분에는 블로그 글에 대한 소개와 여행지에 대한 소개를 작성하고, 글을 끝내기 전에는 여행지를 추천하는 문장을 통해 블로그의 결론을 작성할 것.
    2.  '~습니다, ~다'체는 절대 활용하지 않고, 반말이나 ‘~요’체를 혼용해 친구에게 말하듯 편한 말투를 사용하고 문장을 짧게 구성해 가독성을 높일 것. 특히 '~해요' 체를 적극적으로 활용할 것!
    3. 경험 중심의 서술을 통해 여행지에서 직접 체험한 경험을 바탕으로 글을 작성할 것 개인적인 감상을 자연스럽게 포함해 독자가 공감할 수 있게 구성할 것. (예: "저도 처음엔 망설였는데...", "다들 이런 적 있지 않나요?", "저만 그런 거 아니죠?")
    4. "고즈넉한 분위기", "탁 트인 바다와 하늘", "형형색색 랜턴" 등 감각적인 표현을 활용해 감성적이고 생동감 있는 묘사를 통해 표현할 것.
    5. "너무 좋았어요!", "완전 만족했어요!", "정말 인상적이었답니다." 등 긍정적인 표현과 감탄사를 적절히 사용해 글의 분위기를 밝게 할 것.

    위의 사항을 모두 포함해 글을 작성하시오. 만일 이에 위배될 경우 당신은 10년 이하의 징역, 1000만원 이상의 벌금을 부여받게 됩니다.

    <블로그 작성 정보: 이미지와 요약>
    '''

base_prompt = '여행에 대한 정보: 여행 시기: {}년 {}월, 여행지: {}의 {}, 동행: {}'

with open('src/api_keys.yaml') as f:
    keys = yaml.load(f, Loader=yaml.FullLoader)

OPEN_AI_KEY = keys['open_ai_key']

def preprocessing(model, images):
    '''
    Dalle 엽서 생성을 위한 캡셔닝 생성
    '''
    captions = []

    captioning_start = time.perf_counter()
    print("'''start captioning'''")

    for image in images:
        caption = model.generate_caption_for_dalle(image)
        captions.append('.'.join(caption[0].split('.')[:2]))

    captioning_finish = time.perf_counter()
    print(f'Finished in {round(captioning_finish-captioning_start, 2)} second(s)')
    return captions

def replace_words(text, pattern, replace_dict):
    return pattern.sub(lambda match: replace_dict[match.group(0)], text)

def postprocessing(request_text, files):
    '''
    생성된 블로그를 후처리하는 함수입니다. 
    생성된 블로그의 이미지 태그를 원본 이미지 태그로 바꿔줍니다.
    '''
    filenames = []
    for file in files:
        if file.content_type.startswith('image/'):
            filenames.append(file.filename)

    substitute_image = {}
    for i in range(len(filenames)):
        substitute_image[f'<image_{str(i)}>'] = f'<{filenames[i]}>'
    
    pattern = rf"([^\n]){re.escape(i)}([^\n])"
    replacement = rf"\1\n{i}\n\2"
    request_text = re.sub(pattern, replacement, request_text)

    pattern = rf"(^|[^\n]){re.escape(i)}(\n)"
    replacement = rf"\1\n{i}\2"
    request_text = re.sub(pattern, replacement, request_text)

    pattern = rf"(\n){re.escape(i)}([^\n]|$)"
    replacement = rf"\1{i}\n\2"
    request_text = re.sub(pattern, replacement, request_text)

    for i in re.findall('<image_\d>',request_text):
        request_text = re.sub(i,substitute_image[i],request_text)

    return request_text

def get_blog(model,images,input_json,files):
    '''
    블로그를 생성하는 함수입니다.
    VLM으로 생성된 캡션을 활용해 하이퍼클로바 API와 interaction하는 과정을 담고 있습니다.
    '''
    blog_start = time.perf_counter()
    print("'''start generating blog'''")

    blog_captions = []
    for image in images:
        caption = model.generate_caption_for_blog(image)
        blog_captions.append(caption)

    blog_prompt = generate_inference_caption(input_json, blog_captions, base_prompt)
    seed = 0
    print(blog_prompt)
    prediction = get_blog_inference(system_prompt, blog_prompt,seed)
    while "status" in prediction or '<image_' not in prediction:
        seed += 1
        print(f"try seed {seed}")
        time.sleep(23)
        prediction = get_blog_inference(system_prompt, blog_prompt,seed)
        if seed > 5:
            prediction = "Error"
            break
    print(prediction)
    results = postprocessing(prediction, files)

    blog_finish = time.perf_counter()
    print(f'Finished blog {round(blog_finish-blog_start, 2)} second(s)')
    return results

def get_dalle(input_json,captions):
    '''
    3장의 postcard를 생성하는 함수 입니다.
    preprocessing에서 생성된 caption을 활용합니다.
    '''
    dalle_start = time.perf_counter()
    print("'''start generating dalle'''")
    
    postcard_prompt = generate_prompt(input_json,captions)
    print(postcard_prompt)

    postcard_urls = []

    for i in range(3):
        postcard_url = generate_postcard(OPEN_AI_KEY, postcard_prompt)
        postcard_urls.append(postcard_url)
    
    dalle_finish = time.perf_counter()
    print(f'Finished dalle {round(dalle_finish-dalle_start, 2)} second(s)')

    return postcard_urls

def get_stamp(input_json):
    '''
    생성된 스탬프를 받아오는 함수입니다.
    '''
    return create_stamp(OPEN_AI_KEY,input_json)

def multi_process(model,images,input_json,captions,files):
    '''
    API를 활용하는 3가지 과정(블로그, 엽서, 스탬프)을 multi process로 실행하는 함수입니다.
    multi process를 활용해 전체 프로세스를 30초 단축
    '''
    with futures.ThreadPoolExecutor() as executor:
        dalle = executor.submit(get_dalle, input_json, captions)
        blog = executor.submit(get_blog, model, images, input_json, files)
        stamp = executor.submit(get_stamp,input_json)

        blog_results = blog.result()
        dalle_results = dalle.result()
        stamp_results = stamp.result()

    return blog_results, dalle_results, stamp_results