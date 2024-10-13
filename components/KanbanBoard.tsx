"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import TaskCard from "./TaskCard"
import TaskForm from "./TaskForm"
import { Button } from "./ui/button"
import { Task } from "@/types/task"
import { io } from "socket.io-client"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()

    socket.on("taskUpdated", (updatedTask: Task) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      )
    })

    socket.on("taskCreated", (newTask: Task) => {
      setTasks((prevTasks) => [...prevTasks, newTask])
    })

    socket.on("taskDeleted", (deletedTaskId: string) => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== deletedTaskId)
      )
    })

    return () => {
      socket.off("taskUpdated")
      socket.off("taskCreated")
      socket.off("taskDeleted")
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        throw new Error("Failed to fetch tasks")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) return

    const updatedTask = tasks.find((task) => task._id === draggableId)
    if (!updatedTask) return

    updatedTask.status = destination.droppableId

    try {
      const response = await fetch(`/api/tasks/${updatedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      })

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        )
        socket.emit("updateTask", updatedTask)
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateTask = async (newTask: {
    title: string
    description: string
    status: "To Do" | "In Progress" | "Done"
    priority: "Low" | "Medium" | "High"
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })

      if (response.ok) {
        const createdTask = await response.json()
        setTasks((prevTasks) => [...prevTasks, createdTask])
        setIsFormOpen(false)
        socket.emit("createTask", createdTask)
        toast({
          title: "Success",
          description: "Task created successfully.",
        })
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      })

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        )
        socket.emit("updateTask", updatedTask)
        toast({
          title: "Success",
          description: "Task updated successfully.",
        })
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
        socket.emit("deleteTask", taskId)
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <Button onClick={() => setIsFormOpen(true)} className="mb-4">
        Add New Task
      </Button>
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTask}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["To Do", "In Progress", "Done"].map((status) => (
            <div key={status} className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">{status}</h2>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onUpdate={handleUpdateTask}
                                onDelete={handleDeleteTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
