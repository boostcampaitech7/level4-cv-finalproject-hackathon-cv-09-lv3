import socket

def get_ip():
    # UDP 소켓 생성 (IPv4, UDP 프로토콜 사용)
    # Google의 공개 DNS 서버 주소(8.8.8.8)를 사용하여 네트워크 연결을 시도
    # 네트워크 인터페이스를 확인하기 위한 목적으로 사용
    # 다른 공용 DNS 서버를 사용하고 싶다면, 8.8.8.8 대신 다른 공용 주소
    
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        KNOWN_HOST = "8.8.8.8"  # Google DNS
        s.connect((KNOWN_HOST, 80))
        return s.getsockname()[0]
    except Exception:
        return "0.0.0.0"
    finally:
        s.close()


class Config:
    def __init__(self):
        self.host = get_ip()
        self.port = 8000


config = Config()
