// 암기 카드·핵심 내용 인라인 체크 문제
// - 벌점 카드: 「위반 → 몇 점?」 숫자 4지선다
// - 벌금 카드: 「위반 → 벌금 범위?」 숫자 4지선다
// - 그 밖의 카드: 같은 주제의 다른 카드 내용을 오답으로 쓰는 '옳은 내용 고르기'
// - 핵심 내용(소주제): 이미 있는 기출 예시 문제를 그대로 씀 (정답·해설이 공식 정답 기준)
import { FAST_CARDS, type FastCard } from './driverLicenseFastCards';

export type CheckQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explain?: string;
  img?: string[];
  kind?: 'choice' | 'judge';
};

// 과목1 문제 은행의 문제 구조(필요한 필드만)
export type BankQuestion = {
  id: number;
  t: 'j' | 's';
  q: string;
  o?: string[];
  a: number;
  e?: string;
  img?: string[];
};

const SCORE_CHOICES = ['1점', '3점', '6점', '9점', '12점'];
const FINE_CHOICES = ['20~200위안', '200위안', '200~500위안', '200~2000위안', '1000~2000위안', '1000~3000위안', '2000~5000위안'];

// 자동 생성으로는 뜻이 흐려지는 카드만 직접 만든 문제
const CURATED: Record<string, { prompt: string; choices: string[]; answer: number }[]> = {
  '헷갈리는 벌점 짝': [
    {
      prompt: '번호판 위조·도용 / 미부착·가림 / 규정대로 설치하지 않음의 벌점은?',
      choices: ['12점 · 9점 · 3점', '12점 · 6점 · 3점', '9점 · 6점 · 3점', '12점 · 9점 · 6점'],
      answer: 0,
    },
    {
      prompt: '사고 후 도주 — 경상 이상·사망 / 경미한 부상·재산 피해의 벌점은?',
      choices: ['12점 · 6점', '12점 · 3점', '9점 · 6점', '6점 · 3점'],
      answer: 0,
    },
  ],
  '형사처벌·교통사고죄': [
    {
      prompt: '사고를 내고 도주했을 때(사망이 도주 때문은 아님)의 형량은?',
      choices: ['3년 이상 7년 이하 징역', '3년 이하 징역 또는 단기 구금', '7년 이상 징역', '5년 이상 10년 이하 징역'],
      answer: 0,
    },
    {
      prompt: '도주 때문에 사람이 사망한 경우의 형량은?',
      choices: ['7년 이상 징역', '3년 이상 7년 이하 징역', '3년 이하 징역 또는 단기 구금', '10년 이상 징역'],
      answer: 0,
    },
  ],
};

// 같은 seed면 항상 같은 순서 — 화면을 다시 그려도 정답 위치가 바뀌지 않게 함
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = (seed + 7) * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function scoreQuestions(card: FastCard, index: number, score: string): CheckQuestion[] {
  const points = card.points
    .map((point) => point.replace(/\s*:\s*\d+점\s*$/, '').trim())
    .filter((point) => point && !/\d+점/.test(point));
  const target = `${score}점`;
  return points.map((point, i) => {
    const others = shuffle(
      SCORE_CHOICES.filter((value) => value !== target),
      index * 13 + i * 7,
    ).slice(0, 3);
    const choices = shuffle([target, ...others], index * 7 + i);
    return {
      id: `card:${index}:${i}`,
      prompt: `「${point}」의 벌점은?`,
      choices,
      answer: choices.indexOf(target),
      explain: card.memo,
    };
  });
}

