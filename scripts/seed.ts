// Load environment variables FIRST before any other imports
import { config } from 'dotenv'
config()

import fs from 'node:fs/promises'
import path from 'node:path'
import { connectDB, Company, CareersPage, Section, Job } from '../lib/db'

type CsvJobRow = {
    title: string
    work_policy: string
    location: string
    department: string
    employment_type: string
    experience_level: string
    job_type: string
    salary_range: string
    job_slug: string
    posted_days_ago: string
}

function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            // Toggle quote state, handle escaped quotes ("")
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current)
            current = ''
        } else {
            current += char
        }
    }

    result.push(current)
    return result.map((field) => field.trim())
}

function parseHeader(headerLine: string): string[] {
    return parseCsvLine(headerLine)
}

function rowToObject(header: string[], line: string): CsvJobRow | null {
    if (!line.trim()) return null
    const values = parseCsvLine(line)
    if (values.length !== header.length) {
        console.warn('⚠️ Skipping malformed CSV line (column mismatch):', line)
        return null
    }

    const obj: Record<string, string> = {}
    header.forEach((key, idx) => {
        obj[key] = values[idx]
    })

    return obj as CsvJobRow
}

function parsePostedAt(value: string): Date {
    const trimmed = value.trim()
    if (!trimmed) return new Date()

    if (trimmed.toLowerCase().startsWith('posted')) {
        // "Posted today"
        return new Date()
    }

    const match = trimmed.match(/^(\d+)\s+days?\s+ago/i)
    if (match) {
        const days = parseInt(match[1], 10)
        if (!Number.isNaN(days)) {
            const date = new Date()
            date.setDate(date.getDate() - days)
            return date
        }
    }

    return new Date()
}

async function importJobsFromCsv(companyId: any): Promise<{ created: number; updated: number; skipped: number }> {
    const csvPath = path.join(process.cwd(), 'SampleJobsData.csv')

    try {
        const raw = await fs.readFile(csvPath, 'utf8')
        const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)

        if (lines.length < 2) {
            console.warn('⚠️ CSV seems empty or missing rows, skipping job import')
            return { created: 0, updated: 0, skipped: 0 }
        }

        const header = parseHeader(lines[0])
        let created = 0
        let updated = 0
        let skipped = 0

        for (let i = 1; i < lines.length; i++) {
            const row = rowToObject(header, lines[i])
            if (!row) {
                skipped++
                continue
            }

            const postedAt = parsePostedAt(row.posted_days_ago)

            const base = {
                companyId: companyId,
                title: row.title,
                slug: row.job_slug,
                workPolicy: row.work_policy,
                location: row.location,
                department: row.department,
                employmentType: row.employment_type,
                experienceLevel: row.experience_level,
                jobType: row.job_type,
                salaryRange: row.salary_range,
                postedAt,
                published: true,
            }

            const existing = await Job.findOne({ companyId: companyId, slug: row.job_slug })
            if (existing) {
                await Job.updateOne({ _id: existing._id }, base)
                updated++
            } else {
                await Job.create(base)
                created++
            }
        }

        return { created, updated, skipped }
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn('⚠️ SampleJobsData.csv not found, skipping job import')
            return { created: 0, updated: 0, skipped: 0 }
        }
        throw error
    }
}

