import { Hono } from "hono"
import { Prisma, PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { decode, sign, verify } from "hono/jwt"

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
}>()

//MIDDLEWARE

blogRouter.post("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || ""
  const user = await verify(authHeader, c.env.JWT_SECRET)
  if (user) {
    c.set("userId", user.id)
    next()
  } else {
    c.status(403)
    return c.json({
      msg: "You are not logged in",
    })
  }
  return c.json({ msg: "Auth Done" })
})

//ROUTE FOR CREATING A BLOG

blogRouter.post("/", async (c) => {
  const userId = c.get("userId")
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()
  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  })
  return c.json({
    id: blog.id,
  })
})

//ROUTE FOR UPDATING A BLOG

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()
  const blog = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  })

  return c.json({ msg: "Blog Upfated" })
})

//ROUTE TO GET BLOG

blogRouter.get("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    const body = await c.req.json()
    const blog = await prisma.post.findUnique({
      where: {
        id: body.id,
      },
    })
    return c.json({ blog })
  } catch (e) {
    c.status(411)
    return c.json({
      msg: "Blog do not exist",
    })
  }
})

//ROUTE TO GET ALL THE BLOGS
//sHOULD ADD PAGINATION

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blogs = await prisma.post.findMany()
  return c.json({ blogs })
})
