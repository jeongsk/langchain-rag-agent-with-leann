# Docker 로컬 환경 설정 가이드

이 가이드는 LangSmith 클라우드 없이 로컬 Docker 환경에서 LangGraph 애플리케이션을 실행하는 방법을 설명합니다.

## 사전 요구사항

- Docker Desktop 또는 Docker Engine 설치
- Docker Compose 설치 (Docker Desktop에 포함)
- API 키 (Google AI, OpenAI)

## 1. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 설정합니다:

```bash
# Google AI API Key (필수)
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI API Key (필수 - 폴백 모델용)
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith 설정 (선택사항 - 로컬에서는 false로 설정)
LANGSMITH_TRACING=false
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=langchain-rag-agent
```

## 2. Docker 컨테이너 빌드 및 실행

### 전체 서비스 시작

```bash
docker-compose up -d
```

이 명령은 다음 서비스를 시작합니다:
- **PostgreSQL**: LangGraph 상태 저장용 데이터베이스 (포트 5432)
- **Redis**: 캐싱 서비스 (포트 6379)
- **LangGraph API**: LangGraph 애플리케이션 서버 (포트 8000)

### 로그 확인

```bash
# 모든 서비스 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f langgraph-api
```

### 서비스 상태 확인

```bash
docker-compose ps
```

## 3. API 접속

LangGraph API는 다음 주소에서 접속 가능합니다:

- **API Base URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/ok (응답: `{"ok":true}`)
- **API Docs**: http://localhost:8000/docs
- **Server Info**: http://localhost:8000/info
- **Metrics**: http://localhost:8000/metrics

### 테스트 요청 예시

```bash
# Health check
curl http://localhost:8000/ok

# 예상 응답: {"ok":true}

# 서버 정보 확인
curl http://localhost:8000/info

# API 문서 확인 (브라우저에서)
open http://localhost:8000/docs

# 사용 가능한 그래프 목록
curl http://localhost:8000/assistants/search
```

## 4. 서비스 중지 및 제거

### 서비스 중지 (데이터 보존)

```bash
docker-compose stop
```

### 서비스 중지 및 컨테이너 제거 (데이터 보존)

```bash
docker-compose down
```

### 모든 데이터 포함 완전 제거

```bash
docker-compose down -v
```

## 5. 서비스 재시작

```bash
# 코드 변경 후 재빌드
docker-compose up -d --build

# 서비스만 재시작 (빌드 없이)
docker-compose restart langgraph-api
```

## 참고: langgraph dev vs langgraph up

이 설정은 `langgraph dev` 명령을 사용합니다:
- **langgraph dev**: 개발 모드로 실행 (핫 리로드 지원, 디버깅에 적합)
- **langgraph up**: 프로덕션 모드로 실행

프로덕션 환경에서는 `langgraph up` 사용을 권장합니다.

## 6. 문제 해결

### 포트 충돌 문제

기본 포트(5432, 6379, 8000)가 이미 사용 중인 경우, `docker-compose.yml`에서 포트를 변경할 수 있습니다:

```yaml
services:
  postgres:
    ports:
      - "15432:5432"  # 왼쪽 포트 변경
```

### 데이터베이스 연결 실패

1. PostgreSQL 컨테이너가 정상 실행 중인지 확인:
   ```bash
   docker-compose ps postgres
   ```

2. PostgreSQL 로그 확인:
   ```bash
   docker-compose logs postgres
   ```

### 벡터 스토어 파일 문제

`vectorstore` 디렉토리가 존재하고 `.leann` 파일이 있는지 확인:

```bash
ls -la vectorstore/
```

### API 키 문제

환경 변수가 올바르게 설정되었는지 확인:

```bash
docker-compose exec langgraph-api env | grep API_KEY
```

## 7. 개발 모드

개발 중 코드 변경 사항을 실시간으로 반영하려면 `docker-compose.yml`의 volumes 설정을 다음과 같이 수정:

```yaml
volumes:
  - .:/app  # 전체 프로젝트 디렉토리를 마운트
```

그리고 다음 명령으로 재시작:

```bash
docker-compose restart langgraph-api
```

## 8. 데이터 백업

### PostgreSQL 데이터 백업

```bash
docker-compose exec postgres pg_dump -U langgraph langgraph > backup.sql
```

### PostgreSQL 데이터 복원

```bash
docker-compose exec -T postgres psql -U langgraph langgraph < backup.sql
```

## 참고사항

- 로컬 환경에서는 LangSmith 클라우드 연동 없이 동작합니다
- 모든 상태는 PostgreSQL에 저장됩니다
- Redis는 선택사항이지만 성능 향상을 위해 권장됩니다
- 프로덕션 환경에서는 보안을 위해 데이터베이스 비밀번호를 변경하세요
