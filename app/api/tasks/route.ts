import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, status, priority } = await request.json()
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        userId: session.user.id,
      },
    })
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
