-- Create enum for social platform types
CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin');

-- Create media_kit_stats table
CREATE TABLE IF NOT EXISTS media_kit_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    follower_count INTEGER NOT NULL DEFAULT 0,
    engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    avg_likes INTEGER NOT NULL DEFAULT 0,
    avg_comments INTEGER NOT NULL DEFAULT 0,
    weekly_reach INTEGER NOT NULL DEFAULT 0,
    monthly_impressions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, platform)
);

-- Create brand_collaborations table
CREATE TABLE IF NOT EXISTS brand_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    collaboration_type TEXT,
    collaboration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, service_name)
);

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE media_kit_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policies for media_kit_stats
CREATE POLICY "Public profiles can be viewed by anyone"
    ON media_kit_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own media kit stats"
    ON media_kit_stats FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- Create policies for brand_collaborations
CREATE POLICY "Public brand collaborations can be viewed by anyone"
    ON brand_collaborations FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own brand collaborations"
    ON brand_collaborations FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- Create policies for services
CREATE POLICY "Public services can be viewed by anyone"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own services"
    ON services FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- Create policies for portfolio_items
CREATE POLICY "Public portfolio items can be viewed by anyone"
    ON portfolio_items FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own portfolio items"
    ON portfolio_items FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_media_kit_stats_updated_at
    BEFORE UPDATE ON media_kit_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_collaborations_updated_at
    BEFORE UPDATE ON brand_collaborations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX idx_media_kit_stats_profile_id ON media_kit_stats(profile_id);
CREATE INDEX idx_brand_collaborations_profile_id ON brand_collaborations(profile_id);
CREATE INDEX idx_services_profile_id ON services(profile_id);
CREATE INDEX idx_portfolio_items_profile_id ON portfolio_items(profile_id); 