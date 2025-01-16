API <-> Application(Service) <-> database
scehma : data transfer object ,  데이터를 주고 받을 때 어떤 형태로 주고 받을 건지
Basemodel
SQLModel : 간단한 프로젝트에 쓴다고 해서 일단 배제

jwt process:
1.사용자가 아이디와 비밀번호 혹은 소셜 로그인을 이용하여 서버에 로그인 요청
2.서버는 비밀키를 사용해 json 객체를 암호화한 JWT 토큰을 발급
3.JWT를 헤더에 담아 클라이언트에 전송

1.클라이언트는 JWT를 로컬에 저장
2.API 호출을 할 때마다 header에 JWT를 실어 보냄
3.서버는 헤더를 매번 확인하여 사용자가 신뢰할만한지 체크하고, 인증이 되면 API에 대한 응답

routers/
├── __init__.py
├── admin.py : 관리자 api
├── api.py 
├── auth.py : 로그인 api
├── inference.py : 모델 api(미구현)
├── projects.py : 프로젝트 api
├── router.py : 라우트 엔드포인트 관리, 사용자 인증 
├── users.py : 유저 api
__main__.py
config.py 
main.py
security.py : jwt 토큰
