import mongoose from 'mongoose'

function getMongoUri(): string {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI or DATABASE_URL environment variable inside .env')
    }

    // Validate it's a MongoDB connection string (not PostgreSQL)
    if (MONGODB_URI.startsWith('postgresql://') || MONGODB_URI.startsWith('postgres://')) {
        throw new Error('DATABASE_URL is set to PostgreSQL. Please set MONGODB_URI to a MongoDB connection string instead.')
    }

    return MONGODB_URI
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

declare global {
    var mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
    global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const MONGODB_URI = getMongoUri()
        const opts = {
            bufferCommands: false,
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            return mongooseInstance
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default connectDB

