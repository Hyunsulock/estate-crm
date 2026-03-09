-- Phase 1 Core Tables
-- Estate CRM - 부동산 중개 CRM
-- 가격 단위: 만원 (15.8억 = 158000)

-- ============================================================
-- 1. users (사용자)
-- ============================================================
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text,
  phone       text,
  role        text NOT NULL DEFAULT 'user'
               CHECK (role IN ('manager', 'user')),
  avatar      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS '중개사/사용자';
COMMENT ON COLUMN users.role IS 'manager: 관리자, user: 실무자';

-- ============================================================
-- 2. buildings (건물/단지 마스터)
-- ============================================================
CREATE TABLE buildings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN (
               'apartment','officetel','villa','house',
               'commercial','land','living_accommodation')),
  name        text NOT NULL,

  -- 주소 필터링용
  city        text,
  district    text,
  dong        text,
  address     text,

  -- 부가정보
  total_units int,
  built_year  int,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE buildings IS '건물/단지 마스터 - 주소 정규화 + 필터';
COMMENT ON COLUMN buildings.name IS '단지명/건물명 (고덕그라시움, OO빌라)';
COMMENT ON COLUMN buildings.city IS '시 필터 (서울시)';
COMMENT ON COLUMN buildings.district IS '구 필터 (강동구)';
COMMENT ON COLUMN buildings.dong IS '동 필터 (고덕동)';

-- ============================================================
-- 3. dongs (동)
-- ============================================================
CREATE TABLE dongs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES buildings(id),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE dongs IS '건물 동 (104동, A동 등)';

-- ============================================================
-- 4. units (호실)
-- ============================================================
CREATE TABLE units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES buildings(id),
  dong_id     uuid REFERENCES dongs(id),
  name        text NOT NULL,
  area        numeric,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE units IS '호실 - 토지: dong_id=null, name=본필지 / 주택: name=본채 / 상가: name=201호';
COMMENT ON COLUMN units.area IS '전용면적 (평)';

-- ============================================================
-- 5. contacts (연락처 — 소유주/고객 통합)
-- ============================================================
CREATE TABLE contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text NOT NULL,
  phone2      text,
  email       text,
  notes       text,
  tags        text[],
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE contacts IS '연락처 - 소유주/고객 통합 관리';

-- ============================================================
-- 6. ownerships (소유관계)
-- ============================================================
CREATE TABLE ownerships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid NOT NULL REFERENCES contacts(id),
  unit_id     uuid NOT NULL REFERENCES units(id),
  status      text DEFAULT 'active' CHECK (status IN ('active','sold')),
  start_date  date,
  end_date    date,
  share_ratio numeric,
  is_resident boolean,
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE ownerships IS '연락처↔호실 소유관계';
COMMENT ON COLUMN ownerships.share_ratio IS '지분율 (%)';
COMMENT ON COLUMN ownerships.is_resident IS '본인 거주 여부';

-- ============================================================
-- 7. external_feeds (네이버 크롤링 시트 데이터)
-- ============================================================
CREATE TABLE external_feeds (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 식별 (B~D, I)
  ad_type             text,
  rep_article_no      text,
  article_no          text NOT NULL,
  realtor_id          text,

  -- 상태 (E~H)
  status              text,
  dup_status          text,
  ad_status           text,
  dup_ad_status       text,

  -- 물건 정보 (J~R, Y)
  transaction_type    text,
  complex             text NOT NULL,
  dong                text,
  ho                  text,
  floor               text,
  unit_type           text,
  area_m2             numeric,
  supply_area         numeric,
  direction           text,

  -- 가격 (S~X) 만원 단위
  monthly_rent        bigint,
  monthly_rent_min    bigint,
  monthly_rent_max    bigint,
  price               bigint NOT NULL,
  price_min           bigint,
  price_max           bigint,

  -- 확인/검증 (K, Z, AD, AE)
  check_status        text,
  confirmed_at        text,
  individual_check    text,
  check_result        text,

  -- 부가정보 (AA~AC, AF~AH)
  features            text,
  cp_company          text,
  dup_order           int,
  dup_count           int,
  link                text,
  realtor_name        text,

  -- 내 광고 (AI~AL)
  my_ad_rank          text,
  floor_exposed       text,
  price_compare       text,
  memo                text,

  -- 시스템
  sheet_name          text NOT NULL,
  sheet_row           int,
  synced_at           timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE(article_no)
);

