import pandas as pd
import re   
try:
    from data_utils.naver_summary import papago
except:
    from naver_summary import papago
from tqdm import tqdm

system_prompt = '''
당신은 대한민국 최고의 여행 블로거로써 세계 최고 여행 블로그를 뽑는 대회에 참가했습니다. 이 대회는 주어진 이미지에 대한 설명과 느낀점을 바탕으로 해당 이미지에 대한 여행 블로그를 작성하는 것입니다. 대회에 참여하기 위한 블로그 글은 대회 규칙을 절대적으로 따라야 하며, 심사 기준에 부합하는 좋은 여행 블로그를 작성해 세계 최고의 여행 블로거가 됩시다!

<대회 규칙> : 대회 규칙을 어길 시 즉시 실격됩니다.
1. 주어진 여행 정보와 이미지에 대한 내용으로만 블로그를 구성할 것
2. 이미지가 들어갈 위치에 <image 숫자> 태그를 통해 표시할 것
3. 불필요한 태그, 특수문자를 사용하지 말 것. 특히 블로그 글에 어색한 문단 구분을 활용하지 말 것
4. 사실에 입각한 정보만 블로그에 담아내야 하며, 블로그에 대한 오류가 있을 경우 허위사실유포죄에 의해 처벌 받을 수 있음.
5. 블로그 글은 한 이미지당 3개 이상의 문장으로 구성되며, 각 문장에 최소 5개 이상의 단어를 통해 글을 풍성하게 표현할 것

<심사 기준>: 좋은 점수를 받기 위해서는 심사 기준에 가장 유리한 글을 작성하세요.
1. 글에 대한 자연스러움 (실제 블로그와 얼마나 유사한가)
2. 불필요한 내용이나 할루시네이션 없이 사실에 입각한한 정보만 활용하고 있는가
3. 감정적인 표현과 생동감 있는 묘사
4. 글과 이미지의 적절한 배치. 글이 이미지를 잘 묘사하고 있는가.
5. 블로그 글에 개인적인 정보 혹은 위험성있는 단어를 활용하고 있지는 않은가.

세계 최고의 여행 블로거는 글을 작성할 때에는 아래의 사항을 따른다고 합니다. 세계 최고의 여행 블로거가 되기 위해 아래 사항을 따라 글을 작성하세요.
1. 글의 맨 앞 부분에는 블로그 글에 대한 소개와 여행지에 대한 소개를 작성하고, 글을 끝내기 전에는 여행지를 추천하는 문장을 통해 블로그의 결론을 작성할 것.
2.  '~습니다, ~다'체는 절대 활용하지 않고, 반말이나 ‘~요’체를 혼용해 친구에게 말하듯 편한 말투를 사용하고 문장을 짧게 구성해 가독성을 높일 것. 특히 '~해요' 체를 적극적으로 활용할 것!
3. 경험 중심의 서술을 통해 여행지에서 직접 체험한 경험을 바탕으로 글을 작성할 것 개인적인 감상을 자연스럽게 포함해 독자가 공감할 수 있게 구성할 것. (예: "저도 처음엔 망설였는데...", "다들 이런 적 있지 않나요?", "저만 그런 거 아니죠?")
4. "고즈넉한 분위기", "탁 트인 바다와 하늘", "형형색색 랜턴" 등 감각적인 표현을 활용해 감성적이고 생동감 있는 묘사를 통해 표현할 것.
5. "너무 좋았어요!", "완전 만족했어요!", "정말 인상적이었답니다." 등 긍정적인 표현과 감탄사를 적절히 사용해 글의 분위기를 밝게 할 것.

위의 사항을 모두 포함해 글을 작성하시오. 만일 이에 위배될 경우 당신은 10년 이하의 징역, 1000만원 이상의 벌금을 부여받게 됩니다.


<<블로그 작성 정보: 이미지와 요약>>
'''

def generate_finetune_prompt(crawling_data,summary_data,caption_data, max_caption = 4, max_image = 10, return_csv = False):
    caption_data['blog'] = caption_data['image_path'].apply(lambda x: x.split('/')[0])
    caption_data['captions'] = caption_data['captions'].apply(lambda x: f"[{x}]")

    blog_captions = pd.DataFrame(caption_data.groupby('blog')['captions'].sum()).reset_index()

    blog_captions['index'] = blog_captions['blog'].apply(lambda x :int(x.split('_')[1]))
    blog_captions = blog_captions.sort_values(by='index').reset_index(drop=True)

    no_caption = []
    for i in summary_data['blog_number']:
        if i not in blog_captions['blog'].unique():
            no_caption.append(i)

    summary_data = summary_data.query('blog_number not in @no_caption').reset_index(drop=True)
    crawling_data = crawling_data.query('blog_number not in @no_caption').reset_index(drop=True)

    assert len(summary_data) == len(crawling_data)

    t = re.compile('[A-Z]')

    blog_prompts = []
    crawlings = []
    for i in tqdm(range(len(blog_captions['captions']))):
        c = blog_captions['captions'][i]
        s = summary_data['summary'][i]
        sentences = []
        for n, j in enumerate(c.split('][')[:int(max_image)]):
            text = '.'.join(j.split('.')[:int(max_caption)])
            try:
                first_sentence = papago([text[t.search(text).span()[0]:]])
            except:
                continue
            first_sentence = f'<image_{str(n)}>: {first_sentence}'
            sentences.append(first_sentence)

        num_images = str(len(sentences))
        try:
            crawlings.append(crawling_data['content'][i].split(f'<image_{num_images}>')[0])
        except: 
            crawlings.append(None)

        sentences.append(f'<요약>: {s}')
        sentences = '. \n'.join(sentences)
        blog_prompts.append(sentences)

        finetuning_data = pd.DataFrame({'prompt':blog_prompts, 'contents':crawlings})
        finetuning_data = finetuning_data.dropna().reset_index(drop=True)
        if return_csv:
            finetuning_data.to_csv('data/finetuning_data.csv',index=False, encoding="utf-8-sig")
    return finetuning_data

