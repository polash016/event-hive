/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'http'
import app from './app'
import config from './app/config'

export default async function handler(req: any, res: any) {
  // Forward the request to our Express app
  await new Promise((resolve, reject) => {
    app(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}
