-- Seed sample data for ZoumAI Real Estate Platform

-- Insert sample users
INSERT INTO public.users (id, email, name, phone, role, preferences) VALUES
('user_1', 'john.buyer@example.com', 'John Smith', '+1-555-0101', 'buyer', '{"budget_max": 500000, "preferred_areas": ["Downtown", "Suburbs"]}'),
('user_2', 'sarah.agent@example.com', 'Sarah Johnson', '+1-555-0102', 'agent', '{"specialties": ["residential", "luxury"], "years_experience": 8}'),
('user_3', 'mike.seller@example.com', 'Mike Wilson', '+1-555-0103', 'seller', '{}'),
('user_4', 'admin@zoumai.com', 'ZoumAI Admin', '+1-555-0104', 'admin', '{}'),
('user_5', 'emma.buyer@example.com', 'Emma Davis', '+1-555-0105', 'buyer', '{"budget_max": 750000, "preferred_type": "condo"}');

-- Insert sample properties
INSERT INTO public.properties (
    title, description, price, property_type, status, bedrooms, bathrooms, square_feet, 
    address, city, state, zip_code, latitude, longitude, features, amenities, images, agent_id, seller_id
) VALUES
(
    'Modern Downtown Condo',
    'Stunning 2-bedroom condo in the heart of downtown with city views and modern amenities.',
    450000.00, 'condo', 'active', 2, 2.0, 1200,
    '123 Main St, Unit 15A', 'San Francisco', 'CA', '94102',
    37.7749, -122.4194,
    ARRAY['hardwood floors', 'granite countertops', 'stainless steel appliances', 'balcony'],
    ARRAY['gym', 'rooftop deck', 'concierge', 'parking'],
    ARRAY['/images/condo1-1.jpg', '/images/condo1-2.jpg', '/images/condo1-3.jpg'],
    'user_2', 'user_3'
),
(
    'Charming Victorian House',
    'Beautiful 3-bedroom Victorian home with original details and modern updates.',
    675000.00, 'house', 'active', 3, 2.5, 1800,
    '456 Oak Avenue', 'San Francisco', 'CA', '94117',
    37.7849, -122.4294,
    ARRAY['original hardwood', 'updated kitchen', 'garden', 'fireplace'],
    ARRAY['parking', 'storage'],
    ARRAY['/images/house1-1.jpg', '/images/house1-2.jpg'],
    'user_2', NULL
),
(
    'Luxury Penthouse Suite',
    'Exclusive penthouse with panoramic bay views, 3 bedrooms, and premium finishes.',
    1250000.00, 'condo', 'active', 3, 3.0, 2500,
    '789 Bay Street, Penthouse', 'San Francisco', 'CA', '94109',
    37.8049, -122.4094,
    ARRAY['panoramic views', 'marble floors', 'wine cellar', 'private elevator'],
    ARRAY['valet parking', 'spa', 'pool', 'concierge'],
    ARRAY['/images/penthouse1-1.jpg', '/images/penthouse1-2.jpg', '/images/penthouse1-3.jpg', '/images/penthouse1-4.jpg'],
    'user_2', NULL
),
(
    'Cozy Starter Home',
    'Perfect first home with 2 bedrooms, updated kitchen, and private backyard.',
    385000.00, 'house', 'active', 2, 1.0, 950,
    '321 Pine Street', 'Oakland', 'CA', '94610',
    37.8044, -122.2711,
    ARRAY['updated kitchen', 'private yard', 'garage'],
    ARRAY['quiet neighborhood'],
    ARRAY['/images/starter1-1.jpg', '/images/starter1-2.jpg'],
    'user_2', NULL
),
(
    'Modern Townhouse',
    'Brand new 3-bedroom townhouse with contemporary design and smart home features.',
    595000.00, 'townhouse', 'pending', 3, 2.5, 1650,
    '654 Elm Drive', 'San Jose', 'CA', '95110',
    37.3382, -121.8863,
    ARRAY['smart home', 'energy efficient', 'two-car garage', 'patio'],
    ARRAY['community pool', 'playground'],
    ARRAY['/images/townhouse1-1.jpg', '/images/townhouse1-2.jpg'],
    'user_2', NULL
);

-- Insert sample favorites
INSERT INTO public.favorites (user_id, property_id) VALUES
('user_1', 1),
('user_1', 4),
('user_5', 1),
('user_5', 3);

-- Insert sample saved searches
INSERT INTO public.saved_searches (user_id, name, criteria, alert_enabled) VALUES
('user_1', 'Downtown Condos Under 500k', '{"property_type": "condo", "max_price": 500000, "areas": ["Downtown"]}', true),
('user_5', 'Luxury Properties', '{"min_price": 750000, "bedrooms_min": 3}', false);

-- Insert sample property views
INSERT INTO public.property_views (property_id, user_id, duration_seconds) VALUES
(1, 'user_1', 180),
(1, 'user_5', 240),
(2, 'user_1', 120),
(3, 'user_5', 300),
(4, 'user_1', 90);

-- Insert sample inquiries
INSERT INTO public.inquiries (property_id, user_id, agent_id, message, contact_method, status) VALUES
(1, 'user_1', 'user_2', 'I am interested in scheduling a viewing for this condo. When would be a good time?', 'both', 'new'),
(3, 'user_5', 'user_2', 'Could you provide more information about the HOA fees and building amenities?', 'email', 'contacted');

-- Insert sample appointments
INSERT INTO public.appointments (property_id, user_id, agent_id, appointment_date, type, status, notes) VALUES
(1, 'user_1', 'user_2', NOW() + INTERVAL '2 days', 'viewing', 'scheduled', 'First-time buyer, needs guidance'),
(3, 'user_5', 'user_2', NOW() + INTERVAL '5 days', 'viewing', 'confirmed', 'Interested in luxury features');

-- Insert sample chat conversations
INSERT INTO public.chat_conversations (user_id, title) VALUES
('user_1', 'Property Search Help'),
('user_5', 'Investment Advice');

-- Insert sample chat messages
INSERT INTO public.chat_messages (conversation_id, role, content) VALUES
(1, 'user', 'Hi, I am looking for a 2-bedroom condo under $500k in San Francisco.'),
(1, 'assistant', 'I can help you find the perfect condo! Based on your criteria, I found several options. The Modern Downtown Condo at 123 Main St looks like a great match - it is priced at $450,000 and has 2 bedrooms with city views. Would you like to see more details?'),
(1, 'user', 'Yes, that sounds interesting. Can you tell me more about the neighborhood?'),
(2, 'user', 'What should I consider when buying an investment property?'),
(2, 'assistant', 'Great question! For investment properties, consider: 1) Location and growth potential, 2) Rental yield and cash flow, 3) Property condition and maintenance costs, 4) Local rental market demand, 5) Tax implications. Would you like me to analyze any specific properties for investment potential?');

-- Insert sample recommendations
INSERT INTO public.user_recommendations (user_id, property_id, score, reasons) VALUES
('user_1', 1, 0.95, ARRAY['Matches budget', 'Preferred location', 'Right size']),
('user_1', 4, 0.85, ARRAY['Within budget', 'Good starter home', 'Growing area']),
('user_5', 3, 0.92, ARRAY['Luxury features', 'Premium location', 'Investment potential']),
('user_5', 1, 0.78, ARRAY['Good location', 'Modern amenities']);
