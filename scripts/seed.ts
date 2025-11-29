// Load environment variables FIRST before any other imports
import { config } from 'dotenv'
config()

import { connectDB, Company, CompanyUser, CareersPage, Section, Job } from '../lib/db'

async function seed() {
    try {
        await connectDB()
        console.log('🌱 Seeding database...')

        // Check if demo company already exists
        const existingDemoCompany = await Company.findOne({ slug: 'demo-company' })

        if (existingDemoCompany) {
            console.log('✅ Demo company already exists')
        } else {

            // Create demo company
            const company = await Company.create({
                slug: 'demo-company',
                name: 'Demo Company',
                description: 'A modern tech company building the future of careers pages',
                website: 'https://example.com',
            })

            console.log('✅ Created demo company')

            // Create careers page
            const careersPage = await CareersPage.create({
                companyId: company._id,
                published: true,
                seoTitle: 'Careers at Demo Company',
                seoDescription: 'Join our team and help build amazing products',
            })

            console.log('✅ Created careers page')

            // Create sections
            const sections = [
                {
                    careersPageId: careersPage._id,
                    type: 'HERO' as const,
                    order: 1,
                    enabled: true,
                    data: {
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
                    data: {
                        title: 'About Us',
                        content: 'We are a forward-thinking company dedicated to innovation and excellence. Our team is passionate about creating products that make a difference.',
                    },
                },
                {
                    careersPageId: careersPage._id,
                    type: 'VALUES' as const,
                    order: 3,
                    enabled: true,
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
                },
                {
                    careersPageId: careersPage._id,
                    type: 'BENEFITS' as const,
                    order: 4,
                    enabled: true,
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
                },
                {
                    careersPageId: careersPage._id,
                    type: 'JOBS_LIST' as const,
                    order: 5,
                    enabled: true,
                    data: {
                        title: 'Open Positions',
                        subtitle: 'Check out our current openings',
                    },
                },
            ]

            await Section.insertMany(sections)
            console.log('✅ Created sections')

            // Create sample jobs
            const jobs = [
                {
                    companyId: company._id,
                    title: 'Senior Software Engineer',
                    slug: 'senior-software-engineer',
                    description: 'We are looking for an experienced software engineer to join our team.',
                    location: 'San Francisco, CA',
                    department: 'Engineering',
                    employmentType: 'Full-time',
                    experienceLevel: 'Senior',
                    jobType: 'Remote',
                    published: true,
                },
                {
                    companyId: company._id,
                    title: 'Product Designer',
                    slug: 'product-designer',
                    description: 'Join our design team and help create beautiful user experiences.',
                    location: 'New York, NY',
                    department: 'Design',
                    employmentType: 'Full-time',
                    experienceLevel: 'Mid-level',
                    jobType: 'Hybrid',
                    published: true,
                },
                {
                    companyId: company._id,
                    title: 'Marketing Manager',
                    slug: 'marketing-manager',
                    description: 'Lead our marketing efforts and help grow our brand.',
                    location: 'Remote',
                    department: 'Marketing',
                    employmentType: 'Full-time',
                    experienceLevel: 'Senior',
                    jobType: 'Remote',
                    published: true,
                },
            ]

            await Job.insertMany(jobs)
            console.log('✅ Created sample jobs')
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
                seoTitle: 'Careers at Test Company',
                seoDescription: 'Join our test team',
            })
            console.log('✅ Created test careers page')
        } else if (!testCareersPage.published) {
            testCareersPage.published = true
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
                data: {
                    title: 'Welcome to Test Company',
                    tagline: 'We are testing our careers page',
                },
            })
            console.log('✅ Created test section')
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

