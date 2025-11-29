# Careers Page Builder - Setup Guide

## Overview

A multi-tenant careers page builder with Next.js 16, MongoDB, and NextAuth.js v5.

## Prerequisites

- Node.js 18+ and pnpm
- MongoDB instance (local or Atlas)
- S3-compatible storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
- Google OAuth credentials

---

## 1. Database Setup (MongoDB)

Use a local MongoDB instance or a hosted MongoDB Atlas cluster. Set `MONGODB_URI` / `DATABASE_URL` in `.env.local` to your connection string.

---

## 2. Storage Setup (S3-Compatible API)

Create a public bucket in your S3-compatible provider (e.g. `company-assets`) and configure:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL`

---

## 3. Authentication Setup (Google OAuth)

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Save **Client ID** and **Client Secret**

---

## 4. Environment Variables

Copy `example.env` to `.env.local` and fill in:

```env
# Database
MONGODB_URI="mongodb://localhost:27017/careers-page"
DATABASE_URL="mongodb://localhost:27017/careers-page"

# S3 Storage
S3_REGION=us-east-1
S3_ENDPOINT=https://your-s3-endpoint.example.com
S3_ACCESS_KEY_ID=your_s3_access_key_id
S3_SECRET_ACCESS_KEY=your_s3_secret_access_key
S3_PUBLIC_BASE_URL=https://your-public-assets.example.com
NEXT_PUBLIC_STORAGE_BUCKET=company-assets

# NextAuth.js
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_google_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 5. Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Push database schema
pnpm prisma db push

# Seed database with sample data (155 jobs)
pnpm prisma db seed
```

---

## 6. Development

```bash
# Start dev server
pnpm dev

# Open http://localhost:3000
```

---

## 7. Test the Application

### Demo Data

The seed script creates:

- 1 demo company: `demo-company`
- 155 jobs with various locations, departments, and types

### Test Flow

1. **Home page**: `http://localhost:3000`
2. **Sign in**: Click "Sign In" → Authenticate with Google
3. **Dashboard**: View companies and stats
4. **Builder**: Visit `/demo-company/builder` to see the careers page builder
5. **Public page**: Visit `/demo-company` to see the live careers page with all sections

---

## 8. File Uploads

### How S3 Storage Works

When you upload files (logos, banners, resumes):

1. Files are converted to Buffer
2. Uploaded via S3 PutObject command
3. Public URL returned: `{S3_PUBLIC_BASE_URL}/{bucket}/{path}`
4. No additional authentication needed for public files if bucket is public

### Supported Operations

- `uploadFileToStorage(file, path, bucket)` - Upload file
- `deleteFileFromStorage(path, bucket)` - Delete file

---

## 9. Architecture

### Multi-Tenant Design

- Each company has isolated data
- Role-based access control (ADMIN, EDITOR, VIEWER)
- Company slug in URLs: `/{companySlug}/builder`

### Key Features

✅ Google OAuth authentication  
✅ Multi-tenant dashboard  
✅ Careers page builder (7 section types)  
✅ Public careers pages (SSR, SEO-optimized)  
✅ Job listings (seeded from CSV)  
✅ S3-compatible storage  
✅ Framer Motion animations  
✅ Responsive design

---

## 10. Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Important**: Update `AUTH_GOOGLE_ID` redirect URI to include your production domain.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB (Mongoose)
- **Auth**: NextAuth.js v5
- **Storage**: S3-compatible API
- **UI**: shadcn/ui + Tailwind CSS v4
- **Animations**: Framer Motion

---

## Need Help?

Check the implementation plan in `.claude/plans/sorted-popping-umbrella.md`
