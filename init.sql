-- SmartClip Database Initialization Script
-- This script creates the initial database schema and seed data

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    visibility VARCHAR(20) DEFAULT 'public', -- public, private, unlisted
    status VARCHAR(20) DEFAULT 'processing', -- processing, available, disabled
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create video_categories junction table
CREATE TABLE video_categories (
    video_id INTEGER REFERENCES videos(id),
    category_id INTEGER REFERENCES categories(id),
    PRIMARY KEY (video_id, category_id)
);

-- Create comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    user_id INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id), -- for threaded comments
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create likes table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    comment_id INTEGER REFERENCES comments(id),
    type VARCHAR(10) NOT NULL, -- like, dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id, comment_id)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES users(id),
    subscribed_to_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscriber_id, subscribed_to_id)
);

-- Create video_transcripts table
CREATE TABLE video_transcripts (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    language_code VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, language_code)
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_videos_views_count ON videos(views_count);
CREATE INDEX idx_comments_video_id ON comments(video_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_likes_video_id ON likes(video_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_subscribed_to_id ON subscriptions(subscribed_to_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
('Music', 'Musical performances, covers, and music-related content'),
('Gaming', 'Video game walkthroughs, reviews, and commentary'),
('Education', 'Tutorials, lectures, and educational content'),
('Entertainment', 'Comedy, films, and entertainment content'),
('Sports', 'Sports highlights, analysis, and commentary'),
('News', 'News, journalism, and current events'),
('How-to', 'Instructional videos and tutorials'),
('Tech', 'Technology reviews, tutorials, and discussions'),
('Travel', 'Travel vlogs, guides, and documentaries'),
('Food', 'Cooking tutorials, food reviews, and recipes');

-- Insert admin user (password is 'admin123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role, is_verified, is_active) VALUES
    ('admin', 'admin@smartclip.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', 'admin', true, true);

-- Insert sample users (passwords are 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role, is_verified, is_active) VALUES
    ('johndoe', 'john.doe@example.com', '$2a$12$uFfjC.1pD1zxYsEUgH0P4eJf30qVz8cD6qJxJ1k2HnD3m1P8uFfjC', 'user', true, true),
    ('janesmith', 'jane.smith@example.com', '$2a$12$uFfjC.1pD1zxYsEUgH0P4eJf30qVz8cD6qJxJ1k2HnD3m1P8uFfjC', 'user', true, true),
    ('mikejohnson', 'mike.johnson@example.com', '$2a$12$uFfjC.1pD1zxYsEUgH0P4eJf30qVz8cD6qJxJ1k2HnD3m1P8uFfjC', 'user', true, true);

-- Insert sample videos
INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, duration, visibility, status) VALUES
    (2, 'Introduction to React Hooks', 'Learn the basics of React Hooks in this comprehensive tutorial', 'https://example.com/videos/react-hooks.mp4', 'https://example.com/thumbnails/react-hooks.jpg', 630, 'public', 'available'),
    (3, 'Top 10 Travel Destinations 2023', 'Explore the most amazing travel destinations for 2023', 'https://example.com/videos/travel-2023.mp4', 'https://example.com/thumbnails/travel-2023.jpg', 840, 'public', 'available'),
    (4, 'Cooking Pasta from Scratch', 'Learn how to make delicious pasta from scratch', 'https://example.com/videos/pasta-cooking.mp4', 'https://example.com/thumbnails/pasta-cooking.jpg', 520, 'public', 'available');

-- Associate videos with categories
INSERT INTO video_categories (video_id, category_id) VALUES
    (1, 3), -- React Hooks -> Education
    (2, 9), -- Travel -> Travel
    (3, 10); -- Pasta -> Food

-- Insert sample comments
INSERT INTO comments (video_id, user_id, content) VALUES
    (1, 3, 'Great tutorial! This really helped me understand hooks better.'),
    (1, 4, 'Thanks for the clear explanations. Can you do one on custom hooks?'),
    (2, 2, 'Ive been to 3 of these places and they are amazing!'),
    (3, 2, 'This makes me hungry! I will definitely try this recipe.');

-- Insert sample likes
INSERT INTO likes (user_id, video_id, type) VALUES
    (2, 1, 'like'),
    (3, 1, 'like'),
    (4, 2, 'like'),
    (2, 3, 'like'),
    (3, 3, 'like');

-- Insert sample subscriptions
INSERT INTO subscriptions (subscriber_id, subscribed_to_id) VALUES
    (2, 3), -- johndoe subscribes to janesmith
    (2, 4), -- johndoe subscribes to mikejohnson
    (3, 2), -- janesmith subscribes to johndoe
    (4, 2); -- mikejohnson subscribes to johndoe