// Load environment variables before anything else
import { config } from 'dotenv'
config()

import fs from 'node:fs/promises'
import path from 'node:path'
import { connectDB, Company, Job } from '../lib/db'

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

async function importJobsFromCsv() {
    await connectDB()

    const csvPath = path.join(process.cwd(), 'SampleJobsData.csv')
    const raw = await fs.readFile(csvPath, 'utf8')

    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
        console.error('❌ CSV seems empty or missing rows')
        process.exit(1)
    }

    const header = parseHeader(lines[0])

    // Use the demo company by default
    const company = await Company.findOne({ slug: 'demo-company' })
    if (!company) {
        console.error('❌ Demo company (slug "demo-company") not found. Seed the DB first.')
        process.exit(1)
    }

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
            companyId: company._id,
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

        const existing = await Job.findOne({ companyId: company._id, slug: row.job_slug })
        if (existing) {
            await Job.updateOne({ _id: existing._id }, base)
            updated++
        } else {
            await Job.create(base)
            created++
        }
    }

    console.log('✅ Import finished')
    console.log(`   Created: ${created}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
}

importJobsFromCsv()
    .then(() => {
        process.exit(0)
    })
    .catch((err) => {
        console.error('❌ Error importing jobs from CSV:', err)
        process.exit(1)
    })


