import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from "hono";
import { hashPassword } from "../support_functions/hashing";
import { signinInput, signupInput } from "@chaiitanya_codes/common-app"
import { decode, sign, verify } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception';
import { string } from 'zod';
import { Secret } from 'jsonwebtoken';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: Secret;
    }
}>();

// to create a user
userRouter.post('/signup', async (c) => {

    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "inputs are not correct"
        })
    }

    const prisma = new PrismaClient(
        {
            datasourceUrl: c.env?.DATABASE_URL,
        }
    ).$extends(withAccelerate())

    console.log("hello")
    // const body = await c.req.json();
    try {

        const non_hashed_password: string = body.password;
        // write the logic to add the hashing
        const hashed_password = await hashPassword(non_hashed_password);

        const user = await prisma.user.create({
            data: {
                username: body.username,
                password: hashed_password,
                name: body.name,
            }
        })
        console.log(`user has been created ${user.username} with userid: ${user.id}`)
        //create and return a jwt using this user_id encoded and create a Jwt_secret under toml file.
        const token = await sign({ id: user.id }, c.env.JWT_SECRET)

        return c.text( token );

    } catch (e) {
        console.log(`the error is:`)
        throw new HTTPException(401, { message: e.message, cause: e })
    }
})

// for signing in
userRouter.post('/signin', async (c) => {

    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "inputs are not correct."
        })
    }

    const prisma = new PrismaClient(
        {
            datasourceUrl: c.env?.DATABASE_URL,
        }
    ).$extends(withAccelerate())

    try {
        //first create the hashed password in the same way
        const password = body.password;
        const hashed_password = await hashPassword(password);

        const user = await prisma.user.findUnique({
            where: {
                username: body.username
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found." });
        }

        if (user.password !== hashed_password) {

            c.status(400);
            return c.json({ error: "password incorrect." });
        }

        const token = await sign(user.id.toString(), c.env.JWT_SECRET);

        return c.text( token );

    } catch (error) {

        c.status(411);
        return c.json({ error: "error while signing in." })
    }

})