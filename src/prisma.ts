import { PrismaClient } from "@prisma/client";

let p = new PrismaClient();
export default p;
export const prisma = () => (p ||= new PrismaClient());
