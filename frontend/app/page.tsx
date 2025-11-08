import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤖
          <span className="ml-2">
            <a
              href="https://langchain-ai.github.io/langgraphjs/"
              target="_blank"
            >
              LangGraph SDK
            </a>
            와{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>
            로 구축된 LangGraph 기반 질의응답 에이전트입니다.
            <br />
            LangGraph API 서버와 통신하여 지능적인 응답을 제공합니다.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            LangGraph 클라이언트 로직은 <code>hooks/useLangGraphChat.ts</code>에
            구현되어 있습니다.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            주요 UI 컴포넌트는 <code>components/ChatWindow.tsx</code>와{" "}
            <code>app/page.tsx</code>에 있습니다.
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">아래에서 에이전트와 대화를 시작해보세요!</span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <ChatWindow
      assistantId="agent"
      emoji="🤖"
      placeholder="무엇이든 물어보세요! LangGraph로 구동됩니다."
      emptyStateComponent={InfoCard}
    />
  );
}
