import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { hashPassword } from "../support_functions/hashing";
import { generate_jwt } from "../support_functions/gen_jwt";
import { signinInput, signupInput } from "../middlewares/zodValidation";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
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

        const user_id: string = user.id;
        //create and return a jwt using this user_id encoded and create a Jwt_secret under toml file.
        const token = await generate_jwt(user_id, c.env.JWT_SECRET);

        return c.json({ token });

    } catch (error) {

        c.status(403);
        return c.json({ error: "error while signing up." });
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
                username: body.username,
                password: hashed_password
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found/password incorrect." });
        }
        
        const token = await generate_jwt(user.id, c.env.JWT_SECRET);

        return c.json({ token });

    } catch (error) {

        c.status(411);
        return c.json({error: "error while signing in."})
    }


})

