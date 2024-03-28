import { Hono } from "hono"
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.post("/api/v1/user/signup", async (c) => {
  const body = await c.req.json()

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password,
      },
    })

    return c.text("User Created")
  } catch (e) {
    c.status(411)
    return c.text("User with the emial already exists")
  }
})

app.post("/api/v1/signin", (c) => {
  return c.text("signin route")
})

app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id")
  console.log(id)
  return c.text("get blog route")
})

app.get("/api/v1/blog/", (c) => {
  return c.text("get blog route")
})

app.post("/api/v1/blog", (c) => {
  return c.text("signin route")
})

app.put("/api/v1/blog", (c) => {
  return c.text("signin route")
})

export default app
//postgresql://rayayush47:7VKITYeyBRE8@ep-twilight-art-95085231.us-east-2.aws.neon.tech/DB1?sslmode=require

//DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiYzg5M2U5MTEtZWIwNy00MmY2LThhOTYtYzYyOTg0MjdhMTk2IiwidGVuYW50X2lkIjoiYWM4ODkwZGUxNzBlYmY2MWM5Mjk3ZGMyMDkyODdkNDg1NzJkMGY5YWY4N2ExYWJiNzdjZmUzMGQ3MGZjMGZmZCIsImludGVybmFsX3NlY3JldCI6IjczYjU0YzkzLTE2MjQtNDNhYy1iNmUzLTRlMjcxMGM2MWQ0ZCJ9.30_q73_Mdq1sfy98rQYAFZm8swzsofkLbV9DJzG2f30"
