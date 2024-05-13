import { Hono } from "hono"
import { JwtPayload, verify } from "jsonwebtoken";
import { createBlogInput, updateBlogInput } from "../middlewares/zodValidation";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";

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
blogRouter.use("/*",async (c,next)=>{
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader,c.env.JWT_SECRET) as JwtPayload;
        if(user){
            c.set("userId",user.id);
            await next();
        }
        else{
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }

    } catch (error) {
        c.status(403);
        return c.json({
            message: "You're not logged in"
        })
    }
})

// to create the blog
blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }

    const authorId = c.get("userId");
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
        return c.json({
            id: blog.id;
        })

    } catch (error) {
        c.status(403);
        return c.json({ error: "error while blog creation." });
    }
})

// to update the blog
blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body);
    if(!success){
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
        return c.json({error: "error while updating blog."})
    }


})

// to show all the blogs
blogRouter.get('/bulk',async (c) => {
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
        return c.json({error: "error while showing the blogs."})
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
        return c.json({error: "error while showing the blog post."})
        
    }
})