COMMENT ON TABLE external_feeds IS '네이버 크롤링 시트 데이터 - 시트 38컬럼 전체 매핑';
COMMENT ON COLUMN external_feeds.ad_type IS 'B: 대표|중복';
COMMENT ON COLUMN external_feeds.rep_article_no IS 'C: 대표매물번호';
COMMENT ON COLUMN external_feeds.article_no IS 'D: 매물번호';
COMMENT ON COLUMN external_feeds.check_status IS 'K: 미확인|확인|계약중|보류|완료';
COMMENT ON COLUMN external_feeds.price IS '가격 (만원)';

-- ============================================================
-- 8. properties (내부 매물장) — 핵심 테이블
-- ============================================================
CREATE TABLE properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 위치 연결 (필수)
  unit_id         uuid NOT NULL REFERENCES units(id),

  -- 거래 정보
  type            text NOT NULL DEFAULT 'apartment'
                   CHECK (type IN ('apartment','officetel','villa','house','commercial','land')),
  transaction_type text NOT NULL
                   CHECK (transaction_type IN ('sale','lease','monthly')),
  status          text NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','in_progress','reserved','contracted','cancelled')),

  -- 면적/구조
  unit_type       text,
  area            numeric,
  supply_area     numeric,
  floor           int,
  total_floors    int,
  direction       text,

  -- 가격 (만원)
  price           bigint NOT NULL,
  monthly_rent    bigint,
  initial_price   bigint,
  price_change_percent numeric,

  -- 소유주
  owner_name      text NOT NULL,
  owner_phone     text NOT NULL,
  owner_phone2    text,
  owner_id        uuid REFERENCES contacts(id),

  -- 세입자/입주
  has_tenant      boolean NOT NULL DEFAULT false,
  tenant_deposit  bigint,
  tenant_rent     bigint,
  tenant_lease_end text,
  move_in_date    text,
  move_in_type    text DEFAULT 'negotiable'
                   CHECK (move_in_type IN ('immediate','date','negotiable')),

  -- 관리
  assigned_to     uuid NOT NULL REFERENCES users(id),
  memo            text,
  tags            text[],
  info_verified_at timestamptz,
  is_hidden       boolean NOT NULL DEFAULT false,

  -- 확인 상태
  check_status    text NOT NULL DEFAULT 'unverified'
                   CHECK (check_status IN ('unverified','verified','in_contract','hold','done')),

  -- 광고 정보
  ad_rank         text,
  ad_price        bigint,
  ad_listed_at    date,
  price_compare   text,
  floor_exposed   boolean,
  naver_article_no text,

  -- 외부 데이터 연결
  feed_id         uuid REFERENCES external_feeds(id),

  -- 네트워크
  is_shared_in_network boolean NOT NULL DEFAULT false,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE properties IS '내부 매물장 - 핵심 테이블, 구글시트 매물장을 대체';
COMMENT ON COLUMN properties.price IS '매매가/보증금 (만원)';
COMMENT ON COLUMN properties.monthly_rent IS '월세 (만원)';
COMMENT ON COLUMN properties.initial_price IS '최초 등록 가격 (만원)';
COMMENT ON COLUMN properties.price_change_percent IS '최초 대비 변동률 (%)';
COMMENT ON COLUMN properties.unit_type IS '82A, 100A 등';
COMMENT ON COLUMN properties.area IS '전용면적 (평)';
COMMENT ON COLUMN properties.supply_area IS '공급면적 (평)';
COMMENT ON COLUMN properties.info_verified_at IS '정보 확인일';
COMMENT ON COLUMN properties.check_status IS '시트 K컬럼 매핑';
COMMENT ON COLUMN properties.ad_rank IS '16/47 (내 랭킹/전체)';
COMMENT ON COLUMN properties.ad_price IS '광고에 올린 가격 (만원)';
COMMENT ON COLUMN properties.price_compare IS '(나)23.5/23 ▼0.5[신](0일전)';
COMMENT ON COLUMN properties.naver_article_no IS '네이버 매물번호';
COMMENT ON COLUMN properties.tenant_deposit IS '세입자 보증금 (만원)';
COMMENT ON COLUMN properties.tenant_rent IS '세입자 월세 (만원)';
COMMENT ON COLUMN properties.tenant_lease_end IS '2025년 3월';
COMMENT ON COLUMN properties.move_in_date IS '즉시, 2월 중순, 협의';

