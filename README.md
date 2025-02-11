# Travelog

## **📘**Overview

2025.1 ~ 2025.2

This project, Travelog, is a service that automatically generates blog posts based on user-provided photos and information. It was developed in collaboration with Naver Cloud as part of the Naver BoostCamp program.


## **📘**Contributors

|은의찬|임동훈|김예나|한승수|김동영
|:----:|:----:|:----:|:----:|:----:|
| [<img src="https://github.com/user-attachments/assets/de2fa83d-3076-4f18-bc65-45e34a456b72" alt="" style="width:100px;100px;">](https://github.com/0522chan) <br/> | [<img src="https://github.com/user-attachments/assets/6ba55701-35e6-421f-8ed7-03b054f55a76" alt="" style="width:100px;100px;">](https://github.com/naringles) <br/> | [<img src="https://github.com/user-attachments/assets/109315cf-03ea-46c9-af2d-4145cef1f50f" alt="" style="width:100px;100px;">](https://github.com/yehna2907) <br/> | [<img src="https://github.com/user-attachments/assets/b2e040a7-dca3-4a23-b44f-5de84b76c950" alt="" style="width:100px;100px;">](https://github.com/hanseungsoo13) <br/> | [<img src="https://github.com/user-attachments/assets/d973c9de-7e57-4796-8c48-924269f4d2c9" alt="" style="width:100px;100px;">](https://github.com/kimdyoc13) <br/> | 


## **📘**Wrap up Report
You can find detailed explanations about the project and individual contributions in the wrap-up report below.

[Here's our link]()


## **📰**Tools

- github
- notion
- slack
- react
- fastapi

## **📰**Folder Structure

```

┌── crawling
│   └── crawling.py
├── public
│   └── vite.svg
├── server
│   ├── database
│   │   ├── migrations
│   │   │     ├── versions
│   │   │     │      └── 149264e17467_init_schema.py
│   │   │     ├── env.py
│   │   │     └── scr.pt.py.mako
│   │   ├── alembic.ini
│   │   ├── api.py
│   │   ├── create-test-data.py
│   │   ├── database.py
│   │   ├── dummyData.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── routers
│   │   ├── admin.py
│   │   ├── api.py
│   │   ├── auth.py
│   │   ├── inference.py
│   │   ├── projects.py
│   │   ├── routers.py
│   │   └── users.py
│   ├── __main__.py
│   ├── config.py
│   ├── main.py
│   ├── security.py
├── src
│   ├── assets  
│   │   └── react.svg
│   ├── components
│   │   ├── BlogContentPage.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingBlogCreation.tsx
│   │   ├── LoginPage.css
│   │   ├── LoginPage.tsx
│   │   ├── PhotoDescription.tsx
│   │   ├── PhotoUpload.tsx
│   │   ├── PostcardDetail.tsx
│   │   ├── PostcardEdit.tsx
│   │   ├── PostcardSelection.tsx
│   │   ├── PostcardStorage.tsx
│   │   └── StampChecker.tsx
│   ├── context
|   │   ├── TokenContext.tsx
|   │   └── TravelContext.tsx
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
│   ├── pages
|   |   └── AppRouter.tsx
│   ├── styles
|   |   └── GlobalStyle.ts
│   ├── api.py
│   ├── api.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── inference.py
│   ├── main.py
│   ├── main.tsx
│   ├── train_API.py
│   └── vite-env.d.ts
├── .gitignore
├── mmsegmentation
├── environment.yml
├── eslint.config.js
├── index.html
├── package_backend.json
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

```
- `crawling`: Uses the Naver Search API to crawl and preprocess data.
- `server`: Implements a backend server using Router, Ngrok, and FastAPI.
- `src`: Contains frontend code using Ngrok and React, along with model training and inference using HyperCLOVA.


## **📰**Model







