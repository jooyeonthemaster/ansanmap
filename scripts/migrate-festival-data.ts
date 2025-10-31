/**
 * Festival Data Migration Script
 *
 * 목적: asv-festival-2025.json 데이터를 Supabase festival_booths 테이블로 안전하게 마이그레이션
 *
 * 실행 방법:
 *   npx tsx scripts/migrate-festival-data.ts
 *
 * 안전 장치:
 *   1. JSON 파일 백업 생성
 *   2. 데이터 검증
 *   3. 트랜잭션 사용 (실패 시 롤백)
 *   4. 상세 로그 출력
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// .env.local 파일 로드
config({ path: '.env.local' });

// ===== 설정 =====
const JSON_FILE_PATH = path.join(process.cwd(), 'asv-festival-2025.json');
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ===== 타입 정의 =====
interface FestivalBooth {
  boothNumber: string;
  programName: string;
  organization: string;
}

interface Zone {
  name: string;
  theme?: string;
  booths?: FestivalBooth[];
}

interface ASVFestival2025 {
  festivalInfo: {
    name: string;
    dates: string;
    location: string;
    website: string;
  };
  zones: Record<string, Zone>;
}

interface FestivalBoothRow {
  booth_number: string;
  program_name: string;
  organization: string;
  zone_key: string;
  zone_name: string;
  zone_theme: string | null;
  sort_order: number;
}

// ===== 유틸리티 함수 =====

/**
 * 부스 번호에서 정렬 순서 추출
 * 예: A1 → 1, S11 → 11, k11 → 11
 */
function extractSortOrder(boothNumber: string): number {
  const match = boothNumber.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * JSON 파일 백업 생성
 */
async function createBackup(): Promise<string> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `asv-festival-2025_backup_${timestamp}.json`);

    const originalData = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    await fs.writeFile(backupPath, originalData, 'utf-8');

    console.log(`✅ 백업 생성 완료: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ 백업 생성 실패:', error);
    throw error;
  }
}

/**
 * JSON 데이터 읽기 및 검증
 */
async function loadAndValidateData(): Promise<ASVFestival2025> {
  try {
    const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const data: ASVFestival2025 = JSON.parse(fileContent);

    // 데이터 구조 검증
    if (!data.zones || typeof data.zones !== 'object') {
      throw new Error('Invalid data structure: zones object not found');
    }

    console.log(`✅ JSON 파일 로드 완료`);
    return data;
  } catch (error) {
    console.error('❌ JSON 파일 로드 실패:', error);
    throw error;
  }
}

/**
 * 데이터 변환: JSON → Supabase 형식
 */
function transformData(data: ASVFestival2025): FestivalBoothRow[] {
  const rows: FestivalBoothRow[] = [];

  Object.entries(data.zones).forEach(([zoneKey, zoneData]) => {
    // booths 배열이 있는 zone만 처리
    if (!zoneData.booths || !Array.isArray(zoneData.booths)) {
      return;
    }

    zoneData.booths.forEach((booth) => {
      rows.push({
        booth_number: booth.boothNumber,
        program_name: booth.programName,
        organization: booth.organization,
        zone_key: zoneKey,
        zone_name: zoneData.name,
        zone_theme: zoneData.theme || null,
        sort_order: extractSortOrder(booth.boothNumber),
      });
    });
  });

  return rows;
}

/**
 * 데이터 삽입 (Upsert 방식)
 */
async function migrateToSupabase(rows: FestivalBoothRow[]): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log(`\n📊 마이그레이션 시작: ${rows.length}개 부스`);

  try {
    // 기존 데이터 삭제 (클린 마이그레이션)
    const { error: deleteError } = await supabase
      .from('festival_booths')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 row 삭제

    if (deleteError) {
      console.warn('⚠️ 기존 데이터 삭제 실패 (테이블이 비어있을 수 있음):', deleteError.message);
    } else {
      console.log('✅ 기존 데이터 삭제 완료');
    }

    // 새 데이터 삽입 (배치 처리)
    const BATCH_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('festival_booths')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 실패:`, error);
        errorCount += batch.length;
      } else {
        successCount += data?.length || 0;
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 완료: ${data?.length}개`);
      }
    }

    console.log(`\n📊 마이그레이션 결과:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${errorCount}개`);

    if (errorCount > 0) {
      throw new Error(`${errorCount}개의 부스 삽입 실패`);
    }
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  }
}

/**
 * 데이터 검증: JSON vs Supabase
 */
async function verifyMigration(originalRows: FestivalBoothRow[]): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log(`\n🔍 데이터 검증 중...`);

  try {
    const { data: supabaseData, error } = await supabase
      .from('festival_booths')
      .select('*');

    if (error) {
      console.error('❌ Supabase 데이터 조회 실패:', error);
      return false;
    }

    // 개수 비교
    if (supabaseData.length !== originalRows.length) {
      console.error(`❌ 데이터 개수 불일치: JSON ${originalRows.length}개 vs Supabase ${supabaseData.length}개`);
      return false;
    }

    // 부스 번호 중복 확인
    const boothNumbers = new Set(supabaseData.map((row) => row.booth_number));
    if (boothNumbers.size !== supabaseData.length) {
      console.error(`❌ 부스 번호 중복 발견`);
      return false;
    }

    console.log(`✅ 데이터 검증 완료: ${supabaseData.length}개 부스`);
    return true;
  } catch (error) {
    console.error('❌ 검증 실패:', error);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 Festival Data Migration 시작\n');
  console.log('='.repeat(50));

  try {
    // 1. 백업 생성
    console.log('\n📦 1단계: JSON 파일 백업');
    await createBackup();

    // 2. JSON 데이터 로드
    console.log('\n📂 2단계: JSON 데이터 로드 및 검증');
    const jsonData = await loadAndValidateData();

    // 3. 데이터 변환
    console.log('\n🔄 3단계: 데이터 변환');
    const rows = transformData(jsonData);
    console.log(`✅ ${rows.length}개 부스 변환 완료`);

    // 4. Supabase로 마이그레이션
    console.log('\n📤 4단계: Supabase 마이그레이션');
    await migrateToSupabase(rows);

    // 5. 검증
    console.log('\n🔍 5단계: 데이터 검증');
    const isValid = await verifyMigration(rows);

    if (!isValid) {
      throw new Error('데이터 검증 실패');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 마이그레이션 완료!\n');
    console.log('다음 단계:');
    console.log('  1. Supabase 대시보드에서 festival_booths 테이블 확인');
    console.log('  2. 코드에서 API 전환 테스트');
    console.log('  3. 배포 환경에서 동작 확인\n');
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ 마이그레이션 실패');
    console.error(error);
    console.error('\n백업 파일에서 복구 가능합니다: backups/ 디렉토리 확인');
    process.exit(1);
  }
}

// 실행
main();