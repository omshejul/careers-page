# 🚀 Careers Page Builder

A modern, multi-tenant careers page builder that empowers companies to create beautiful, customizable careers pages with ease.

## ✨ Features

- 🎨 **Beautiful UI**: Built with shadcn/ui and Tailwind CSS v4
- 🔐 **Secure Auth**: Google OAuth via NextAuth.js v5
- 🏢 **Multi-Tenant**: Manage multiple companies with role-based access
- 📄 **7 Section Types**: Hero, About, Values, Benefits, Culture Video, Team Locations, Jobs
- 💼 **Job Listings**: Display and manage job openings
- 📱 **Responsive**: Mobile-first design
- ⚡ **Fast**: Built on Next.js 16 with App Router
- 🎬 **Animated**: Smooth Framer Motion animations
- 🔍 **SEO-Optimized**: Server-side rendering with metadata
- 📦 **S3 Storage**: Generic S3-compatible API for file uploads

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js v5
- **Storage**: S3-compatible API (R2, S3, Spaces, etc.)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## 📦 What's Included

### Completed Features

✅ **Authentication System**

- Google OAuth login
- Session management
- Protected routes

✅ **Dashboard**

- Company overview with stats
- Company creation and management
- Role-based access control

✅ **Careers Page Builder**

- 7 customizable section types
- Draft/publish workflow
- SEO settings
- Preview functionality

✅ **Public Careers Pages**

- Beautiful, animated sections
- Job listings integration
- Responsive design
- Server-side rendering

✅ **Data Management**

- 155 sample jobs (seeded from CSV)
- Multi-tenant architecture
- Proper data isolation

## 🚦 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp example.env .env.local
# Edit .env.local with your credentials

# 3. Set up database
pnpm prisma db push
pnpm prisma db seed

# 4. Start development server
pnpm dev
```

## 📸 Demo

Visit these URLs after setup:

- **Home**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Builder**: `http://localhost:3000/demo-company/builder`
- **Public Page**: `http://localhost:3000/demo-company`

## 🗂️ Project Structure

```
careers-page/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public careers pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── careers/          # Section renderers
│   └── builder/          # Builder components
├── lib/                   # Utilities and config
│   ├── validations/      # Zod schemas
│   └── ...
├── prisma/               # Database schema and seed
└── types/                # TypeScript types
```

## 🔐 Storage Setup

This project uses a **generic S3-compatible API** for file storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.):

- Uses AWS SDK v3
- Public bucket for uploaded assets
- Supports all standard S3 operations

See [SETUP.md](./SETUP.md) for configuration details.

## 🎯 Roadmap

Current status: **MVP Complete** ✅

Future enhancements:

- [ ] Interactive section editing
- [ ] Drag-and-drop section reordering
- [ ] Jobs CRUD interface
- [ ] Application submission form
- [ ] Applications management
- [ ] Advanced job filters
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Custom domains

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---
