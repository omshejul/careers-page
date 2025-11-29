# Project Documentation (Blueprint)

## Overview

This repository contains a Careers Page builder application built with Next.js 16. It allows companies to manage their job postings, applications, and build a custom careers page with various sections.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (v5 beta)
- **UI Components**: Shadcn/UI (Radix UI + Tailwind)
- **Forms**: React Hook Form + Zod
- **State/Data**: React Server Components + Server Actions (implicit in Next.js)
- **Graphics/Effects**: Three.js (for custom background effects like Grid Distortion and Color Bends)

## Draft & Publish System (New)

The application implements a robust "Draft vs. Live" system for careers pages, allowing companies to work on changes without exposing them immediately to the public.

### Core Concepts

1.  **Data Separation**:

    - **Draft Data**: Stored in the standard `data` field of the `Section` model. All Builder edits affect this field.
    - **Live Data**: Stored in the `publishedData` field of the `Section` model. This is what public visitors see.
    - **Unpublished Changes Flag**: The `CareersPage` model tracks `hasUnpublishedChanges` (boolean). This is set to `true` whenever a section is created, updated, or deleted.
    - **Soft Deletion**: The `Section` model uses `deletedAt` for sections deleted in Draft.
      - **Builder**: Hides soft-deleted sections.
      - **Preview Mode**: Hides soft-deleted sections.
      - **Live Mode**: Shows soft-deleted sections IF they have `publishedData` (simulating the live state where it still exists).
    - **Section State (Order & Enabled)**:
      - **Draft State**: Uses standard `order` and `enabled` fields.
      - **Live State**: Uses `publishedOrder` and `publishedEnabled` fields.
      - **Public Page Logic**: Sorts by `publishedOrder` (fallback to `order` for legacy) and filters by `publishedEnabled` (fallback to `enabled` for legacy).

2.  **Publishing Workflow**:

    - When a user clicks "Publish", the API copies `section.data` to `section.publishedData` for all sections.
    - It also copies `order` to `publishedOrder` and `enabled` to `publishedEnabled`.
    - **Deletions**: Sections marked with `deletedAt` are permanently deleted from the database.
    - It sets `careersPage.hasUnpublishedChanges` to `false`.
    - **Concurrency Handling**: To prevent race conditions (e.g., a user editing while publishing is in progress), the system checks for any section modifications that occurred _after_ the publish operation started. If found, `hasUnpublishedChanges` remains `true`.

3.  **Preview Mode**:

    - Authenticated users with access to the company can view the _draft_ version of the page.
    - Accessed via `?preview=true` query parameter.
    - Uses draft `order` and `enabled` status.
    - A sticky banner alerts the user they are in Preview mode.
    - Strict server-side checks ensure only authorized users can access preview content.

4.  **Discard Changes**:
    - Allows users to revert their draft to the last published state.
    - The API copies `publishedData` back to `data` for all sections.
    - It restores `order` from `publishedOrder` and `enabled` from `publishedEnabled`.
    - **Restoration**: Sections that were soft-deleted but have `publishedData` are restored (`deletedAt` unset).
    - Sections that were created but never published (no `publishedData`) are deleted.
    - `hasUnpublishedChanges` is set to `false`.

## File Structure & Descriptions

### Root Configuration

- `package.json`: Project dependencies and scripts. Key scripts include `dev`, `build`, `seed`, and `import:jobs`.
- `tsconfig.json`: TypeScript compiler configuration.
- `next.config.ts`: Next.js configuration options.
- `eslint.config.mjs`: ESLint configuration for code linting.
- `postcss.config.mjs`: PostCSS config (used by Tailwind).
- `globals.css`: Global CSS styles, including Tailwind directives and custom theme variables.
- `.env`: Environment variables (API keys, database URI, etc.).
- `README.md`: General project documentation.
- `SETUP.md`: Setup instructions for the project.
- `next-env.d.ts`: Next.js TypeScript declarations.
- `components.json`: Configuration for shadcn/ui components.

### App Directory (`app/`)

The main application code using Next.js App Router.

#### Authentication Group `(auth)`

Routes related to user authentication.

- `app/(auth)/layout.tsx`: Layout for auth pages (likely centered content).
- `app/(auth)/login/page.tsx`: Login page component.
- `app/(auth)/error/page.tsx`: Error page for authentication failures.

#### Dashboard Group `(dashboard)`

Protected routes for logged-in users to manage their company and careers page.

- `app/(dashboard)/layout.tsx`: Main dashboard layout (sidebar, header).
- `app/(dashboard)/dashboard/page.tsx`: Main dashboard landing page (company selection/creation).
- `app/(dashboard)/[companySlug]/layout.tsx`: Layout for company-specific dashboard routes.
- `app/(dashboard)/[companySlug]/overview/page.tsx`: Company overview/stats page.
- `app/(dashboard)/[companySlug]/applications/page.tsx`: List of job applications for the company.
- `app/(dashboard)/[companySlug]/builder/page.tsx`: Drag-and-drop builder for the careers page. Passes `hasUnpublishedChanges` state to client.
- `app/(dashboard)/[companySlug]/settings/page.tsx`: Company settings page (SEO, details).
- `app/(dashboard)/[companySlug]/jobs/page.tsx`: List of jobs.
- `app/(dashboard)/[companySlug]/jobs/new/page.tsx`: Create a new job form.
- `app/(dashboard)/[companySlug]/jobs/[jobSlug]/edit/page.tsx`: Edit an existing job form.

#### Public Group `(public)`

Public-facing pages for job seekers.

