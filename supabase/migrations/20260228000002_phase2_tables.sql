-- Phase 2 Tables
-- 매칭 파이프라인, 거래관리, 일정, 활동로그, 가격이력, 미디어

-- ============================================================
-- 1. matches (구매자↔매물 매칭)
-- ============================================================
CREATE TABLE matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 연결
  buyer_req_id    uuid NOT NULL REFERENCES buyer_requirements(id),
  property_id     uuid NOT NULL REFERENCES properties(id),

  -- 진행 상태
  stage           text NOT NULL DEFAULT 'suggested'
                   CHECK (stage IN (
                     'suggested','buyerContacted','viewing',
                     'ownerContacted','negotiating','dealCreated','closed'
                   )),

  -- 구매자 반응
  buyer_interest  text CHECK (buyer_interest IN ('interested','notInterested','pending')),
  buyer_note      text,

  -- 방문
  viewing_date    timestamptz,
  viewed_at       timestamptz,
  viewing_feedback text CHECK (viewing_feedback IN ('interested','notInterested','pending')),
  viewing_note    text,

  -- 판매자 반응
  owner_contacted boolean NOT NULL DEFAULT false,
  owner_response  text CHECK (owner_response IN ('interested','notInterested','pending')),
  owner_note      text,
  owner_asking_price bigint,

  -- Deal 전환
  deal_id         uuid,

  -- 종료
  closed_at       timestamptz,
  closed_reason   text,

  -- 담당자
  assigned_to     uuid NOT NULL REFERENCES users(id),

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE matches IS '구매자↔매물 매칭 파이프라인';
COMMENT ON COLUMN matches.owner_asking_price IS '판매자 희망가 (만원)';

-- ============================================================
-- 2. viewings (방문기록 — 다중 방문 지원)
-- ============================================================
CREATE TABLE viewings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        uuid NOT NULL REFERENCES matches(id),

  -- 일정
  scheduled_at    timestamptz NOT NULL,
  visited_at      timestamptz,

  -- 피드백
  feedback        text CHECK (feedback IN ('interested','notInterested','pending')),
  note            text,

  -- 일정 연동
  calendar_event_id uuid,

  -- 참석자
  attendees       uuid[],

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE viewings IS '방문기록 - 매칭별 다중 방문 지원';

-- ============================================================
-- 3. deals (거래 관리)
-- ============================================================
CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        uuid NOT NULL REFERENCES matches(id),

  stage           text NOT NULL DEFAULT 'selection'
                   CHECK (stage IN (
                     'selection','deposit','contract',
                     'completed','closed','cancelled'
                   )),

  -- 합의 내용
  agreed_price    bigint,
  agreed_conditions text,

  -- 가계약
  deposit_amount  bigint,
  deposit_paid_at timestamptz,

  -- 본계약
  contract_date   date,
  contract_signed_at timestamptz,

  -- 완료
  completion_date date,
  completed_at    timestamptz,

  -- 거래 종료
  closed_at       timestamptz,
  closed_by       uuid REFERENCES users(id),

  -- 중개수수료 (만원)
  commission              bigint,
  commission_from_buyer   bigint,
  commission_from_seller  bigint,

  -- 수수료 정산
  commission_settlements  jsonb,
  settlement_status       text CHECK (settlement_status IN ('pending','partial','completed')),

  -- 기여 추적
  contributions   jsonb,

  -- 체크리스트
  checklist       jsonb,

  -- 공동중개
  is_joint_brokerage boolean NOT NULL DEFAULT false,
  partner_broker  text,
  partner_commission bigint,

  -- 담당자
  assigned_to     uuid[] NOT NULL,

  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE deals IS '거래 관리 - Match에서 전환';
COMMENT ON COLUMN deals.agreed_price IS '합의 금액 (만원)';
COMMENT ON COLUMN deals.commission IS '총 수수료 (만원)';

-- matches.deal_id FK (deferred because deals references matches)
ALTER TABLE matches
  ADD CONSTRAINT fk_matches_deal_id
  FOREIGN KEY (deal_id) REFERENCES deals(id);

