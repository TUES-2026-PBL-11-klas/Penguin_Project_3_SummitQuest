-- ENUM TYPES

CREATE TYPE persona_enum AS ENUM (
    'photographer',
    'athlete',
    'zen_explorer'
);

CREATE TYPE trail_point_type_enum AS ENUM (
    'peak',
    'hut',
    'lake'
);

CREATE TYPE transport_mode_enum AS ENUM (
    'car',
    'public_transport'
);

CREATE TYPE quest_status_enum AS ENUM (
    'generated',
    'active',
    'completed',
    'expired'
);

CREATE TYPE badge_condition_type_enum AS ENUM (
    'quests_completed',
    'distance_km',
    'elevation_gain',
    'steps'
);

-- USERS

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    persona persona_enum NOT NULL,
    has_car BOOLEAN DEFAULT FALSE,
    max_travel_km INTEGER,
    prefer_public_transport BOOLEAN DEFAULT FALSE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    weight_kg FLOAT
);

-- EMAIL VERIFICATIONS

CREATE TABLE email_verifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- TRAIL POINTS

CREATE TABLE trail_points (
    id UUID PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255) NOT NULL,
    type trail_point_type_enum NOT NULL,
    location GEOMETRY(POINT, 4326),
    elevation_m INTEGER,
    region VARCHAR(255),
    last_synced_at TIMESTAMP
);

-- QUESTS

CREATE TABLE quests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    trail_point_id UUID NOT NULL REFERENCES trail_points(id),
    start_location GEOMETRY(POINT, 4326),
    persona_used persona_enum,
    difficulty INTEGER,
    distance_to_start_km FLOAT,
    estimated_duration_min INTEGER,
    transport_mode transport_mode_enum,
    status quest_status_enum,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- QUEST STATS

CREATE TABLE quest_stats (
    id UUID PRIMARY KEY,
    quest_id UUID NOT NULL REFERENCES quests(id),
    steps INTEGER,
    elevation_gain_m INTEGER,
    actual_duration_min INTEGER,
    avg_pace_min_per_km FLOAT
);

-- BADGES

CREATE TABLE badges (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    condition_type badge_condition_type_enum NOT NULL,
    condition_value JSONB
);

-- USER BADGES

CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES users(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- WEATHER CACHE

CREATE TABLE weather_cache (
    id UUID PRIMARY KEY,
    location GEOMETRY(POINT, 4326),
    forecast_json JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP
);