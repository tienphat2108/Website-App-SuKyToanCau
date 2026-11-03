-- =====================================================================
-- Chính sách bảo mật cấp dòng cho hệ thống bách khoa lịch sử.
-- Chạy bằng tài khoản sở hữu bảng, sau khi lược đồ đã được tạo.
-- Ứng dụng đặt biến phiên app.is_admin = 'true' cho yêu cầu quản trị.
-- =====================================================================

-- Bảng sự kiện: mọi người được đọc, chỉ quản trị viên được ghi.
ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS historical_events_select ON historical_events;
CREATE POLICY historical_events_select ON historical_events
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS historical_events_insert ON historical_events;
CREATE POLICY historical_events_insert ON historical_events
    FOR INSERT
    WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS historical_events_update ON historical_events;
CREATE POLICY historical_events_update ON historical_events
    FOR UPDATE
    USING (current_setting('app.is_admin', true) = 'true')
    WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS historical_events_delete ON historical_events;
CREATE POLICY historical_events_delete ON historical_events
    FOR DELETE
    USING (current_setting('app.is_admin', true) = 'true');

-- Bảng đóng góp: khách được gửi mới, chỉ quản trị viên được đọc và xử lý.
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contributions_insert ON contributions;
CREATE POLICY contributions_insert ON contributions
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS contributions_select ON contributions;
CREATE POLICY contributions_select ON contributions
    FOR SELECT
    USING (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS contributions_update ON contributions;
CREATE POLICY contributions_update ON contributions
    FOR UPDATE
    USING (current_setting('app.is_admin', true) = 'true')
    WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS contributions_delete ON contributions;
CREATE POLICY contributions_delete ON contributions
    FOR DELETE
    USING (current_setting('app.is_admin', true) = 'true');

-- Ghi chú: bảng admin_users không bật chính sách cấp dòng vì quy trình đăng nhập
-- phải đọc tài khoản trước khi có danh tính quản trị. Bảng này chỉ chứa chuỗi băm mật khẩu,
-- không chứa dữ liệu cá nhân của độc giả, và mọi truy cập đều đi qua tầng ứng dụng.
