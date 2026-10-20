# 잔상 (afterimage, 가칭)

버려질 신진 작가·예술 전공생 작품을 '기획전' 형식의 온라인 쇼룸으로 다시 보여주고 대신 파는 큐레이션 커머스 — **프론트 MVP 프로토타입**.

배포: https://orialthq.github.io/afterimage/

## 화면
- `/` 포털 진입: 스크롤하면 어둠 속 빛나는 문으로 빨려 들어가 기획전 복도로 입장
- `/ex/vol-01` 3D 전시장: 스크롤/터치로 걷기, 작품 클릭 시 가까이 다가가 정보 패널. `목록으로 보기` 2D 폴백
- 작품 패널: 폐기 D-day 구조 / 내림 경매 / 상시 판매, 하트·공유, N번째 소장자 → 소장 증명서(4:5 PNG)
- 도슨트: 카탈로그 기반 규칙 엔진(`src/lib/docent.ts`), 같은 인터페이스로 LLM 교체 예정
- `/drops` 드롭 일정 + 오픈 알림, `/submit` 작가 입점 4단계 + 쇼룸 미리보기

## 스택
Vite + React 18 + TypeScript strict + Tailwind CSS 4 + three.js (@react-three/fiber, drei, postprocessing). 100% 정적, GitHub Pages.

## 실행
```bash
npm i
npm run dev
```

## 주의
작가·작품은 모두 가상 샘플. 작품 이미지는 시드 기반으로 캔버스에 그린 것(`src/lib/artgen.ts`). 결제 없음, 상태는 localStorage.
