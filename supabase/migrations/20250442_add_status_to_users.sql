-- Add status column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'basic';

-- Add check constraint to ensure status is one of the allowed values
ALTER TABLE users 
  ADD CONSTRAINT users_status_check 
  CHECK (status IN ('basic', 'premium', 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

-- Create function to be used in RLS policies
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT status = 'admin' 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow admins to access all tables with the admin_access policy
CREATE POLICY admin_access ON users FOR ALL TO authenticated USING (
  is_admin() OR id = auth.uid()
);

-- Any user can read their own data
CREATE POLICY user_read_own_data ON users FOR SELECT TO authenticated USING (
  id = auth.uid()
);

-- Only admin users can modify status
CREATE POLICY admin_modify_status ON users FOR UPDATE TO authenticated USING (
  is_admin()
) WITH CHECK (
  is_admin()
);

-- Add default admin user if needed (optional, can be commented out)
-- In a real system, you would handle this differently
-- INSERT INTO users (id, status)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
-- ON CONFLICT (id) DO UPDATE SET status = 'admin';
