// @ts-nocheck
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import xhamsterHome from './handlers/xhamster/home/index.js';

const app = new Hono()

// 添加CORS中间件
app.use('*', cors())

app.get('/api/xhamster', async (c) => {
  return await xhamsterHome(c)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})