- `app/(public)/[companySlug]/page.tsx`: The rendered careers page. Handles logic for displaying Live (published) data vs Draft (preview) data based on authentication and URL parameters.
- `app/(public)/[companySlug]/layout.tsx`: Layout for public pages.
- `app/(public)/[companySlug]/jobs/[jobSlug]/page.tsx`: Individual job detail page with application form.

#### API Routes (`app/api`)

Backend endpoints for data operations.

- `app/api/auth/[...nextauth]/route.ts`: NextAuth.js handler for authentication.
- `app/api/upload/image/route.ts`: Endpoint for handling image uploads (likely to S3 or similar).
- `app/api/careers/[companyId]/route.ts`: Fetch career page data. Handles the **Publish** operation (copying draft data to published data).
- `app/api/careers/[companyId]/discard/route.ts`: **New**: Handles discarding draft changes (reverting to published state).
- `app/api/careers/[companyId]/sections/route.ts`: Manage career page sections. Marks page as having unpublished changes.
- `app/api/careers/[companyId]/sections/[sectionId]/route.ts`: Update/delete specific sections. Marks page as having unpublished changes.
- `app/api/companies/[companyId]/route.ts`: CRUD operations for company details.
- `app/api/companies/[companyId]/jobs/[jobId]/route.ts`: CRUD for specific jobs.
- `app/api/companies/[companyId]/jobs/route.ts`: List/create jobs for a company.
- `app/api/companies/[companyId]/applications/route.ts`: List applications.
- `app/api/companies/[companyId]/applications/[applicationId]/route.ts`: specific application details.
- `app/api/companies/route.ts`: List/create companies.

#### General App Files

- `app/layout.tsx`: Root layout (HTML/Body tags, providers).
- `app/page.tsx`: Landing page (redirects to dashboard or login). Now features `ColorBends` background.
- `app/favicon.ico`: Site favicon.

### Components (`components/`)

Reusable UI components and feature-specific components.

#### Feature Components

- **Auth**: `components/auth/SessionProvider.tsx` (Client-side session context).
- **Applications**: `components/applications/ApplicationsClient.tsx` (Client-side list/management of applications).
- **Builder**:
  - `BuilderClient.tsx`: Main builder interface. Now manages "Publish" vs "Publish Changes" states, "Discard Changes" workflow, and status badges.
  - `AddSectionDialog.tsx`, `EditSectionDialog.tsx`: Dialogs for managing page sections.
  - `SEOSettingsDialog.tsx`: SEO configuration for the careers page.
- **Careers (Public View)**:
  - `sections/`: Components for rendering specific section types.
    - `HeroSection.tsx`: Now integrates `GridDistortion` for dynamic background effects.
    - `AboutSection.tsx`, `JobsList.tsx`, etc.
  - `index.tsx`: Export or main renderer for sections.
- **Visual Effects (New)**:
  - `GridDistortion.tsx`: A Three.js-based interactive image distortion component used in the Hero section. Includes mobile optimizations and responsive scaling.
  - `ColorBends.tsx`: A Three.js-based animated gradient background used on the main landing page.
  - `ColorBends.css`: Styles for the ColorBends component.
- **Dashboard**:
  - `Header.tsx`, `Sidebar.tsx`: Navigation components.
  - `CompanySelector.tsx`: Dropdown to switch companies.
  - `CreateCompanyDialog.tsx`: Modal to add a new company.
- **Jobs**:
  - `JobsClient.tsx`: Job listing management.
  - `JobForm.tsx`: Form for creating/editing jobs.
  - `JobApplicationForm.tsx`: Form for applicants to apply.
  - `MarkdownContent.tsx`: Renderer for job descriptions.
- **Settings**: `SettingsClient.tsx` (Settings form).

#### UI Components (`components/ui/`)

Generic, reusable UI primitives (mostly from shadcn/ui).

- `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `form.tsx`, `table.tsx`, `sonner.tsx` (toast), `alert-dialog.tsx` (new), etc.
- `image-upload.tsx`: Custom component for uploading images.

### Libraries & Utilities (`lib/`)

Core business logic and helpers.

- `auth.ts`: NextAuth configuration and helpers.
- `db.ts`: Database connection and model exports.
- `mongodb.ts`: Native MongoDB connection logic (singleton pattern).
- `mongodb-client.ts`: MongoDB client for NextAuth adapter.
- `storage.ts`: Utilities for file storage.
- `uploadToSupabase.ts`: Helper to upload files to Supabase Storage (if used).
- `utils.ts`: General utility functions (class merging, etc.).
- `constants.ts`: Application constants.
- `validations/`: Zod schemas for form validation.
  - `application.ts`, `company.ts`, `job.ts`.
  - `career.ts`: Updated to include `hasUnpublishedChanges` validation.

### Data Models (`models/`)

Mongoose schemas defining the data structure.

- `User.ts`: Application users.
- `Account.ts`: OAuth accounts linked to users.
- `Session.ts`: User sessions.
- `Company.ts`: Company details.
- `CompanyUser.ts`: Relation between users and companies (roles).
- `Job.ts`: Job postings.
- `Application.ts`: Job applications.
- `CareersPage.ts`: Configuration for a company's careers page. **Added `hasUnpublishedChanges` field.**
- `Section.ts`: Individual sections within a careers page. **Added `publishedData` field for storing the live version of section content. Added `deletedAt` for soft deletes.**
- `VerificationToken.ts`: Email verification tokens.

### Scripts (`scripts/`)

- `seed.ts`: Script to populate the database with initial data.
- `import-jobs-from-csv.ts`: Utility to bulk import jobs.

### Types (`types/`)

TypeScript type definitions.

- `index.ts`: General types.
- `api.ts`: API response types.
- `section.ts`: Types related to career page sections.

### Public Assets (`public/`)

Static files served directly.

- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`: Icons and logos.
