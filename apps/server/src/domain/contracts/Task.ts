import type { Task } from "@/domain/entities/Task";

export interface TaskRepository {
  create(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<void>;
}