function fineQuestions(card: FastCard, index: number): CheckQuestion[] {
  const titleAmount = card.title.match(/벌금\s*([^\s(]+)/)?.[1] ?? '';
  const points = card.points
    .map((point) => {
      const match = point.match(/^(\d+~\d+위안)\s*:\s*(.+)$/);
      if (match) return { amount: match[1], text: match[2].trim() };
      return { amount: titleAmount, text: point.trim() };
    })
    .filter(
      ({ amount, text }) =>
        FINE_CHOICES.includes(amount) && !!text && !text.includes('벌금은') && !text.includes('까지') && !/(구류|징역)/.test(text),
    );
  return points.map(({ amount, text }, i) => {
    const others = shuffle(
      FINE_CHOICES.filter((value) => value !== amount),
      index * 11 + i * 5,
    ).slice(0, 3);
    const choices = shuffle([amount, ...others], index * 7 + i);
    return {
      id: `card:${index}:${i}`,
      prompt: `「${text}」의 벌금은?`,
      choices,
      answer: choices.indexOf(amount),
      explain: card.memo,
    };
  });
}

function genericQuestions(card: FastCard, index: number): CheckQuestion[] {
  const pool = Array.from(
    new Set(
      FAST_CARDS.filter((_, i) => i !== index && FAST_CARDS[i].topic === card.topic)
        .flatMap((other) => other.points)
        .map((point) => point.trim()),
    ),
  ).filter((point) => point && !card.points.includes(point));
  const picks = card.points.filter((point, i, arr) => !!point && arr.indexOf(point) === i);
  return picks.map((point, i) => {
    const distractors = shuffle(pool, index * 17 + i * 31).slice(0, 3);
    const choices = shuffle([point, ...distractors], index * 7 + i);
    return {
      id: `card:${index}:${i}`,
      prompt: `「${card.title}」 내용으로 옳은 것은?`,
      choices,
      answer: choices.indexOf(point),
      explain: card.memo,
    };
  });
}

function build(card: FastCard, index: number): CheckQuestion[] {
  const curated = CURATED[card.title];
  if (curated) {
    return curated.map((q, i) => ({ ...q, id: `card:${index}:${i}`, explain: card.memo }));
  }
  const score = card.title.match(/^벌점 (\d+)점$/);
  if (score) return scoreQuestions(card, index, score[1]);
  if (card.title.startsWith('벌금')) return fineQuestions(card, index);
  return genericQuestions(card, index);
}

const cardCache = new Map<number, CheckQuestion[]>();

/** 암기 카드 한 장의 체크 문제 (카드의 모든 요점을 1문제씩) */
export function cardCheckQuestions(card: FastCard, index: number): CheckQuestion[] {
  const cached = cardCache.get(index);
  if (cached) return cached;
  const built = build(card, index);
  cardCache.set(index, built);
  return built;
}

/** 소주제의 기출 예시 문제 전체를 체크 문제로 변환 (기출 예시 대체) */
export function bankCheckQuestions(questions: BankQuestion[], itemKey: string): CheckQuestion[] {
  return [...questions]
    .sort((a, b) => (b.t === 's' ? 1 : 0) - (a.t === 's' ? 1 : 0))
    .map((q) => ({
      id: `${itemKey}#${q.id}`,
      prompt: q.q,
      choices: q.t === 'j' ? ['맞음', '틀림'] : q.o ?? [],
      answer: q.a,
      explain: q.e,
      img: q.img,
      kind: q.t === 'j' ? 'judge' : 'choice',
    }));
}

// ── 소주제(핵심 내용) 보강: 제목 키워드로 같은 영역 문제 은행에서 관련 기출을 찾아 설명 그림·체크 문제를 늘림 ──

const TITLE_STOPWORDS = new Set([
  '종류', '요령', '기본', '기초', '헷갈리는', '등', '및', '정리', '상식', '원칙', '방법', '구분', '관련', '문제', '내용',
  '사용', '규칙', '순서', '확인', '계획', '대응', '관리', '습관', '처리', '위치', '읽기', '조작', '표시', '거리', '상황',
]);

// 제목 키워드만으로는 놓치는 소주제를 위해 수동으로 보충하는 키워드 (문제 은행의 실제 표현에 맞춤)
const SECTION_EXTRA_KEYWORDS: Record<string, string[]> = {
  '빙설·진흙길·강풍과 미끄러짐': ['눈', '빙판', '결빙', '눈부심', '미끄러', '진흙', '악천후', '물 넘치', '안개'],
  '조치 순서': ['고장', '경고 표지', '행동', '처리', '위험'],
  '탑승자 대피': ['대피', '승객', '이탈', '구조'],
  '견인·구난': ['견인', '구난', '고장 차량'],
  '신고와 2차 사고 예방': ['신고', '2차 사고', '단독 교통사고'],
  '형사책임·면허 재취득 제한': ['형사', '구속', '도주', '사망', '범죄'],
  '벌금·구류·유치(행정처벌)': ['벌금', '구류', '유치', '행정 처벌'],
};

function titleKeywords(title: string): string[] {
  // '·'나 '/'로만 자른 구(띄어쓰기 포함, 예: "차간 거리")는 그대로 쓰고,
  // 그 안의 단어도 함께 쓴다. 구는 점수를 높게 줘서 더 구체적인 소주제가 그림을 가져가게 한다.
  const phrases = title
    .split(/[·/／、,，]+/)
    .map((p) => p.replace(/[()[\]]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length >= 2 && !TITLE_STOPWORDS.has(p));
  const words = phrases
    .flatMap((p) => p.split(' '))
    .filter((w) => w.length >= 2 && !TITLE_STOPWORDS.has(w));
  const extra = SECTION_EXTRA_KEYWORDS[title] ?? [];
  return Array.from(new Set([...phrases, ...words, ...extra]));
}

function matchScore(q: BankQuestion, keywords: string[]): number {
  const hay = `${q.q} ${q.e ?? ''}`;
  // 띄어쓰기가 들어간 구(예: "경고 표지")는 2점, 단어는 1점 — 구체적인 구가 우선
  return keywords.reduce((n, kw) => (hay.includes(kw) ? n + (kw.includes(' ') ? 2 : 1) : n), 0);
}

export type SectionLike = { title: string };

/**
 * 영역 안 모든 소주제의 설명 그림을 한 번에 배정.
 * 그림 문제 하나는 점수가 가장 높은 소주제에만 들어가므로 여러 소주제에 같은 그림이 중복되지 않는다.
 * 캡션은 확실한 문제(판단형 '맞음'·선택형 정답)만 사용.
 */
export function buildSectionGalleries(
  sections: SectionLike[],
  pool: BankQuestion[],
  max = 6,
): Map<string, { img: string; caption: string }[]> {
  const result = new Map<string, { img: string; caption: string }[]>(sections.map((s) => [s.title, []]));
  const targets = sections.map((s) => ({ title: s.title, kws: titleKeywords(s.title) }));
  const seen = new Set<string>();
  for (const q of pool) {
    if (!q.img) continue;
    if (q.t === 'j' && q.a !== 0) continue;
    const img = q.img[0];
    if (seen.has(img)) continue;
    let best = -1;
    let bestScore = 0;
    targets.forEach((t, i) => {
      if (!t.kws.length) return;
      const score = matchScore(q, t.kws);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    if (best < 0) continue;
    const arr = result.get(targets[best].title)!;
    if (arr.length >= max) continue;
    seen.add(img);
    arr.push({ img, caption: q.t === 'j' ? q.q.replace(/\.$/, '') : (q.o?.[q.a] ?? q.q) });
  }
  return result;
}

/** 소주제 체크 문제: 기출 예시 + 키워드로 찾은 같은 영역 기출(그림 문제 우선) */
export function sectionCheckQuestions(
  section: SectionLike,
  examples: BankQuestion[],
  pool: BankQuestion[],
  itemKey: string,
  max = 12,
): CheckQuestion[] {
  const exampleIds = new Set(examples.map((q) => q.id));
  const keywords = titleKeywords(section.title);
  const matched = keywords.length
    ? pool
        .filter((q) => !exampleIds.has(q.id) && matchScore(q, keywords) > 0)
        .sort((a, b) => Number(!!b.img) - Number(!!a.img) || matchScore(b, keywords) - matchScore(a, keywords))
        .slice(0, Math.max(0, max - examples.length))
    : [];
  return bankCheckQuestions([...examples, ...matched], itemKey);
}
