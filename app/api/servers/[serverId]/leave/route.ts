import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string}}
) {
    try {
        const profile = await currentProfile();
        if(!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        if(!params.serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                // not the person who created the server
                profileId: {
                    not: profile.id
                },
                // Confirming the id is actually part of the server
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            // Deleting that member using profileid from the members list
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        })

        return NextResponse.json(server);
        
    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}