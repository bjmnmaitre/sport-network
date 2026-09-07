-- Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  status ENUM('active', 'suspended', 'deletion_requested', 'anonymized') DEFAULT 'active',
  emailVerified BOOLEAN DEFAULT false,
  preferredLanguage VARCHAR(10),
  timezone VARCHAR(50),
  deletionRequestedAt TIMESTAMP,
  anonymizedAt TIMESTAMP,
  profileId UUID,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Create Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  displayName VARCHAR(100) NOT NULL,
  bio TEXT,
  profileImageUrl VARCHAR(500),
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100),
  latitude FLOAT,
  longitude FLOAT,
  primarySports TEXT[] DEFAULT ARRAY[]::TEXT[],
  declaredLevel ENUM('beginner', 'regular', 'experienced', 'competitor') DEFAULT 'beginner',
  visibility ENUM('private', 'friends_only', 'public') DEFAULT 'public',
  isVerified BOOLEAN DEFAULT false,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_userId ON profiles(userId);
CREATE INDEX idx_profiles_displayName ON profiles(displayName);
CREATE INDEX idx_profiles_visibility ON profiles(visibility);
CREATE INDEX idx_profiles_coordinates ON profiles(latitude, longitude) WHERE latitude IS NOT NULL;

-- Add foreign key
ALTER TABLE users ADD CONSTRAINT fk_users_profileId FOREIGN KEY (profileId) REFERENCES profiles(id);