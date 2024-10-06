/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'http'
import app from './app'
import config from './app/config'
import prisma from './shared/prisma'

export default async function handler(req: any, res: any) {
  try {
    // Ensure Prisma is connected
    await prisma.$connect()

    await new Promise((resolve, reject) => {
      app(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
  } catch (error: any) {
    console.error('Server error:', error)
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message })
  } finally {
    // Disconnect Prisma to prevent connection pool exhaustion
    await prisma.$disconnect()
  }
}

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}
