-- 007_rls_and_indexes.sql: Supabase Row-Level Security (RLS) Policies and Functions

-- Enable RLS on all operational tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_eligible_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_eligible_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_point_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE poster_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check User Belongs to Organization
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public Read Policies for Public Programs & Announced Results
CREATE POLICY "Public can view active organizations"
  ON organizations FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Public can view active categories and divisions"
  ON program_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active program divisions"
  ON program_divisions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view published programs"
  ON programs FOR SELECT
  USING (is_public_visible = true AND status NOT IN ('DRAFT', 'CANCELLED'));

CREATE POLICY "Public can view announced results"
  ON program_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_results.program_id 
      AND programs.status = 'ANNOUNCED' 
      AND programs.is_public_visible = true
    )
  );

CREATE POLICY "Public can view groups"
  ON groups FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Public can view announced posters"
  ON generated_posters FOR SELECT
  USING (true);

-- Authenticated Organization Members Policy
CREATE POLICY "Org members have full access to their organization data"
  ON profiles FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to academic classes"
  ON academic_classes FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to divisions"
  ON divisions FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to students"
  ON students FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to groups"
  ON groups FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to programs"
  ON programs FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "Org members have full access to participants"
  ON program_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_participants.program_id 
      AND programs.organization_id = current_user_org_id()
    )
  );

CREATE POLICY "Org members have full access to scores"
  ON judge_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = judge_scores.program_id 
      AND programs.organization_id = current_user_org_id()
    )
  );

CREATE POLICY "Org members have full access to results"
  ON program_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_results.program_id 
      AND programs.organization_id = current_user_org_id()
    )
  );

CREATE POLICY "Org members have full access to audit logs"
  ON audit_logs FOR ALL
  USING (organization_id = current_user_org_id());