async function seed() {
    try {
        await connectDB()
        console.log('🌱 Seeding database...')

        // Check if demo company already exists
        const existingDemoCompany = await Company.findOne({ slug: 'demo-company' })

        if (existingDemoCompany) {
            console.log('✅ Demo company already exists')
            // Update with random images if not already set
            if (!existingDemoCompany.logo || !existingDemoCompany.brandBannerUrl) {
                // Generate random seed for consistent images per company
                const seed = existingDemoCompany._id.toString().slice(-6)
                existingDemoCompany.logo = `https://picsum.photos/seed/${seed}-logo/200/200`
                existingDemoCompany.brandBannerUrl = `https://picsum.photos/seed/${seed}-banner/1920/600`
                if (!existingDemoCompany.primaryColor) {
                    existingDemoCompany.primaryColor = '#6366f1' // Indigo
                }
                await existingDemoCompany.save()
                console.log('✅ Updated demo company with random images')
            }
            // Fix existing careers page and sections
            const existingCareersPage = await CareersPage.findOne({ companyId: existingDemoCompany._id })
            if (existingCareersPage) {
                // Set hasUnpublishedChanges to false if page is published
                if (existingCareersPage.published) {
                    existingCareersPage.hasUnpublishedChanges = false
                    await existingCareersPage.save()
                }
                // Update sections to have publishedData if missing
                const existingSections = await Section.find({ careersPageId: existingCareersPage._id })
                for (const section of existingSections) {
                    if (!section.publishedData || Object.keys(section.publishedData).length === 0) {
                        section.publishedData = section.data
                        section.publishedOrder = section.publishedOrder ?? section.order
                        section.publishedEnabled = section.publishedEnabled ?? section.enabled
                        await section.save()
                    }
                }
                console.log('✅ Fixed existing demo company data')
            }
            // Import/update jobs from CSV for existing demo company
            console.log('📥 Importing jobs from SampleJobsData.csv...')
            const jobStats = await importJobsFromCsv(existingDemoCompany._id)
            console.log(`✅ Imported jobs: ${jobStats.created} created, ${jobStats.updated} updated, ${jobStats.skipped} skipped`)
        } else {

            // Create demo company with random images
            // Use a fixed seed for demo-company to get consistent images
            const demoSeed = 'demo-company'
            const company = await Company.create({
                slug: 'demo-company',
                name: 'Demo Company',
                description: 'A modern tech company building the future of careers pages',
                website: 'https://example.com',
                logo: `https://picsum.photos/seed/${demoSeed}-logo/200/200`,
                brandBannerUrl: `https://picsum.photos/seed/${demoSeed}-banner/1920/600`,
                primaryColor: '#6366f1', // Indigo
                secondaryColor: '#8b5cf6', // Purple
            })

            console.log('✅ Created demo company')

            // Create careers page
            const careersPage = await CareersPage.create({
                companyId: company._id,
                published: true,
                hasUnpublishedChanges: false, // No unpublished changes since we're seeding published data
                seoTitle: 'Careers at Demo Company',
                seoDescription: 'Join our team and help build amazing products',
            })

            console.log('✅ Created careers page')

            // Create sections with both data and publishedData (for published pages)
            const sections = [
                {
                    careersPageId: careersPage._id,
                    type: 'HERO' as const,
                    order: 1,
                    enabled: true,
                    publishedOrder: 1,
                    publishedEnabled: true,
                    data: {
                        title: 'Join Our Team',
                        tagline: 'We\'re building the future, one line of code at a time',
                        bannerUrl: undefined,
                    },
                    publishedData: {
                        title: 'Join Our Team',
                        tagline: 'We\'re building the future, one line of code at a time',
                        bannerUrl: undefined,
                    },
                },
                {
                    careersPageId: careersPage._id,
                    type: 'ABOUT' as const,
                    order: 2,
                    enabled: true,
                    publishedOrder: 2,
                    publishedEnabled: true,
                    data: {
                        title: 'About Us',
                        content: 'We are a forward-thinking company dedicated to innovation and excellence. Our team is passionate about creating products that make a difference.',
                    },
                    publishedData: {
                        title: 'About Us',
                        content: 'We are a forward-thinking company dedicated to innovation and excellence. Our team is passionate about creating products that make a difference.',
                    },
                },
                {
                    careersPageId: careersPage._id,
                    type: 'VALUES' as const,
                    order: 3,
                    enabled: true,
                    publishedOrder: 3,
                    publishedEnabled: true,
                    data: {
                        title: 'Our Values',
                        values: [
                            {
                                title: 'Innovation',
                                description: 'We embrace new ideas and creative solutions',
                                icon: '💡',
                            },
                            {
                                title: 'Collaboration',
                                description: 'We work together to achieve great things',
                                icon: '🤝',
                            },
                            {
                                title: 'Excellence',
                                description: 'We strive for the highest quality in everything we do',
                                icon: '⭐',
                            },
                        ],
                    },
                    publishedData: {
                        title: 'Our Values',
                        values: [
                            {
                                title: 'Innovation',
                                description: 'We embrace new ideas and creative solutions',
                                icon: '💡',
                            },
                            {
                                title: 'Collaboration',
                                description: 'We work together to achieve great things',
                                icon: '🤝',
                            },
                            {
                                title: 'Excellence',
                                description: 'We strive for the highest quality in everything we do',
                                icon: '⭐',
                            },
                        ],
                    },
                },
                {
                    careersPageId: careersPage._id,
                    type: 'BENEFITS' as const,
                    order: 4,
                    enabled: true,
                    publishedOrder: 4,
                    publishedEnabled: true,
                    data: {
                        title: 'Benefits & Perks',
                        benefits: [
                            {
                                title: 'Health Insurance',
                                description: 'Comprehensive health coverage',
                                icon: '🏥',
                            },
                            {
                                title: 'Remote Work',
                                description: 'Work from anywhere',
                                icon: '🏠',
                            },
                            {
                                title: 'Learning Budget',
                                description: 'Annual budget for professional development',
                                icon: '📚',
                            },
                            {
                                title: 'Flexible Hours',
                                description: 'Work when you\'re most productive',
                                icon: '⏰',
                            },
                        ],
                    },
                    publishedData: {
                        title: 'Benefits & Perks',
                        benefits: [
                            {
                                title: 'Health Insurance',
                                description: 'Comprehensive health coverage',
                                icon: '🏥',
                            },
                            {
                                title: 'Remote Work',
                                description: 'Work from anywhere',
                                icon: '🏠',
                            },
                            {
                                title: 'Learning Budget',
                                description: 'Annual budget for professional development',
                                icon: '📚',
                            },
                            {
                                title: 'Flexible Hours',
                                description: 'Work when you\'re most productive',
                                icon: '⏰',
                            },
                        ],
                    },
                },
                {
                    careersPageId: careersPage._id,
                    type: 'JOBS_LIST' as const,
                    order: 5,
                    enabled: true,
                    publishedOrder: 5,
                    publishedEnabled: true,
                    data: {
                        title: 'Open Positions',
                        subtitle: 'Check out our current openings',
                    },
                    publishedData: {
                        title: 'Open Positions',
                        subtitle: 'Check out our current openings',
                    },
                },
            ]

            await Section.insertMany(sections)
            console.log('✅ Created sections')

            // Import jobs from CSV
            console.log('📥 Importing jobs from SampleJobsData.csv...')
            const jobStats = await importJobsFromCsv(company._id)
            console.log(`✅ Imported jobs: ${jobStats.created} created, ${jobStats.updated} updated, ${jobStats.skipped} skipped`)
        }

        // Create or update test company
        let testCompany = await Company.findOne({ slug: 'test' })
        if (!testCompany) {
            testCompany = await Company.create({
                slug: 'test',
                name: 'Test Company',
                description: 'A test company for development',
                website: 'https://test.example.com',
            })
            console.log('✅ Created test company')
        }

        // Ensure test company has a published careers page
        let testCareersPage = await CareersPage.findOne({ companyId: testCompany._id })
        if (!testCareersPage) {
            testCareersPage = await CareersPage.create({
                companyId: testCompany._id,
                published: true,
                hasUnpublishedChanges: false,
                seoTitle: 'Careers at Test Company',
                seoDescription: 'Join our test team',
            })
            console.log('✅ Created test careers page')
        } else {
            if (!testCareersPage.published) {
                testCareersPage.published = true
            }
            testCareersPage.hasUnpublishedChanges = false
            await testCareersPage.save()
            console.log('✅ Published test careers page')
        }

        // Ensure test company has at least one section
        const testSections = await Section.find({ careersPageId: testCareersPage._id })
        if (testSections.length === 0) {
            await Section.create({
                careersPageId: testCareersPage._id,
                type: 'HERO',
                order: 1,
                enabled: true,
                publishedOrder: 1,
                publishedEnabled: true,
                data: {
                    title: 'Welcome to Test Company',
                    tagline: 'We are testing our careers page',
                },
                publishedData: {
                    title: 'Welcome to Test Company',
                    tagline: 'We are testing our careers page',
                },
            })
            console.log('✅ Created test section')
        } else {
            // Update existing sections to have publishedData if missing
            for (const section of testSections) {
                if (!section.publishedData || Object.keys(section.publishedData).length === 0) {
                    section.publishedData = section.data
                    section.publishedOrder = section.order
                    section.publishedEnabled = section.enabled
                    await section.save()
                }
            }
        }

        console.log('🎉 Seed completed successfully!')
        console.log(`\n📝 Companies available:`)
        console.log(`   - Demo: http://localhost:3000/demo-company`)
        console.log(`   - Test: http://localhost:3000/test`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    }
}

seed()

