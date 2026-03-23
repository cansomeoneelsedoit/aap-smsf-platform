# Admin Autopilot — SMSF Platform

Single-file HTML demo of the AAP SMSF administration platform.

## Features
- Client onboarding wizard (5 steps)
- Staff portal with stage management
- Stage ownership & handoff workflow
- Staff profiles (visible to clients)
- Company groups / referrer tracking
- KYC management
- Document management (by year + type)
- File notes with 3CX/Echo Notes integration
- Digital signature pad
- Client portal
- PostgreSQL schema (see /docs)

## Running locally
```
npm install
npm start
```
Open http://localhost:3000

## Demo accounts
- sarah@aap.com.au / demo123 (Master Owner)
- emma@aap.com.au / demo123 (Bookkeeper)
- michael@aap.com.au / demo123 (Compliance)

## Versions
- /v2.html — Original demo
- /v3.html — With stage ownership + staff profiles
- /v4.html — Current (admin-managed assignments + all buttons wired)
