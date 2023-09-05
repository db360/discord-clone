import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";

import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string
    }
}
const  InviteCodePage = async ({
    params
}: InviteCodePageProps) => {

    // Check current profile

    const profile = await currentProfile();

    if(!profile) {
        return redirectToSignIn()
    }

    // Check if we have invite code
    if(!params.inviteCode) {
        return redirect('/')
    }

    // if the user is already part of the server
    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // if its, redirect to the server
    if(existingServer) {
        return redirect(`/servers/${existingServer.id}`)
    }

    // if not, update the server adding the member // default role: Guest
    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }
    });

    if(server) {
        return redirect(`/servers/${server.id}`)
    }

  return null
}

export default InviteCodePage;