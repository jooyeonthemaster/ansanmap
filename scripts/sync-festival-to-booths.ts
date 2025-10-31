/**
 * Sync Festival Booths to Booths Table
 *
 * 목적: festival_booths 테이블의 데이터를 booths 테이블에 동기화
 *       (부스 목록에 표시되도록)
 *
 * 실행 방법:
 *   npx tsx scripts/sync-festival-to-booths.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// .env.local 파일 로드
config({ path: '.env.local' });

// ===== 설정 =====
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface FestivalBooth {
  booth_number: string;
  program_name: string;
  organization: string;
}

async function main() {
  console.log('🔄 Festival Booths → Booths 동기화 시작\n');
  console.log('='.repeat(50));

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // 1. festival_booths에서 모든 데이터 가져오기
    console.log('\n📂 1단계: festival_booths 데이터 조회');
    const { data: festivalBooths, error: fetchError } = await supabase
      .from('festival_booths')
      .select('booth_number, program_name, organization')
      .order('booth_number', { ascending: true });

    if (fetchError) {
      throw new Error(`데이터 조회 실패: ${fetchError.message}`);
    }

    console.log(`✅ ${festivalBooths?.length || 0}개 부스 발견`);

    if (!festivalBooths || festivalBooths.length === 0) {
      console.log('⚠️ 동기화할 데이터가 없습니다.');
      return;
    }

    // 2. booths 테이블에 이미 있는 부스 번호 확인
    console.log('\n🔍 2단계: 기존 booths 테이블 확인');
    const { data: existingBooths, error: existingError } = await supabase
      .from('booths')
      .select('booth_number')
      .not('booth_number', 'is', null);

    if (existingError) {
      console.warn('⚠️ 기존 데이터 확인 실패:', existingError.message);
    }

    const existingBoothNumbers = new Set(
      existingBooths?.map((b) => b.booth_number).filter(Boolean) || []
    );
    console.log(`✅ 기존 부스: ${existingBoothNumbers.size}개`);

    // 3. 새로 추가할 부스만 필터링
    const boothsToAdd = (festivalBooths as FestivalBooth[]).filter(
      (booth) => !existingBoothNumbers.has(booth.booth_number)
    );

    console.log(`\n➕ 추가할 부스: ${boothsToAdd.length}개`);
    console.log(`⏭️ 건너뛸 부스: ${festivalBooths.length - boothsToAdd.length}개`);

    if (boothsToAdd.length === 0) {
      console.log('✅ 모든 부스가 이미 동기화되어 있습니다.');
      return;
    }

    // 4. booths 테이블에 데이터 삽입
    console.log('\n📤 3단계: booths 테이블에 삽입');

    const boothRecords = boothsToAdd.map((booth) => ({
      name: booth.program_name,
      category: 'activity', // 축제 부스는 모두 activity
      description: booth.organization,
      booth_number: booth.booth_number,
      coordinates: [], // 초기에는 빈 좌표 (관리자가 나중에 설정)
      operating_hours: '축제 기간 중 운영',
      is_active: true,
    }));

    const BATCH_SIZE = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < boothRecords.length; i += BATCH_SIZE) {
      const batch = boothRecords.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('booths')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 실패:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += data?.length || 0;
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 완료: ${data?.length}개`);
      }
    }

    console.log(`\n📊 동기화 결과:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${errorCount}개`);

    if (errorCount > 0) {
      throw new Error(`${errorCount}개의 부스 동기화 실패`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 동기화 완료!\n');
    console.log('이제 "축제 데이터 관리"에서 추가한 부스가');
    console.log('"부스 목록"에도 표시됩니다.\n');
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ 동기화 실패');
    console.error(error);
    process.exit(1);
  }
}

// 실행
main();
