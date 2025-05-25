 -- Create pet_activities table
CREATE TABLE IF NOT EXISTS pet_activities (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('walk', 'meal', 'medication', 'vet-visit', 'grooming', 'play')),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  distance REAL, -- in kilometers
  calories INTEGER, -- estimated calories burned/consumed
  activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_activities_pet_id ON pet_activities(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_activities_user_id ON pet_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_activities_date ON pet_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_pet_activities_type ON pet_activities(type);
CREATE INDEX IF NOT EXISTS idx_pet_activities_user_date ON pet_activities(user_id, activity_date);

-- Enable Row Level Security
ALTER TABLE pet_activities ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Users can only see activities for their own pets
CREATE POLICY "Users can view their own pet activities" ON pet_activities
  FOR SELECT USING (
    user_id = auth.uid() OR 
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

-- Policy for INSERT: Users can only create activities for their own pets
CREATE POLICY "Users can create activities for their own pets" ON pet_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

-- Policy for UPDATE: Users can only update their own activities
CREATE POLICY "Users can update their own pet activities" ON pet_activities
  FOR UPDATE USING (
    user_id = auth.uid()
  ) WITH CHECK (
    user_id = auth.uid() AND
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

-- Policy for DELETE: Users can only delete their own activities
CREATE POLICY "Users can delete their own pet activities" ON pet_activities
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_pet_activities_updated_at 
  BEFORE UPDATE ON pet_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get today's activity stats for a user
CREATE OR REPLACE FUNCTION get_today_activity_stats(target_user_id UUID DEFAULT auth.uid(), target_pet_id TEXT DEFAULT NULL)
RETURNS TABLE (
  total_walks BIGINT,
  total_distance REAL,
  total_meals BIGINT,
  total_activities BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE type = 'walk') as total_walks,
    COALESCE(SUM(distance) FILTER (WHERE type = 'walk'), 0) as total_distance,
    COUNT(*) FILTER (WHERE type = 'meal') as total_meals,
    COUNT(*) as total_activities
  FROM pet_activities 
  WHERE 
    user_id = target_user_id AND
    activity_date >= CURRENT_DATE AND 
    activity_date < CURRENT_DATE + INTERVAL '1 day' AND
    (target_pet_id IS NULL OR pet_id = target_pet_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the stats function
GRANT EXECUTE ON FUNCTION get_today_activity_stats(UUID, TEXT) TO authenticated;

-- Create function to get recent activities with pet names
CREATE OR REPLACE FUNCTION get_recent_activities_with_pets(
  target_user_id UUID DEFAULT auth.uid(), 
  target_pet_id TEXT DEFAULT NULL,
  activity_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  pet_id TEXT,
  pet_name TEXT,
  pet_species TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  duration INTEGER,
  distance REAL,
  calories INTEGER,
  activity_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.pet_id,
    p.name as pet_name,
    p.species as pet_species,
    pa.type,
    pa.title,
    pa.description,
    pa.duration,
    pa.distance,
    pa.calories,
    pa.activity_date,
    pa.metadata,
    pa.created_at
  FROM pet_activities pa
  JOIN pets p ON pa.pet_id = p.id
  WHERE 
    pa.user_id = target_user_id AND
    p.user_id = target_user_id AND
    (target_pet_id IS NULL OR pa.pet_id = target_pet_id)
  ORDER BY pa.activity_date DESC
  LIMIT activity_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the recent activities function
GRANT EXECUTE ON FUNCTION get_recent_activities_with_pets(UUID, TEXT, INTEGER) TO authenticated;

-- Sample data insertion (optional - for testing)
-- You can run this after creating pets to test the system
/*
INSERT INTO pet_activities (id, pet_id, user_id, type, title, description, duration, distance, calories, activity_date) VALUES
  ('activity_1', 'your_pet_id_here', auth.uid(), 'walk', 'Morning Walk', 'Walk around the neighborhood', 25, 1.8, 85, NOW() - INTERVAL '2 hours'),
  ('activity_2', 'your_pet_id_here', auth.uid(), 'meal', 'Breakfast', 'Regular breakfast meal', NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
  ('activity_3', 'your_pet_id_here', auth.uid(), 'medication', 'Vitamin D', 'Daily vitamin supplement', NULL, NULL, NULL, NOW() - INTERVAL '4 hours');
*/