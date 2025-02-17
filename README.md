# Travelog

## **📘**Overview

2025.1 ~ 2025.2

This project, Travelog, is a service that automatically generates blog posts based on user-provided photos and information. It was developed in collaboration with Naver Cloud as part of the Naver BoostCamp program.


## **📘**Contributors

|임동훈(Leader)|은의찬|한승수|김동영|김예나
|:----:|:----:|:----:|:----:|:----:|
| [<img src="https://github.com/user-attachments/assets/6a8e6613-b4c3-4e99-8bc6-99f82b5ce681" alt="" style="width:100px;100px;">](https://github.com/naringles) <br/> | [<img src="https://github.com/user-attachments/assets/a202a714-c51f-4228-9f87-201844f6afea" alt="" style="width:100px;100px;">](https://github.com/0522chan) <br/> | [<img src="https://github.com/user-attachments/assets/b2e040a7-dca3-4a23-b44f-5de84b76c950" alt="" style="width:100px;100px;">](https://github.com/hanseungsoo13) <br/> | [<img src="https://github.com/user-attachments/assets/7ad23168-31ab-4dfe-bb16-48e79c304374" alt="" style="width:100px;100px;">](https://github.com/kimdyoc13) <br/> | [<img src="https://github.com/user-attachments/assets/358e2764-a79f-4e78-9de9-5a887ef75001" alt="" style="width:100px;100px;">](https://github.com/yehna2907) <br/> | 


## **📱 Project Demo**
To be updated...


## **📘**Wrap up Report
You can find detailed explanations about the project and individual contributions in the wrap-up report below.

[Here's our link]()


## **🛠️**Tools

- github
- notion
- slack
- react
- fastapi

## **📂**Folder Structure

```

┌── crawling
|   ├── crawling_selenium.py
│   └── crawling.py
├── frontend
|   ├── public
│   │   └── vite.svg
|   ├── src
│   │   ├── assets
│   │   └── ...
|   ├── ...
|   ├── package.json
│   └── vite.config.ts
├── modeling
|   ├── data_utils
|   |   ├── blog_image.py
|   |   ├── converter.py
|   |   ├── generate_caption.py
|   |   ├── generate_prompt.py
|   |   ├── naver_summary.py
|   |   ├── postcard.py
|   |   ├── processing.py
|   |   └── stamp_generation.py
│   ├── FAST_API
|   |   ├── config.py
|   |   ├── database.py
|   |   └── dependencies.py
│   ├── api.py
│   ├── inference.py
│   ├── main.py
│   └── train_API.py
├── server
│   ├── database
│   │   ├── ...
│   ├── routers
│   │   ├── admin.py
│   │   ├── ...
│   ├── __main__.py
│   ├── config.py
│   ├── main.py
│   └── security.py
└── README.md


```
- `crawling`: Uses the Naver Search API to crawl and preprocess data.
- `server`: Implements a backend server using Router, Ngrok, and FastAPI.
- `frontend`: Contains frontend code using Ngrok and React.
- `modeling`: Contains model training and inference using HyperCLOVA.

## **📰 Model**
### Blog Generator (HyperCLOVA X)
**HyperCLOVA X** is a large-scale Korean language model capable of processing and generating natural language text. It is used in this project to create structured and engaging travel blog posts by leveraging image captions and user-provided details. Through prompt engineering, the model enhances fluency, coherence, and storytelling while minimizing hallucinations.
- Training is available through `modeling/train_API.py`.
- Inference is available through `modeling/Inference.py`.
- Preprocessing and dataset preparation are available in `modeling/data_utils/generate_prompt.py`.

### Vision-Language Model (Qwen2-VL)
**Qwen2-VL** is a multimodal model capable of understanding and generating both text and image-related content. In this project, it is used to extract contextual information from images and generate descriptions that improves the quality of AI-generated travel blogs.
- Vision-language tasks, including image captioning, are available through `modeling/data_utils/generate_caption.py`.
- Preprocessing and data handling are managed in `modeling/data_utils/naver_summary.py`.
- For installation and supported models, refer to the [Hugging Face model repository](https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct).

### Text-to-Image Generator (DALL·E API)
**DALL·E API** is an AI-powered image generation model capable of creating high-quality visuals based on textual descriptions. In this project, it is used to generate postcard-style images that complement blog content, enhancing the storytelling experience with visually appealing travel imagery.
- Image generation is available through `modeling/data_utils/postcard.py`.
- For API usage and model capabilities, refer to [OpenAI’s official documentation](https://platform.openai.com/docs/guides/images).


## **📊 Experiments**  
### Prompt Engineering (w/ System Prompt)
- Generates image tags for each user-provided photo and creates corresponding descriptions.
- Produces blog posts in the selected writing style (e.g., friendly and conversational tone).
<img src="https://github.com/user-attachments/assets/1ab9692c-509a-4f9b-b774-4e902d5afb9f" width="70%">


## Fine-tuning Result
- Refines the LLM’s default writing style to produce more natural and human-like blog content.
- Enhances emotional depth with more vivid and diverse expressions.
<img src="https://github.com/user-attachments/assets/02306a23-ed50-4e2b-94fc-ce5a40638ddf" width="70%">
