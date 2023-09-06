import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string}}
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url)

        const serverId = searchParams.get("serverId")


        if(!profile) {
            return new NextResponse("Unauthorized", { status: 401});
        }

        if(!serverId) {
            return new NextResponse("Server ID missing", { status: 400});
        }

        if(!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400});
        }

        const server = await db.server.update({
            // updating the server that matches the serverId where current user is admin
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                // looking though members
                members: {
                    // Delete members that matches the id, but not theirself id
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            // include members and their profiles cos we needed for the model update
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log(["MEMBER_ID_DELETE"], error)
        return new NextResponse("Internal Server Error", { status: 500});
    }
}

export async function PATCH (
    req: Request,
    { params }: { params: { memberId: string}}
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url)
        const { role } = await req.json();

        const serverId = searchParams.get("serverId")

        if(!profile) {
            return new NextResponse("Unauthorized", { status: 401});
        }

        if(!serverId) {
            return new NextResponse("Server ID missing", { status: 400});
        }

        if(!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400});
        }

        const server = await db.server.update({
            // Server using serverid and current profile id
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                // Find member using memberid and current profile id
                members: {
                    update:{
                        // checks if its not currently logged
                        where: {
                            id: params.memberId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        // updates data->role
                        data: {
                            role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {

        console.log("[MEMBERS_ID_PATCH]", error)
        return new NextResponse("Internal Server Error", { status: 500});
    }
}