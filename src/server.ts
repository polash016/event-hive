/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'http'
import app from './app'
import config from './app/config'

const PORT = process.env.PORT || 3000

async function main() {
  const server: Server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

main()