-- ============================================================
-- 9. buyer_requirements (구매고객 희망조건)
-- ============================================================
CREATE TABLE buyer_requirements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        uuid NOT NULL REFERENCES contacts(id),
  transaction_type  text NOT NULL
                     CHECK (transaction_type IN ('sale','lease','monthly')),
  areas             text[],
  property_types    text[],
  budget_min        bigint,
  budget_max        bigint,
  monthly_rent_max  bigint,
  area_min          numeric,
  area_max          numeric,
  preferences       text,
  must_conditions   text[],
  prefer_conditions text[],
  urgency           text NOT NULL DEFAULT 'normal'
                     CHECK (urgency IN ('urgent','normal','flexible')),
  status            text NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','matched','completed','inactive')),
  assigned_to       uuid NOT NULL REFERENCES users(id),
  memo              text,
  last_contact_date timestamptz,
  next_contact_date timestamptz,
  move_in_deadline  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE buyer_requirements IS '구매고객 희망조건';
COMMENT ON COLUMN buyer_requirements.areas IS '희망 지역 (고덕그라시움, 강동구)';
COMMENT ON COLUMN buyer_requirements.property_types IS '희망 매물 유형 (apartment)';
COMMENT ON COLUMN buyer_requirements.budget_min IS '최소 예산 (만원)';
COMMENT ON COLUMN buyer_requirements.budget_max IS '최대 예산 (만원)';
COMMENT ON COLUMN buyer_requirements.monthly_rent_max IS '최대 월세 (만원)';
COMMENT ON COLUMN buyer_requirements.area_min IS '최소 면적 (평)';
COMMENT ON COLUMN buyer_requirements.area_max IS '최대 면적 (평)';
COMMENT ON COLUMN buyer_requirements.preferences IS '자유 텍스트 (남향, 학군 등)';

-- ============================================================
-- 10. consultations (상담기록)
-- ============================================================
CREATE TABLE consultations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES contacts(id),
  ownership_id    uuid REFERENCES ownerships(id),
  property_id     uuid REFERENCES properties(id),
  match_id        uuid,
  type            text DEFAULT 'call'
                   CHECK (type IN ('call','visit','message','email','other')),
  date            timestamptz NOT NULL DEFAULT now(),
  content         text NOT NULL,
  result          text
                   CHECK (result IN ('interested','rejected','pending','price_inquiry','callback','other')),
  next_contact_date timestamptz,
  desired_price   bigint,
  created_by      uuid NOT NULL REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE consultations IS '상담기록';
COMMENT ON COLUMN consultations.desired_price IS '희망가격 (만원)';
COMMENT ON COLUMN consultations.match_id IS 'Phase 2에서 matches 테이블 참조';

