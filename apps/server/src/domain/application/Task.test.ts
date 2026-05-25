import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TaskRepository } from "../contracts/Task";
import {
  InvalidTaskTransitionError,
  Task,
  TaskNotFoundError,
  TaskValidationError,
} from "../entities/Task";
import {
  CancelTask,
  CompleteTask,
  CreateTask,
  DeleteTask,
  ListTasks,
  ReopenTask,
  StartTask,
} from "./Task";

function createInMemoryRepository(): TaskRepository {
  const tasks = new Map<string, Task>();
  return {
    create(task) {
      tasks.set(task.id, task);
      return Promise.resolve();
    },
    delete(id) {
      tasks.delete(id);
      return Promise.resolve();
    },
    findAll() {
      return Promise.resolve([...tasks.values()]);
    },
    findById(id) {
      return Promise.resolve(tasks.get(id) ?? null);
    },
    update(task) {
      tasks.set(task.id, task);
      return Promise.resolve();
    },
  };
}

function createSeedTask(): Task {
  const result = Task.create({ title: "Tarefa seed" });
  if (!result.ok) {
    throw new Error("Falha ao criar seed");
  }
  return result.value;
}

describe("CreateTask", () => {
  it("cria e persiste uma tarefa", async () => {
    const repo = createInMemoryRepository();
    const useCase = new CreateTask(repo);

    const result = await useCase.execute({ title: "Nova tarefa" });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.title, "Nova tarefa");

    const found = await repo.findById(result.value.id);
    assert.notEqual(found, null);
  });

  it("retorna erro para título inválido", async () => {
    const repo = createInMemoryRepository();
    const useCase = new CreateTask(repo);

    const result = await useCase.execute({ title: "" });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });
});

describe("ListTasks", () => {
  it("retorna todas as tarefas", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new ListTasks(repo);
    const tasks = await useCase.execute();

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0]?.title, "Tarefa seed");
  });

  it("retorna array vazio quando não há tarefas", async () => {
    const repo = createInMemoryRepository();
    const useCase = new ListTasks(repo);
    const tasks = await useCase.execute();

    assert.equal(tasks.length, 0);
  });
});

describe("StartTask", () => {
  it("inicia uma tarefa pendente", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new StartTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.status, "in_progress");
  });

  it("retorna erro para tarefa inexistente", async () => {
    const repo = createInMemoryRepository();
    const useCase = new StartTask(repo);

    const result = await useCase.execute({ id: "inexistente" });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskNotFoundError);
  });

  it("retorna erro para transição inválida", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    task.start();
    task.complete();
    await repo.create(task);

    const useCase = new StartTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof InvalidTaskTransitionError);
  });
});

describe("CompleteTask", () => {
  it("conclui uma tarefa em progresso", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    task.start();
    await repo.create(task);

    const useCase = new CompleteTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.status, "completed");
    assert.ok(result.value.completedAt instanceof Date);
  });

  it("retorna erro para tarefa inexistente", async () => {
    const repo = createInMemoryRepository();
    const useCase = new CompleteTask(repo);

    const result = await useCase.execute({ id: "inexistente" });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskNotFoundError);
  });
});

describe("CancelTask", () => {
  it("cancela uma tarefa pendente com motivo", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new CancelTask(repo);
    const result = await useCase.execute({
      id: task.id,
      reason: "Não é mais necessário",
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.status, "cancelled");
    assert.equal(result.value.cancellationReason, "Não é mais necessário");
  });

  it("retorna erro para motivo vazio", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new CancelTask(repo);
    const result = await useCase.execute({ id: task.id, reason: "  " });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });
});

describe("ReopenTask", () => {
  it("reabre uma tarefa concluída", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    task.start();
    task.complete();
    await repo.create(task);

    const useCase = new ReopenTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.status, "pending");
    assert.equal(result.value.completedAt, null);
  });

  it("reabre uma tarefa cancelada", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    task.cancel("Engano");
    await repo.create(task);

    const useCase = new ReopenTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.value.status, "pending");
    assert.equal(result.value.cancelledAt, null);
    assert.equal(result.value.cancellationReason, null);
  });

  it("retorna erro para tarefa pendente", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new ReopenTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof InvalidTaskTransitionError);
  });
});

describe("DeleteTask", () => {
  it("exclui uma tarefa existente", async () => {
    const repo = createInMemoryRepository();
    const task = createSeedTask();
    await repo.create(task);

    const useCase = new DeleteTask(repo);
    const result = await useCase.execute({ id: task.id });

    assert.equal(result.ok, true);
    const found = await repo.findById(task.id);
    assert.equal(found, null);
  });

  it("retorna erro para tarefa inexistente", async () => {
    const repo = createInMemoryRepository();
    const useCase = new DeleteTask(repo);

    const result = await useCase.execute({ id: "inexistente" });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskNotFoundError);
  });
});
