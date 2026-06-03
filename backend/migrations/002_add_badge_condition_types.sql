-- Add new condition types required for the expanded badge set

ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'first_quest';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'time_of_day_before';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'time_of_day_after';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'weather_condition';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'daily_steps';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'total_elevation';
ALTER TYPE badge_condition_type_enum ADD VALUE IF NOT EXISTS 'all_badges';
