-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_runs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to jobs
CREATE POLICY "Authenticated users can view jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to view tracker runs
CREATE POLICY "Authenticated users can view tracker_runs"
  ON tracker_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tracker_runs"
  ON tracker_runs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow the anon key to insert (for the server-side tracker cron)
CREATE POLICY "Anon can manage jobs"
  ON jobs FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage tracker_runs"
  ON tracker_runs FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
