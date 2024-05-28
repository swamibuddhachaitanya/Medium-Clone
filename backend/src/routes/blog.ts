import { Hono } from "hono"
import { decode, sign, verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "@chaiitanya_codes/common-app";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

// middleware
blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header('authorization') || "";

    console.log(`the jwt token before split is : ${authHeader}`)
    if (!authHeader) {
        c.status(401);
        return c.json({ error: "unauthorised" });
    }
    try {
        console.log(`the token before split is : ${authHeader}`)
        const token = authHeader.split(' ')[1];
        console.log(`the token after split is : ${token}`)
        const user = await verify(token, c.env.JWT_SECRET);
        if (user) {

            console.log(`userId to be set is ${user}`)

            c.set("userId", user);
            await next();
        }
        else {
            c.status(401);
            return c.json({
                message: "You are not logged in"
            })
        }

    } catch (error) {
        console.error('Error message:', error.message);
        c.status(403);
        return c.json({
            message: "error while logging in"
        })
    }
})

// to create the blog
blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    console.log(`body gotten in post create is: ${body}`)
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }

    const authorId = c.get("userId");
    console.log(`userId is: ${authorId}`)
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId)
            }
        })
        console.log(`blog for title : ${blog.title} has been created`)
        return c.json({
            id: blog.id
        })

    } catch (error) {
        c.status(403);
        return c.json({ error: "error while blog creation." });
    }
})

// to update the blog
blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    console.log(`body gotten is: ${body}`)
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const blog = await prisma.blog.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        })
        return c.json({
            id: blog.id
        })
    } catch (error) {
        c.status(411);
        return c.json({ error: "error while updating blog." })
    }

})

// to show all the blogs
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const blogs = await prisma.blog.findMany({
            select: {
                content: true,
                title: true,
                id: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return c.json({
            blogs
        })

    } catch (error) {
        c.status(411);
        return c.json({ error: "error while showing the blogs." })
    }

})

// show the blog post based on its blog id
blogRouter.get('/:id', async (c) => {

    const id = c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return c.json({
            blog
        })

    } catch (error) {
        c.status(411);
        return c.json({ error: "error while showing the blog post." })

    }
})