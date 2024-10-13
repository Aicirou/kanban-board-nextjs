import KanbanBoard from "@/components/KanbanBoard"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import LoginButton from "@/components/LoginButton"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoginButton />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Kanban Board</h1>
      <KanbanBoard />
    </div>
  )
}
