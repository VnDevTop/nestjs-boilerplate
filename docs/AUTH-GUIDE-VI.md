# Hướng dẫn Xác thực toàn bộ (Complete Authentication Guide) — Bằng tiếng Việt

> **Trạng thái:** Bản nháp cho Phase 8 — Authentication & Authorization (JWT).
> Mô tả đầy đủ các trạng thái của user và các luồng xác thực từng bước trước khi implement.

---

## 1. Vòng đời tài khoản (User States)

| Trạng thái | Trigger | Chi tiết | Bước tiếp theo |
|---|---|---|---|
| **Registered** | `POST /auth/register` | Tạo user: `emailVerified: false`, có `passwordHash`, `roles: [USER]`; cấp token ngay (auto-login) | Xác minh email / login |
| **Admin-created** | Admin tạo tài khoản | Tài khoản do admin tạo (thường có mật khẩu tạm / forced MFA) | Force change password / setup MFA / login |
| **Active** | Sau register / Admin + set password | Có thể login qua password / magic link / passcode / OIDC / device | Áp MFA gate nếu bật |
| **MFA disabled** | `POST /auth/mfa/disable` | TOTP tắt; login cấp token trực tiếp (`mfaVerified: false`) | Login bình thường |
| **MFA enabled** | `POST /auth/mfa/verify` (+ login flow `mfaRequired`) | TOTP bật; login trả `{ mfaRequired: true, mfaToken }` | Verify TOTP qua `POST /auth/mfa/verify-login` |
| **Device pending** | `POST /auth/device/code` | Lưu `DeviceAuthorization` (`PENDING`, TTL 15m) | User approve qua `user_code` |
| **Device approved** | `POST /auth/device/approve` (user có MFA verified) | Status → `APPROVED`, bind `userId` | Device poll → issue token |
| **Device denied / expired** | approve / deny / TTL | `DENIED` / `EXPIRED` | Poll trả status cuối; không token |

## 2. Các luồng login — từng bước

### 2.1 Email + Password Login

1. `POST /auth/login` → `AuthService.login`
2. `validateUser` → Argon2 verify → sai → `401`
3. Nếu `totpEnabled` → trả `{ mfaRequired: true, mfaToken }`
4. Ngược lại → issue token pair (`authMethod: PASSWORD`, `mfaVerified: false`)

### 2.2 TOTP MFA Verify (login challenge)

1. `POST /auth/mfa/verify-login { code, mfaToken }` → verify TOTP → valid → issue token (`authMethod` từ payload, `mfaVerified: true`)

### 2.3 Magic Link / Email Passcode

1. Request → tạo token (Argon2id hash, TTL, single-use) → gửi email
2. Verify → hash → lookup → expiry/consumed → consume → `completeLogin`
3. `completeLogin` → MFA gate hoặc issue token (`authMethod: MAGIC_LINK`, `mfaVerified: true`)

### 2.4 OIDC Login

1. Callback provider → `OidcService` → find-or-create user → issue token (`authMethod: OIDC`)

### 2.5 Device Code Flow (Task 3 đã implement)

1. `POST /auth/device/code` → tạo `PENDING` → trả contract RFC 8628
2. `POST /auth/device/approve` (JWT + MFA verified) → `APPROVED` + bind user
3. `POST /auth/device/poll` → `APPROVED` → issue token (`authMethod: DEVICE`, `mfaVerified: true`)

## 3. Vòng đời token

- Access: JWT, 15m · Refresh: JWT, 7d (`type: 'refresh'`)
- Refresh: `POST /auth/refresh` → verify → issue pair (rotation → Task 4)
- Device tokens: `authMethod: DEVICE`, `mfaVerified: true`

## 4. Security Gates còn dang (Phase 8.3)

1. Brute-force protection (Task 5)
2. Audit logging (Task 6)
3. JWT key versioning & rotation (Task 7)
4. Account security features (Task 8)

---

*End of Vietnamese Authentication Guide.*
