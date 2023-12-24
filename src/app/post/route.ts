import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  // read the body of the request
  const { password, content, username, isPublic } = (await request.json()) as {
    password: string;
    content: string;
    username: string;
    isPublic: boolean;
  };

  // check if the user exists
  const user = await db.user.findUnique({
    where: {
      name: username,
    },
  });

  if (!user) {
    return new Response(JSON.stringify({success: "", error: "User not found." }), {
      status: 404,
    });
  }

  console.log(user)

  if (!user.password) {
    return new Response(JSON.stringify({success: "", error: "User has no password." }), {
      status: 401,
    });
  }

  // check if the password is correct
  if (user.password !== password) {
    return new Response(JSON.stringify({success: "true", error: "Incorrect password." }), {
      status: 401,
    });
  }

  // create the post
  await db.dumps.create({
    data: {
      content,
      isPrivate: !isPublic,
      createdByName: user.name ?? "Anonymous",
      createdBy: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  revalidatePath(`/@${user.name}`);

  return new Response(JSON.stringify({ success: true }));
}