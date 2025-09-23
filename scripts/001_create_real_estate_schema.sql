-- ZoumAI Real Estate Platform Database Schema
-- Drop existing fleet management tables and create new real estate schema

-- Drop existing tables
DROP TABLE IF EXISTS public.vehicle_assignments CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.maintenance_records CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;

-- Create users table (enhanced from existing neon_auth.users_sync)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'agent', 'admin')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'inactive')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size DECIMAL(10,2),
    year_built INTEGER,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    features TEXT[],
    amenities TEXT[],
    images TEXT[],
    virtual_tour_url TEXT,
    agent_id TEXT REFERENCES public.users(id),
    seller_id TEXT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_views table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.property_views (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER,
    UNIQUE(property_id, user_id, DATE(viewed_at))
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Create searches table for saving user searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    criteria JSONB NOT NULL,
    alert_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table for property inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES public.users(id),
    message TEXT NOT NULL,
    contact_method TEXT DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'both')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    type TEXT DEFAULT 'viewing' CHECK (type IN ('viewing', 'consultation', 'inspection')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_conversations table for AI assistant
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_recommendations table for AI recommendations
CREATE TABLE IF NOT EXISTS public.user_recommendations (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    score DECIMAL(3,2) NOT NULL,
    reasons TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON public.property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_score ON public.user_recommendations(score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
