-- Indexes and Row Level Security Policies

-- ============================================================
-- INDEXES — Phase 1 Tables
-- ============================================================

-- buildings
CREATE INDEX idx_buildings_type ON buildings(type);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_district ON buildings(district);
CREATE INDEX idx_buildings_dong ON buildings(dong);
CREATE INDEX idx_buildings_name ON buildings(name);

-- dongs
CREATE INDEX idx_dongs_building_id ON dongs(building_id);

-- units
CREATE INDEX idx_units_building_id ON units(building_id);
CREATE INDEX idx_units_dong_id ON units(dong_id);

-- contacts
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_name ON contacts(name);

-- ownerships
CREATE INDEX idx_ownerships_contact_id ON ownerships(contact_id);
CREATE INDEX idx_ownerships_unit_id ON ownerships(unit_id);
CREATE INDEX idx_ownerships_status ON ownerships(status);

-- external_feeds
CREATE INDEX idx_feeds_article_no ON external_feeds(article_no);
CREATE INDEX idx_feeds_complex ON external_feeds(complex);
CREATE INDEX idx_feeds_ad_type ON external_feeds(ad_type);
CREATE INDEX idx_feeds_dup_status ON external_feeds(dup_status);
CREATE INDEX idx_feeds_check_status ON external_feeds(check_status);
CREATE INDEX idx_feeds_sheet_name ON external_feeds(sheet_name);
CREATE INDEX idx_feeds_synced_at ON external_feeds(synced_at);
CREATE INDEX idx_feeds_transaction_type ON external_feeds(transaction_type);

-- properties
CREATE INDEX idx_properties_unit_id ON properties(unit_id);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_assigned_to ON properties(assigned_to);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_feed_id ON properties(feed_id);
CREATE INDEX idx_properties_check_status ON properties(check_status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_naver_article_no ON properties(naver_article_no);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_is_hidden ON properties(is_hidden);

-- buyer_requirements
CREATE INDEX idx_buyer_req_contact_id ON buyer_requirements(contact_id);
CREATE INDEX idx_buyer_req_assigned_to ON buyer_requirements(assigned_to);
CREATE INDEX idx_buyer_req_status ON buyer_requirements(status);
CREATE INDEX idx_buyer_req_transaction_type ON buyer_requirements(transaction_type);
CREATE INDEX idx_buyer_req_urgency ON buyer_requirements(urgency);

-- consultations
CREATE INDEX idx_consultations_contact_id ON consultations(contact_id);
CREATE INDEX idx_consultations_property_id ON consultations(property_id);
CREATE INDEX idx_consultations_ownership_id ON consultations(ownership_id);
CREATE INDEX idx_consultations_created_by ON consultations(created_by);
CREATE INDEX idx_consultations_date ON consultations(date);

-- insights
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_article_no ON insights(article_no);
CREATE INDEX idx_insights_property_id ON insights(property_id);
CREATE INDEX idx_insights_feed_id ON insights(feed_id);
CREATE INDEX idx_insights_buyer_req_id ON insights(buyer_req_id);
CREATE INDEX idx_insights_created_at ON insights(created_at);

-- tasks
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_property_id ON tasks(property_id);
CREATE INDEX idx_tasks_buyer_req_id ON tasks(buyer_req_id);
CREATE INDEX idx_tasks_insight_id ON tasks(insight_id);
CREATE INDEX idx_tasks_source ON tasks(source);

-- insight_rules
CREATE INDEX idx_insight_rules_user_id ON insight_rules(user_id);

-- sync_logs
CREATE INDEX idx_sync_logs_synced_at ON sync_logs(synced_at);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);

-- ============================================================
-- INDEXES — Phase 2 Tables
-- ============================================================

-- matches
CREATE INDEX idx_matches_buyer_req_id ON matches(buyer_req_id);
CREATE INDEX idx_matches_property_id ON matches(property_id);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_assigned_to ON matches(assigned_to);
CREATE INDEX idx_matches_deal_id ON matches(deal_id);

-- viewings
CREATE INDEX idx_viewings_match_id ON viewings(match_id);
CREATE INDEX idx_viewings_scheduled_at ON viewings(scheduled_at);

-- deals
CREATE INDEX idx_deals_match_id ON deals(match_id);
CREATE INDEX idx_deals_stage ON deals(stage);

-- contracts
CREATE INDEX idx_contracts_deal_id ON contracts(deal_id);
CREATE INDEX idx_contracts_property_id ON contracts(property_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_assigned_to ON contracts(assigned_to);

-- calendar_events
CREATE INDEX idx_calendar_events_start_at ON calendar_events(start_at);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_property_id ON calendar_events(property_id);
CREATE INDEX idx_calendar_events_deal_id ON calendar_events(deal_id);

-- activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_target_type ON activity_logs(target_type);
CREATE INDEX idx_activity_logs_target_id ON activity_logs(target_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- price_history
CREATE INDEX idx_price_history_property_id ON price_history(property_id);
CREATE INDEX idx_price_history_date ON price_history(date);

-- property_media
CREATE INDEX idx_property_media_property_id ON property_media(property_id);
CREATE INDEX idx_property_media_type ON property_media(type);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dongs ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — Authenticated users can read/write all data
-- (사무소 단위 격리는 Phase 2+ 에서 구현)
-- ============================================================

-- Helper: check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Macro for creating standard CRUD policies
-- All authenticated users have full access (same office)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'users','buildings','dongs','units','contacts','ownerships',
      'external_feeds','properties','buyer_requirements','consultations',
      'insights','tasks','insight_rules','sync_logs',
      'matches','viewings','deals','contracts','calendar_events',
      'activity_logs','price_history','property_media'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
      'policy_select_' || tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (true)',
      'policy_insert_' || tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
      'policy_update_' || tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE TO authenticated USING (true)',
      'policy_delete_' || tbl, tbl
    );
  END LOOP;
END;
$$;

-- Service role bypass (for sync jobs, AI pipelines)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'users','buildings','dongs','units','contacts','ownerships',
      'external_feeds','properties','buyer_requirements','consultations',
      'insights','tasks','insight_rules','sync_logs',
      'matches','viewings','deals','contracts','calendar_events',
      'activity_logs','price_history','property_media'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      'policy_service_' || tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- Enable Realtime for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE insights;
ALTER PUBLICATION supabase_realtime ADD TABLE external_feeds;
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
