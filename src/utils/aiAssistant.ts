// AI 도우미(오른쪽 아래 동그란 버튼)와 다른 화면을 잇는 작은 연결 고리
// - 화면이 "지금 보고 있는 내용"을 알려 두면, AI 창을 열었을 때 바로 물어볼 수 있는 버튼이 보인다
// - askAi() 는 AI 창을 열고 질문을 바로 보낸다

export type AiContext = {
  title: string; // AI 창 위에 보일 이름 (예: '운전면허 12번 문제')
  label: string; // 사용자 말풍선에 보일 짧은 질문
  prompt: string; // 실제로 AI 에게 보내는 질문 (문제·보기·정답 포함)
};

const CONTEXT_EVENT = 'ai-assistant:context';
const ASK_EVENT = 'ai-assistant:ask';

let current: AiContext | null = null;

export function setAiContext(context: AiContext | null) {
  current = context;
  window.dispatchEvent(new Event(CONTEXT_EVENT));
}

export function getAiContext() {
  return current;
}

export function askAi(context: Pick<AiContext, 'label' | 'prompt'>) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: context }));
}

export function onAiContextChange(listener: () => void) {
  window.addEventListener(CONTEXT_EVENT, listener);
  return () => window.removeEventListener(CONTEXT_EVENT, listener);
}

export function onAiAsk(listener: (context: Pick<AiContext, 'label' | 'prompt'>) => void) {
  const handler = (e: Event) => listener((e as CustomEvent).detail);
  window.addEventListener(ASK_EVENT, handler);
  return () => window.removeEventListener(ASK_EVENT, handler);
}
