// Add this import
import { Task } from "@/types/task"
import { Badge } from "./ui/badge"

// Assuming task is passed as a prop to the component
interface TaskCardProps {
  task: {
    priority: "High" | "Medium" | "Low"
  }
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => (
  // Add this inside the CardContent
  <Badge
    variant={
      task.priority === "High"
        ? "destructive"
        : task.priority === "Medium"
        ? "default"
        : "secondary"
    }
  >
    {task.priority}
  </Badge>
)

export default TaskCard
