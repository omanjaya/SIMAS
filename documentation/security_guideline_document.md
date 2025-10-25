# SIMAS Security Guidelines

This document provides security recommendations and best practices for the SIMAS (Sistem Informasi Manajemen Absensi & Penggajian) repository. It is structured around core security principles and tailored to the Laravel backend and Next.js frontend stacks used in SIMAS.

## 1. Security by Design
- **Embed security early:** Integrate security reviews into every sprint or pull request. Include threat modeling for new features (e.g., biometric integration, payroll calculations).
- **Least Privilege:**
  - Backend: Grant database users only the minimum SQL privileges needed (e.g., SELECT, INSERT, UPDATE on specific tables).
  - Frontend: Restrict public API endpoints to only the data required for each UI view.
- **Defense in Depth:**
  - Combine Laravel middleware, route guards, and web server controls (e.g., Nginx rules) to protect resources.
  - Deploy a Web Application Firewall (WAF) to filter malicious payloads before they reach the application.

## 2. Authentication & Access Control
### 2.1 Robust Authentication
- Use Laravel Sanctum or Passport with secure JWT settings:
  - Disable the `none` algorithm.
  - Validate `exp`, `iat`, `aud`, `iss` claims.
- Enforce MFA for administrators and payroll approvers (e.g., TOTP via Laravel Fortify).

### 2.2 Password Policies
- Require minimum length (≥ 12 characters), uppercase, lowercase, digits, symbols.
- Hash with Argon2id (Laravel’s default) and unique per-user salt.
- Enforce periodic password rotation for privileged accounts.

### 2.3 Session Management
- Use `Secure`, `HttpOnly`, and `SameSite=Strict` cookies for session identifiers.
- Implement idle (15 min) and absolute (8 h) timeouts.
- Regenerate session ID on login to prevent fixation.

### 2.4 Role-Based Access Control (RBAC)
- Continue using `RoleMiddleware`; define roles (Admin, Manager, Employee) and granular permissions.
- Enforce authorization checks in:
  - Laravel controllers (`authorize()` or `Gate` checks).
  - Next.js route guards (`ProtectedRoute` with server-side session validation).

## 3. Input Handling & Validation
- **Server-Side Validation:** Rely on Laravel Form Requests (e.g., `StoreLeaveRequest`, `ClockInRequest`).
- **Client-Side Validation:** Use Zod schemas in React Hook Form for early feedback, but never replace server checks.
- **Prevent Injection:**
  - Eloquent ORM / Query Builder prevents SQL injection; avoid raw queries when possible.
  - Sanitize any raw SQL or dynamic queries via prepared statements.
- **XSS Mitigation:**
  - Escape all user-supplied data in React using JSX auto-escaping.
  - Apply a strict Content Security Policy (CSP) in production (`script-src 'self'`).

## 4. Data Protection & Privacy
### 4.1 Encryption
- **In Transit:** Enforce HTTPS (TLS 1.2+) for all frontend/backend traffic. Redirect HTTP to HTTPS.
- **At Rest:**
  - Encrypt sensitive columns (e.g., bank account, tax details) using Laravel’s built-in encryption (`Crypt::encryptString`).
  - Use encrypted volumes or database encryption features.

### 4.2 Secret Management
- Move API keys, DB credentials, and third-party tokens to a secrets manager (e.g., AWS Secrets Manager, Vault).
- Do not store secrets in `.env` under version control.

### 4.3 Data Minimization & Masking
- Return only necessary fields in API responses (use Laravel API Resources).
- Mask PII in logs (e.g., only last 4 digits of SSN in audit logs).

## 5. API & Service Security
- **Rate Limiting:** Configure Laravel’s `ThrottleRequests` middleware (e.g., 100 req/min per IP) and apply stricter limits on login endpoints.
- **CORS:** Restrict origins to known frontend domains. Avoid wildcard (`*`).
- **Versioning:** Prefix routes with `/api/v1/` to manage breaking changes.
- **HTTP Methods:** Enforce correct verbs (GET for read, POST for create, PUT/PATCH for update, DELETE for removal).

## 6. Web Application Security Hygiene
- **CSRF Protection:** Leverage Laravel’s built-in CSRF tokens for state-changing requests. Include `csrfToken` in Next.js API calls.
- **Security Headers:**
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer-when-downgrade`
  - `Content-Security-Policy` with locked-down sources.
- **Secure Cookies:** Set in Laravel `session.php`: `'secure' => env('SESSION_SECURE_COOKIE', true)`, `'http_only' => true`, `'same_site' => 'strict'`.
- **Client Storage:** Avoid storing tokens or PII in `localStorage`; use HttpOnly cookies or in-memory storage.

## 7. Infrastructure & Configuration
- **Server Hardening:**
  - Disable unused services and ports.
  - Keep OS and packages updated with automated patching.
- **TLS Configuration:** Use strong ciphers, disable TLS 1.0/1.1.
- **File Permissions:** Restrict webroot to `www-data:www-data`, chmod 640 for `.env`.
- **Disable Debug:** Ensure `APP_DEBUG=false` in production.

## 8. Dependency Management
- **Secure Dependencies:** Review Composer and NPM packages regularly for vulnerabilities (via `composer audit`, `npm audit`).
- **Lockfiles:** Commit `composer.lock` and `package-lock.json` for reproducible builds.
- **Minimal Footprint:** Remove unused packages (e.g., outdated UI libs, dev tools in production).

## 9. Monitoring, Logging & Auditing
- **Audit Logging:** Continue using `AuditLogMiddleware` to record model changes, but:
  - Centralize logs in a SIEM (e.g., Splunk, ELK).
  - Redact sensitive fields before writing logs.
- **Error Handling:** Implement global exception handler in Laravel to return generic error messages and send detailed errors to error-tracking (e.g., Sentry).
- **Health Checks & Alerts:** Monitor application and database metrics; configure alerts on anomalous behavior.

## 10. Recommended Next Steps
1. **Security Review & Penetration Test:** Engage an external security auditor to test critical flows (login, payroll approvals, file uploads).  
2. **Automated Security Scans:** Integrate SAST/DAST tools (e.g., SonarQube, OWASP ZAP) and SCA in CI/CD.  
3. **Security Training:** Conduct periodic workshops for developers on secure coding practices and OWASP Top 10.  
4. **Policy & Process:** Establish a playbook for incident response and vulnerability disclosure.

---
By adopting these guidelines, SIMAS will achieve a robust security posture, safeguarding sensitive employee and payroll data while preserving system integrity and compliance.