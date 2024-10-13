import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

const mockTask = {
  _id: '1',
  title: 'Test Task',
  description: 'This is a test task',
  status: 'To Do' as const,
  assignedUser: 'test@example.com',
  createdAt: new Date().toISOString(),
};

const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();

describe('TaskCard', () => {
  it('renders task details correctly', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    expect(screen.getByText('Assigned to: test@example.com')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('opens edit form when edit button is clicked', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });
});