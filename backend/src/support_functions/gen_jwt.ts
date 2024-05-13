import { sign } from 'hono/jwt';

export async function generate_jwt(userId: string, secret:string):Promise<string> {
    
    const payload = {
        id: userId
    }
    const jwt = await sign(payload, secret);
    return jwt;
}