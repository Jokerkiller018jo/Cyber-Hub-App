import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createReadStream, statSync } from 'node:fs'

const HEX_FILE = 'C:\\Users\\M S N\\.gemini\\antigravity\\scratch\\all_hex_colors.txt'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-hex-colors-file',
      configureServer(server) {
        server.middlewares.use('/all_hex_colors.txt', (req, res) => {
          try {
            const stat = statSync(HEX_FILE)
            const fileSize = stat.size

            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Headers', 'Range')
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges')

            const rangeHeader = req.headers['range']
            if (rangeHeader) {
              const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
              if (match) {
                const startByte = parseInt(match[1])
                const endByte   = match[2] ? parseInt(match[2]) : fileSize - 1
                const chunkSize = endByte - startByte + 1
                res.statusCode = 206
                res.setHeader('Content-Range', `bytes ${startByte}-${endByte}/${fileSize}`)
                res.setHeader('Content-Length', chunkSize)
                createReadStream(HEX_FILE, { start: startByte, end: endByte }).pipe(res)
                return
              }
            }

            res.statusCode = 200
            res.setHeader('Content-Length', fileSize)
            createReadStream(HEX_FILE).pipe(res)
          } catch (err) {
            res.statusCode = 500
            res.end('Error serving hex file: ' + err.message)
          }
        })
      },
    },
  ],
})