-- ============================================================
-- 4. contracts (계약서)
-- ============================================================
CREATE TABLE contracts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 연결
  deal_id         uuid NOT NULL REFERENCES deals(id),
  property_id     uuid NOT NULL REFERENCES properties(id),

  -- 거래 유형
  transaction_type text NOT NULL
                   CHECK (transaction_type IN ('sale','lease','monthly')),

  -- 당사자
  buyer_contact_id  uuid NOT NULL REFERENCES contacts(id),
  seller_contact_id uuid NOT NULL REFERENCES contacts(id),

  -- 금액 (만원)
  total_price     bigint NOT NULL,
  monthly_rent    bigint,

  -- 계약금/중도금/잔금
  deposit_amount  bigint NOT NULL,
  deposit_date    date,
  deposit_paid_at timestamptz,

  middle_payment          bigint,
  middle_payment_date     date,
  middle_payment_paid_at  timestamptz,

  balance_amount  bigint NOT NULL,
  balance_date    date,
  balance_paid_at timestamptz,

  -- 일정
  contract_date   date NOT NULL,
  move_in_date    date,

  -- 기간 (전세/월세)
  lease_start_date date,
  lease_end_date   date,

  -- 특약
  special_terms   text,

  -- 상태
  status          text NOT NULL DEFAULT 'draft'
                   CHECK (status IN (
                     'draft','signed','depositPaid',
                     'balancePaid','registered','cancelled'
                   )),

  -- 수수료
  commission      bigint,
  commission_rate numeric,
  commission_breakdown jsonb,

  -- 공동중개
  is_joint_brokerage boolean NOT NULL DEFAULT false,
  partner_broker_name  text,
  partner_broker_phone text,
  partner_commission   bigint,

  -- 첨부
  attachments     text[],

  -- 템플릿
  template_id     text,

  -- 담당자
  assigned_to     uuid NOT NULL REFERENCES users(id),

  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE contracts IS '계약서 관리';
COMMENT ON COLUMN contracts.total_price IS '총 거래금액 (만원)';

-- ============================================================
-- 5. calendar_events (일정)
-- ============================================================
CREATE TABLE calendar_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  type            text NOT NULL DEFAULT 'other'
                   CHECK (type IN ('meeting','viewing','contract','deadline','other')),
  start_at        timestamptz NOT NULL,
  end_at          timestamptz NOT NULL,
  all_day         boolean NOT NULL DEFAULT false,

  -- 연결
  contact_id      uuid REFERENCES contacts(id),
  property_id     uuid REFERENCES properties(id),
  deal_id         uuid REFERENCES deals(id),
  task_id         uuid REFERENCES tasks(id),
  match_id        uuid REFERENCES matches(id),
  viewing_id      uuid REFERENCES viewings(id),

  -- 참석자
  assigned_to     uuid[] NOT NULL,

  location        text,
  reminder_before int,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE calendar_events IS '일정 관리';
COMMENT ON COLUMN calendar_events.reminder_before IS '알림 시간 (분 단위)';

-- Add FK from viewings and tasks to calendar_events
ALTER TABLE viewings
  ADD CONSTRAINT fk_viewings_calendar_event
  FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_calendar_event
  FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id);

-- ============================================================
-- 6. activity_logs (활동 기록)
-- ============================================================
CREATE TABLE activity_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  type            text NOT NULL,
  description     text NOT NULL,
  target_type     text,
  target_id       uuid,
  target_name     text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE activity_logs IS '활동 기록 (감사 추적)';

-- ============================================================
-- 7. price_history (가격 변동 이력)
-- ============================================================
CREATE TABLE price_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES properties(id),
  price           bigint NOT NULL,
  date            timestamptz NOT NULL DEFAULT now(),
  reason          text CHECK (reason IN ('initial','negotiation','market_adjustment','owner_request')),
  updated_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE price_history IS '가격 변동 이력 (소유자 호가)';
COMMENT ON COLUMN price_history.price IS '가격 (만원)';

-- ============================================================
-- 8. property_media (사진/도면)
-- ============================================================
CREATE TABLE property_media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES properties(id),
  type            text NOT NULL DEFAULT 'photo'
                   CHECK (type IN ('photo','floorPlan','document')),
  url             text NOT NULL,
  file_name       text NOT NULL,
  caption         text,
  sort_order      int NOT NULL DEFAULT 0,
  is_main         boolean NOT NULL DEFAULT false,
  uploaded_by     uuid NOT NULL REFERENCES users(id),
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE property_media IS '매물 사진/도면/문서';

-- ============================================================
-- Phase 2 updated_at 트리거
-- ============================================================
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_viewings_updated_at
  BEFORE UPDATE ON viewings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add deferred FK references from tasks to Phase 2 tables
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_match_id
  FOREIGN KEY (match_id) REFERENCES matches(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_deal_id
  FOREIGN KEY (deal_id) REFERENCES deals(id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_contract_id
  FOREIGN KEY (contract_id) REFERENCES contracts(id);

-- Add deferred FK from consultations to matches
ALTER TABLE consultations
  ADD CONSTRAINT fk_consultations_match_id
  FOREIGN KEY (match_id) REFERENCES matches(id);
