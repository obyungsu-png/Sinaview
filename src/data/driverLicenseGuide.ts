// FAQ '시험 안내': 과목1 시험 당일 절차, 과목2·3 실기 요령, 과목4 (科目一~四 考试流程及技巧 자료를 한국어로 정리)
export type GuideGroup = { title: string; points: string[] };
export type GuideSection = { title: string; intro?: string; groups: GuideGroup[] };

export const EXAM_GUIDE: GuideSection[] = [];
