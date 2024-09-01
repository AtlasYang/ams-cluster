ALTER DATABASE postgres SET timezone = 'Asia/Seoul';

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_sessions (
    user_session_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    group_picture_url TEXT,
    group_secret TEXT NOT NULL,
    allow_unapproved_join BOOLEAN NOT NULL DEFAULT FALSE,
    use_unattendance_penalty BOOLEAN NOT NULL DEFAULT FALSE,
    unexcused_absence_penalty INT NOT NULL DEFAULT 0,
    approved_absence_penalty INT NOT NULL DEFAULT 0,
    late_penalty INT NOT NULL DEFAULT 0,
    allowed_extra_minutes_for_presence INT NOT NULL DEFAULT 0,
    allowed_extra_minutes_for_late INT NOT NULL DEFAULT 0,
    max_late_count INT NOT NULL DEFAULT 0,
    warning_late_count INT NOT NULL DEFAULT 0,
    max_absence_count INT NOT NULL DEFAULT 0,
    warning_absence_count INT NOT NULL DEFAULT 0,
    max_unexcused_absence_count INT NOT NULL DEFAULT 0,
    warning_unexcused_absence_count INT NOT NULL DEFAULT 0,
    restrict_memeber_number BOOLEAN NOT NULL DEFAULT FALSE,
    max_member_number INT
);
CREATE INDEX idx_groups_name ON groups(name);

CREATE TABLE group_invitations (
    group_invitation_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    inviter_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    invitee_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    invitation_message TEXT,
    is_admin_invitation BOOLEAN NOT NULL DEFAULT FALSE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    invitation_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_requests (
    group_request_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    request_message TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    request_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    member_role INT NOT NULL,
    penalty_point INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_user_id ON members(user_id);

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tags TEXT,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    special_notes TEXT,
    qrcode_link TEXT,
    session_secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_group_id ON sessions(group_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);

CREATE TABLE session_participation (
    session_participation_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    participation_state INT NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_session_participation_session_id ON session_participation(session_id);
CREATE INDEX idx_session_participation_member_id ON session_participation(member_id);

CREATE TABLE session_feedbacks (
    session_feedback_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_attendance_requests (
    session_attendance_request_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    request_message TEXT,
    evidence_file_url TEXT,
    request_checked BOOLEAN NOT NULL DEFAULT FALSE,
    request_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(session_id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_events_session_id ON events(session_id);

CREATE TABLE event_participation (
    event_participation_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_event_participation_event_id ON event_participation(event_id);
CREATE INDEX idx_event_participation_member_id ON event_participation(member_id);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    target_member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_url TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_group_id ON notifications(group_id);
CREATE INDEX idx_notifications_target_member_id ON notifications(target_member_id);
CREATE INDEX idx_notifications_read ON notifications(read);