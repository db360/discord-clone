import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

// Reutilizamos la instancia de prisma si existe
export const db = globalThis.prisma || new PrismaClient()

if( process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db
}