-- ============================================================
-- 11. insights (AI/알고리즘 감지 기록)
-- ============================================================
CREATE TABLE insights (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL
                   CHECK (type IN (
                     'new_listing',
                     'price_change',
                     'verify_expired',
                     'rank_change',
                     'buyer_match',
                     'duplicate_suspect'
                   )),
  status          text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','dismissed','snoozed')),

  -- 관련 엔티티
  article_no      text,
  property_id     uuid REFERENCES properties(id),
  feed_id         uuid REFERENCES external_feeds(id),
  buyer_req_id    uuid REFERENCES buyer_requirements(id),

  -- type별 컨텍스트 값
  price           bigint,
  old_price       bigint,
  rank            text,
  old_rank        text,
  days_since      int,

  -- 내용
  title           text NOT NULL,
  summary         text,
  ai_analysis     jsonb,

  -- 무시/스누즈
  dismissed_reason text,
  snoozed_until   timestamptz,

  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE insights IS 'AI/알고리즘 감지 기록';
COMMENT ON COLUMN insights.type IS 'new_listing: 신규매물, price_change: 가격변동, verify_expired: 확인일경과, rank_change: 랭킹변화, buyer_match: 고객매칭, duplicate_suspect: 중복의심';
COMMENT ON COLUMN insights.article_no IS '네이버 매물번호 (핵심 식별자)';
COMMENT ON COLUMN insights.price IS 'price_change: 감지된 가격 (만원)';
COMMENT ON COLUMN insights.old_price IS 'price_change: 이전 가격 (만원)';
COMMENT ON COLUMN insights.days_since IS 'verify_expired: 경과일수';

-- ============================================================
-- 12. tasks (업무/할일)
-- ============================================================
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  category        text NOT NULL
                   CHECK (category IN (
                     'property','buyer','match','deal','contract',
                     'consultation','viewing','admin','other',
                     'advertisement','call','document','verify'
                   )),
  priority        text NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('urgent','high','medium','low')),
  status          text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','in_progress','completed','cancelled')),
  assigned_to     uuid NOT NULL REFERENCES users(id),
  assigned_by     uuid REFERENCES users(id),
  due_date        date,
  due_time        text,
  property_id     uuid REFERENCES properties(id),
  buyer_req_id    uuid REFERENCES buyer_requirements(id),
  match_id        uuid,
  deal_id         uuid,
  contract_id     uuid,
  calendar_event_id uuid,

  -- AI/자동 생성
  source          text NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('manual','system','ai')),
  insight_id      uuid REFERENCES insights(id),
  feed_id         uuid REFERENCES external_feeds(id),

  completed_at    timestamptz,
  completed_by    uuid REFERENCES users(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tasks IS '업무/할일 관리';
COMMENT ON COLUMN tasks.source IS 'manual: 수동, system: 시스템, ai: AI 생성';

-- ============================================================
-- 13. insight_rules (사용자별 감지 규칙 설정)
-- ============================================================
CREATE TABLE insight_rules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id),
  insight_type text NOT NULL,
  action       text NOT NULL DEFAULT 'manual'
                CHECK (action IN ('auto','manual','off')),
  config       jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, insight_type)
);

COMMENT ON TABLE insight_rules IS '사용자별 감지 규칙 설정';
COMMENT ON COLUMN insight_rules.action IS 'auto: 자동 task 생성, manual: 사용자 승인 후, off: 감지 끄기';
COMMENT ON COLUMN insight_rules.config IS 'type별 설정값 (예: { "days": 6 })';

-- ============================================================
-- 14. sync_logs (동기화 이력)
-- ============================================================
CREATE TABLE sync_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id     text NOT NULL,
  sheet_name   text NOT NULL,
  rows_fetched int NOT NULL DEFAULT 0,
  rows_new     int NOT NULL DEFAULT 0,
  rows_changed int NOT NULL DEFAULT 0,
  status       text NOT NULL
                CHECK (status IN ('success','partial','error')),
  error_msg    text,
  synced_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE sync_logs IS '구글시트 동기화 이력';

-- ============================================================
-- properties_full VIEW
-- ============================================================
CREATE VIEW properties_full AS
SELECT p.*,
       b.name AS building_name, b.city, b.district, b.dong AS area_dong,
       b.type AS building_type, b.address,
       d.name AS dong_name,
       u.name AS unit_name, u.area AS unit_area
FROM properties p
JOIN units u ON p.unit_id = u.id
LEFT JOIN dongs d ON u.dong_id = d.id
JOIN buildings b ON u.building_id = b.id;

COMMENT ON VIEW properties_full IS '매물 조회 시 주소/단지 정보 포함';

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ownerships_updated_at
  BEFORE UPDATE ON ownerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_buyer_requirements_updated_at
  BEFORE UPDATE ON buyer_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_insight_rules_updated_at
  BEFORE UPDATE ON insight_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
