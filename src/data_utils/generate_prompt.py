import pandas as pd
import re   
from data_utils.naver_summary import papago
from tqdm import tqdm


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

    summary_data = summary_data.query('blog_number not in @no_caption').drop(['Unnamed: 0'],axis=1).reset_index(drop=True)
    crawling_data = crawling_data.query('blog_number not in @no_caption').reset_index(drop=True)

    t = re.compile('[A-Z]')

    blog_prompts = []
    crawlings = []
    for i in tqdm(range(len(blog_captions['captions']))):
        c = blog_captions['captions'][i]
        s = summary_data['summary'][i]
        sentences = ['너는 여행블로그를 써주는 에이전트야. 아래에 블로그에 들어갈 사진들에 대한 설명과 블로그 요약을 줄게. 한국어로 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘']
        for n, j in enumerate(c.split('][')[:int(max_image)]):
            text = '.'.join(j.split('.')[:int(max_caption)])
            first_sentence = papago([text[t.search(text).span()[0]:]])
            first_sentence = f'<image{str(n)}>: {first_sentence}'
            sentences.append(first_sentence)

        num_images = str(len(sentences))
        crawlings.append(crawling_data['content'][i].split(f'<image_{num_images}>')[0])

        sentences.append(f'<요약>: {s}')
        sentences = '. \n'.join(sentences)
        blog_prompts.append(sentences)

        finetuning_data = pd.DataFrame({'prompt':blog_prompts, 'contents':crawlings})
        finetuning_data = finetuning_data.dropna().reset_index(drop=True)
        if return_csv:
            finetuning_data.to_csv('data/finetuning_data.csv',index=False, encoding="utf-8-sig")
    return finetuning_data

def get_finetune_csv(data, return_csv = True):
    finetune_csv = pd.DataFrame({
        'C_ID':range(len(data)),
        'T_ID': ['0']*len(data),
        'Text': data['prompt'],
        'Completion': data['contents']
    })
    if return_csv:
        finetune_csv.to_csv('data/finetune_dataset.csv',index=False, encoding="utf-8-sig")
        print('save csv')
    else:
        return finetune_csv

def generate_inference_caption(inputs,captions):
    country = inputs['meta_data']['Country/City'].split('/')[0]
    city = inputs['meta_data']['Country/City'].split('/')[1]
    year = inputs['meta_data']['date'].split('.')[0]
    month = inputs['meta_data']['date'].split('.')[1]
    with_who = inputs['meta_data']['With']
    texts = inputs['texts']
    sentences = [f'너는 여행블로그를 써주는 에이전트야. 나는 {year}년 {month}월 {with_who}와 함께 {country}의 {city}를 다녀왔어. 아래에 블로그에 들어갈 사진들에 대한 설명과 느낀점을 적어줄게. 이를 기반으로 한국어 여행 블로그를 작성해주고, 블로그 안에 각 이미지들의 배치 태그도 넣어줘.']
    for i,(t,c) in enumerate(zip(texts,captions)):
        korean_c = papago(c)
        caption_prompt = f'<image_{str(i)}>: \n 설명: {korean_c} \n 느낀점: {t} \n'
        sentences.append(caption_prompt)
    prompts = '\n'.join(sentences)
    return prompts

if __name__ == "__main__":
    crawling_data = pd.read_csv('data/blog_crawling_results_image_tag.csv')
    summary_data = pd.read_csv('data/cleaned_text_crawling_with_summary.csv')
    caption_data = pd.read_csv('data/blog_image_captions.csv')
    finetuning_data = generate_finetune_prompt(crawling_data,summary_data,caption_data,return_csv=True)
    get_finetune_csv(finetuning_data)


        


