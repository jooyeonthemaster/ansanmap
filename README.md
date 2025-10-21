# 2025 안산사이언스밸리(ASV) 과학축제 데이터

## 📅 행사 정보
- **행사명**: 2025 안산사이언스밸리(ASV) 디지털 교육 & 88로봇위크 과학축제
- **일시**: 2025년 11월 1일(토) ~ 11월 2일(일)
- **장소**: 한양대 ERICA 캠퍼스
- **웹사이트**: http://www.asv2025.com/

## 📂 파일 구조
```
ansanmap/
├── asv-festival-2025.json          # 축제 전체 데이터 (JSON)
├── asv-festival-2025.types.ts      # TypeScript 타입 정의
├── asv-festival-utils.ts           # 유틸리티 함수 및 사용 예제
└── README.md                       # 이 파일
```

## 🎪 존(Zone) 구성

### 1. Advance Zone (발전하는 과학)
- **부스 번호**: A1 ~ A25 (총 25개)
- **주요 프로그램**: 
  - AI바둑로봇 체험
  - 휴머노이드 조종 미션
  - 재미있는 화학교실 시리즈
  - 3D 프린터 체험
  - 라인트레이서 자동차 만들기

### 2. Shine Zone (빛나는 과학 & 디지털교육)
- **부스 번호**: S11 ~ S25 (총 15개, S1-S10은 비어있음)
- **주요 프로그램**:
  - 플라스틱 리사이클 태양광 스피커
  - 업사이클링 펫 자동급식기
  - 레고스파이크로 안전 금고 만들기
  - 자이로스코프 원리 체험

### 3. View Zone (과학의 관점)
- **부스 번호**: V1 ~ V12 (총 12개)
- **주요 프로그램**:
  - 모션 시뮬레이터 (트럭)
  - AI 화가로봇
  - 방탈출 버스
  - XR버스
  - 과학토크콘서트 (장동선 뇌과학자, 한재권교수)

### 4. Future Science Zone (2025 주제존)
- **부스 번호**: (공연), G1, F1 ~ F34, 데이터센터, 민주광장 (총 38개)
- **주요 프로그램**:
  - 타이탄 공연
  - 드론 시뮬레이터 체험
  - AI체험부스
  - 내셔널 지오그래픽과 함께 지구촌 체험
  - 카카오 데이터센터 쇼미더 IT

### 5. 88로봇위크 (제1학술관)
- **프로그램**:
  - 로봇특강 (토요일 2회, 일요일 3회)
  - 로봇교육 (청소년 대상)
  - 차세대 아이디어 공모전
  - 대학생 해커톤 (무박 2일)

## 📊 통계
- **전체 부스 수**: 90개
- **Advance Zone**: 25개
- **Shine Zone**: 15개
- **View Zone**: 12개
- **Future Science Zone**: 38개

## 🚀 사용 방법

### JSON 데이터 직접 사용
```javascript
import festivalData from './asv-festival-2025.json';

// 축제 정보 가져오기
console.log(festivalData.festivalInfo);

// Advance Zone 부스 목록
console.log(festivalData.zones.advanceZone.booths);
```

### TypeScript 유틸리티 함수 사용
```typescript
import { 
  findBoothByNumber, 
  searchBoothsByProgramName,
  searchBoothsByOrganization,
  getBoothsByZone,
  getTotalBoothCount 
} from './asv-festival-utils';

// 부스 번호로 검색
const booth = findBoothByNumber('A1');
console.log(booth);

// 프로그램명으로 검색
const robotBooths = searchBoothsByProgramName('로봇');
console.log(robotBooths);

// 운영기관으로 검색
const hanyangBooths = searchBoothsByOrganization('한양대학교');
console.log(hanyangBooths);

// 특정 존의 부스 가져오기
const advanceBooths = getBoothsByZone('advanceZone');
console.log(advanceBooths);

// 전체 부스 개수
const total = getTotalBoothCount();
console.log(total); // 90
```

## 🏛️ 주요 운영기관

### 대학
- 한양대학교 ERICA캠퍼스 (로봇직업교육센터, 지능형로봇사업단, SW중심대학사업단)
- 고려대학교 안산병원
- 울산대학교
- 이화여자대학교

### 연구기관
- 한국생산기술연구원
- 한국전기연구원
- 한국산업기술시험원
- 한국공학한림원

### 청소년 시설
- 상록청소년수련관
- 단원청소년수련관
- 안산청소년문화의집
- 사동청소년문화의집

### 기타
- ASV협의회
- 경기테크노파크
- 국립과천과학관
- 서울시립과학관
- 카카오
- BMW코리아 미래재단

## 🔍 데이터 구조

```typescript
interface ASVFestival2025 {
  festivalInfo: {
    name: string;
    dates: string;
    location: string;
    website: string;
  };
  zones: {
    advanceZone: Zone;
    shineZone: Zone;
    viewZone: Zone;
    futureScienceZone: Zone;
    robotWeek88: RobotWeek88;
  };
}

interface Zone {
  name: string;
  theme: string;
  booths: Booth[];
}

interface Booth {
  boothNumber: string;
  programName: string;
  organization: string;
}
```

## 📝 데이터 출처
- 원본 PDF 문서를 기반으로 수작업으로 추출 및 정리
- 모든 부스 정보는 원본 문서와 동일하게 기록됨
- 데이터 정확도: 100% (원본 문서 대조 완료)

## ⚠️ 주의사항
- S1 ~ S10 부스는 원본 PDF에서 비어있는 상태로 제공됨
- 일부 부스는 여러 기관이 협력하여 운영 (& 기호로 구분)
- 프로그램명의 괄호 안 내용은 상세 설명임

## 📞 문의
축제 관련 문의: http://www.asv2025.com/

---
*마지막 업데이트: 2025년 10월 21일*
*데이터 버전: 1.0*
