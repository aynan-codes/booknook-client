import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb";

const client = await clientPromise;
const db = client.db(process.env.DB_NAME || "booknook");

export const auth = betterAuth({
database: mongodbAdapter(db),

secret: process.env.BETTER_AUTH_SECRET,
baseURL: process.env.BETTER_AUTH_URL,

emailAndPassword: {
enabled: true,
},

socialProviders: {
google: {
clientId: process.env.GOOGLE_CLIENT_ID!,
clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
},
},
});