def change_prompt(prompt_text,v,csv = 'data/finetuning_data.csv'):
    fd = pd.read_csv(csv)
    before_prompt = fd['Text'][0].split('\n')[0]
    fd['Text'] = fd['Text'].apply(lambda x : x.replace(before_prompt,prompt_text))
    fd.to_csv(f'data/finetunde_dataset_ver{v}.csv', index=False, encoding='uft-8-sig')
    
def post_processing(data):
    caption_data = data['prompt'],
    blog_data = data['contents']
    blogssss = []
    captionssss=[]

    for blog0,caption0 in tqdm(zip(blog_data,caption_data)):
        image_indexes = {n:[] for n in range(0,11)}
        caption_text = caption0[:re.search('<요약>: ',caption0).span()[0]]
        summary_text = caption0[re.search('<요약>: ',caption0).span()[1]:]
        captions = caption_text.split('\n')[1:]
        summarys = summary_text.split('\n')
        for idx,cap in enumerate(captions):
            if len(cap) == 0:
                image_indexes[idx] = []
            else:
                image_indexes[idx].append(cap.split(': ')[1])


        split_blog = blog0.split(' ')
        image_index = [-100]
        filtered_blog = []
        for s in range(len(split_blog)):
            if re.search('<image', split_blog[s]):
                if image_index[-1] + 1 == s:
                    image_number = int(split_blog[s].split('_')[-1][:-1]) #1~10
                    image_indexes[image_number-2].append(image_indexes[image_number-1])
                    image_indexes[image_number-1] = []
                    continue
                else:
                    image_index.append(s)
            filtered_blog.append(split_blog[s])
        
        blogssss.append(' '.join(filtered_blog))

        final_captions = [system_prompt]
        for id,captions in enumerate(image_indexes):
            if len(image_indexes[captions])>0:
                caption_text = str(image_indexes[captions])[1:-2]
                caption_complete = f'<image_{id+1}>: {caption_text}'
                final_captions.append(caption_complete)
        final_captions.append('<요약>')
        for summary in summarys:
            final_captions.append(summary)
        captionssss.append('\n'.join(final_captions))

        data['prompt'] = captionssss
        data['contents'] = blogssss
        return data

def get_finetune_csv(data, return_csv = True):
    finetune_csv = pd.DataFrame({
        'System_Prompt': data['prompt'],
        'C_ID':range(len(data)),
        'T_ID': ['0']*len(data),
        'Text': ["주어진 블로그 정보와 규칙에 맞게 블로그를 작성하세요." for _ in range(len(data))],
        'Completion': data['contents']
    })
    if return_csv:
        finetune_csv.to_csv('data/finetune_dataset_kimi_caption_ver2.csv',index=False, encoding="utf-8-sig")
        print('save csv')
    else:
        return finetune_csv

def generate_inference_caption(inputs,captions,base_prompt):
    country = inputs['meta_data']['Country/City'].split('/')[0]
    city = inputs['meta_data']['Country/City'].split('/')[1]
    year = inputs['meta_data']['date'].split('.')[0]
    month = inputs['meta_data']['date'].split('.')[1]
    with_who = inputs['meta_data']['With']
    texts = inputs['texts']
    sentences = [base_prompt.format(year,month,country,city,with_who)]
    for i,(t,c) in enumerate(zip(texts,captions)):
        korean_c = papago(c)
        caption_prompt = f'<image_{str(i)}>: {korean_c}'
        sentences.append(caption_prompt)
    sentences.append("<요약>")
    for i,t in enumerate(texts):
        if t == None or len(t) < 5:
            t = sentences[i+1].split(">: ")[1]
        summary_prompt = f'- {t}'
        sentences.append(summary_prompt)
    prompts = '\n'.join(sentences)
    return prompts

if __name__ == "__main__":
    crawling_data = pd.read_csv('blog_data/kimi_blog_crawling_results.csv')
    summary_data = pd.read_csv('blog_data/kimi_crawling_with_summary.csv')
    caption_data = pd.read_csv('blog_data/blog_caption_kimi.csv')
    finetuning_data = generate_finetune_prompt(crawling_data,summary_data,caption_data,return_csv=True)
    finetuning_data = post_processing(finetuning_data)
    get_finetune_csv(finetuning_data)
        


