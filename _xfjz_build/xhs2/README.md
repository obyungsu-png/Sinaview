# 학법 감점 xhs 앱 스크린샷 문제 추가 (2026-11)

`xhs_questions.pdf`(앱 시험 화면 1122쪽)를 OCR해서 학법 감점 데이터에 문제를 더하고 실전 고사를 다시 짠 스크립트와 결정 파일.

- `tools/ocr_all.py` → `parse.py` → `infer.py` → `split.py`: OCR, 화면 파싱, 같은 문제 묶기, 기존 학법·필기·만점 은행과 맞추기(A=학법 중복, B=다른 은행에 있음, C=새 문제)
- `tools/crop2.py`: 보기 아래 ~ 下一题 버튼 위 그림 자르기
- `dec/d0*.py`: 새 문제(C) 정답·주제·한국어·해설, `dec/b_fix.py`: B 정답 바로잡기(2022 벌점 기준·그림)
- `dec/r*.py`, `dec/e*.py`: 기존 학법 422문제 한국어·해설 다시 쓰기
- `tools/build_xf2.py`: `src/data/driverLicenseXuefa.json`·`driverLicenseXuefaWords.json` 생성 (실전 고사: 판단 5·단선 10·다선 5, 사진 5~7장)

경로는 작업 환경(스크래치패드) 기준이라 다시 돌릴 때는 인자로 넘기는 경로를 맞춰야 합니다.
