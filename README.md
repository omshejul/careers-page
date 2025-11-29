# Careers Page Builder

a platform where companies can build and manage their own careers pages without dealing with code.

## what this is

full-stack careers platform with:

- multi-tenant setup, each company gets their own space
- draft/publish workflow, edit safely, publish when ready
- 7 customizable sections (hero, about, values, benefits, culture video, team locations, jobs)
- job listings with 155+ sample jobs seeded
- animated public pages with seo optimization
- role-based access via google oauth

## tech stack

- next.js 16 (app router), react 19, typescript
- tailwind v4, shadcn/ui, framer motion
- mongodb + mongoose
- nextauth v5 (google oauth)
- s3-compatible storage
- react hook form + zod validation

## getting started

### what you need

- node 18+ and pnpm
- mongodb instance (local or atlas)
- google oauth credentials
- s3-compatible storage (aws s3, cloudflare r2, etc.)

### setup

1. clone and install

```bash
git clone URL
cd careers-page
pnpm install
```

2. configure environment

```bash
cp example.env .env.local
```

.ENV:
- `MONGODB_URI`,
- `NEXTAUTH_SECRET`, generate with `openssl rand -base64 32`,
- `GOOGLE_CLIENT_ID`,
- `GOOGLE_CLIENT_SECRET`,
- `S3_*`, 

3. seed the database
```bash
pnpm seed
```
creates a demo company with sample jobs and sections

4. start dev server
```bash
pnpm dev
```

visit http://localhost:3000

### quick test urls

- home: http://localhost:3000
- sign in: http://localhost:3000/auth/signin
- dashboard: http://localhost:3000/dashboard
- builder: http://localhost:3000/demo-company/builder
- public page: http://localhost:3000/demo-company

## how to use it

### for admins/recruiters

sign in
- click sign in on homepage
- use google oauth

view dashboard
- see company stats (sections, jobs, applications)
- view all your companies
- create new companies

edit your careers page
- click "edit page" on company card

working in the builder
- toggle sections on/off
- drag to reorder
- click edit on any section to modify content
- available sections: hero, about, values, benefits, culture video, team locations, jobs

preview changes
- click "preview" to see draft version
- only you can see draft changes
- public sees published version

publish
- click "publish changes" when ready
- goes live immediately

seo settings
- set page title and meta description
- helps with search rankings

### for candidates (public)

visit careers page
- go to `/{company-slug}` (like `/demo-company`)
- no login needed

browse
- scroll through animated sections
- learn about company culture, values, benefits
- watch culture video if available

view jobs
- see all open positions
- apply for a position


## key features

draft vs. live system
- edit in draft mode without affecting public page
- preview changes before publishing
- one-click publish when ready

multi-tenant
- multiple companies on one platform
- isolated workspaces
- role-based permissions

customizable sections
- hero with headline, description, cta
- about company
- core values with icons
- employee benefits
- culture video (youtube embed)
- team locations with images
- jobs list (auto-pulls from job postings)

job management
- create and edit job postings
- set location, type, salary range
- publish/unpublish jobs
- expiration dates

application tracking
- candidates submit applications
- track application status

## environment variables

required in `.env`:

```env
# database
MONGODB_URI=mongodb://localhost:27017/careers-page

# auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# storage
S3_ENDPOINT=your-s3-endpoint
S3_REGION=your-region
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## scripts

```bash
pnpm dev          # start dev server
pnpm build        # build for production
pnpm start        # start production server
pnpm seed         # seed database with demo data
pnpm lint         # run linter
```

## demo credentials

after seeding, you can:
- sign in with any google account
- view demo company at `/demo-company`
- access builder at `/demo-company/builder`

## future imporvement roadmap

- application status emails
- analytics dashboard
- resume upload to s3
- applicant tracking system
- interview scheduling

