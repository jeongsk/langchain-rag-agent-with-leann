---
title: Langchain Rag Agent
emoji: 💬
colorFrom: yellow
colorTo: purple
sdk: streamlit
sdk_version: 1.51.0
app_file: app.py
pinned: false
hf_oauth: true
hf_oauth_scopes:
- inference-api
short_description: LangChain 및 LangGraph에 관한 질문에 공식 문서를 활용하여 답변하는 RAG 에이전트.
---

# 🤖 LangChain & LangGraph RAG 챗봇

LangChain과 LangGraph 공식 문서를 기반으로 질문에 답변하는 RAG 에이전트입니다.

## 기능

- 📚 LangChain/LangGraph 공식 문서 기반 검색
- 💬 한국어 질문/답변 지원
- 🔄 스트리밍 응답
- 💾 세션별 대화 기록 관리
- 📝 예제 질문 제공

## 실행 방법

```bash
# 의존성 설치
uv sync

# 앱 실행
uv run streamlit run app.py
```

## 지원하는 주제

- LangChain/LangGraph API, 클래스, 메서드
- 구현 패턴과 모범 사례
- 상태 관리, 에이전트 워크플로우
- 도구 통합 및 함수 호출
- 문제 해결 및 디버깅
