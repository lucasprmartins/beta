import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InvalidTaskTransitionError, Task, TaskValidationError } from "./Task";

const TITLE_MAX_LENGTH_PATTERN = /200/;
const PAST_DUE_DATE_PATTERN = /anterior a hoje/;
const CANCELLATION_REASON_PATTERN = /motivo/;
const COMPLETED_STATUS_PATTERN = /completed/;

function createTask(overrides?: { title?: string; description?: string }) {
  const result = Task.create({
    title: overrides?.title ?? "Comprar mantimentos",
    description: overrides?.description,
  });
  if (!result.ok) {
    throw new Error(`Falha ao criar tarefa: ${result.error.message}`);
  }
  return result.value;
}

describe("Task.create", () => {
  it("cria uma tarefa com valores padrão", () => {
    const result = Task.create({ title: "Comprar mantimentos" });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    const task = result.value;
    assert.equal(task.title, "Comprar mantimentos");
    assert.equal(task.description, null);
    assert.equal(task.status, "pending");
    assert.equal(task.priority, "medium");
    assert.equal(task.dueDate, null);
    assert.equal(task.completedAt, null);
    assert.equal(task.cancelledAt, null);
    assert.equal(task.cancellationReason, null);
    assert.ok(task.id);
    assert.ok(task.createdAt instanceof Date);
    assert.ok(task.updatedAt instanceof Date);
  });

  it("cria uma tarefa com todas as opções", () => {
    const dueDate = new Date(Date.now() + 86_400_000);
    const result = Task.create({
      title: "Fazer deploy",
      description: "Deploy em produção",
      priority: "urgent",
      dueDate,
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.value.title, "Fazer deploy");
    assert.equal(result.value.description, "Deploy em produção");
    assert.equal(result.value.priority, "urgent");
    assert.deepEqual(result.value.dueDate, dueDate);
  });

  it("rejeita título vazio", () => {
    const result = Task.create({ title: "" });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
    assert.equal(result.error.message, "O título não pode ser vazio");
  });

  it("rejeita título com apenas espaços", () => {
    const result = Task.create({ title: "   " });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });

  it("rejeita título com mais de 200 caracteres", () => {
    const result = Task.create({ title: "a".repeat(201) });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
    assert.match(result.error.message, TITLE_MAX_LENGTH_PATTERN);
  });

  it("rejeita data limite no passado", () => {
    const result = Task.create({
      title: "Tarefa",
      dueDate: new Date(Date.now() - 86_400_000),
    });

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
    assert.match(result.error.message, PAST_DUE_DATE_PATTERN);
  });

  it("aceita data limite hoje", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const result = Task.create({ title: "Tarefa", dueDate: today });

    assert.equal(result.ok, true);
  });
});

describe("Transições de estado", () => {
  it("pending -> in_progress via start()", () => {
    const task = createTask();
    const result = task.start();

    assert.equal(result.ok, true);
    assert.equal(task.status, "in_progress");
  });

  it("in_progress -> completed via complete()", () => {
    const task = createTask();
    task.start();
    const result = task.complete();

    assert.equal(result.ok, true);
    assert.equal(task.status, "completed");
    assert.ok(task.completedAt instanceof Date);
  });

  it("pending -> completed não é permitido", () => {
    const task = createTask();
    const result = task.complete();

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof InvalidTaskTransitionError);
  });

  it("pending -> cancelled via cancel()", () => {
    const task = createTask();
    const result = task.cancel("Não é mais necessário");

    assert.equal(result.ok, true);
    assert.equal(task.status, "cancelled");
    assert.ok(task.cancelledAt instanceof Date);
    assert.equal(task.cancellationReason, "Não é mais necessário");
  });

  it("in_progress -> cancelled via cancel()", () => {
    const task = createTask();
    task.start();
    const result = task.cancel("Bloqueado por dependência");

    assert.equal(result.ok, true);
    assert.equal(task.status, "cancelled");
  });

  it("cancelamento exige motivo", () => {
    const task = createTask();
    const result = task.cancel("  ");

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
    assert.match(result.error.message, CANCELLATION_REASON_PATTERN);
  });

  it("completed -> pending via reopen()", () => {
    const task = createTask();
    task.start();
    task.complete();
    const result = task.reopen();

    assert.equal(result.ok, true);
    assert.equal(task.status, "pending");
    assert.equal(task.completedAt, null);
  });

  it("cancelled -> pending via reopen()", () => {
    const task = createTask();
    task.cancel("Engano");
    const result = task.reopen();

    assert.equal(result.ok, true);
    assert.equal(task.status, "pending");
    assert.equal(task.cancelledAt, null);
    assert.equal(task.cancellationReason, null);
  });

  it("completed -> in_progress não é permitido", () => {
    const task = createTask();
    task.start();
    task.complete();
    const result = task.start();

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof InvalidTaskTransitionError);
  });

  it("cancelled -> in_progress não é permitido", () => {
    const task = createTask();
    task.cancel("Feito");
    const result = task.start();

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof InvalidTaskTransitionError);
  });
});

describe("Mutações", () => {
  it("changeTitle atualiza o título em tarefa ativa", () => {
    const task = createTask();
    const result = task.changeTitle("Novo título");

    assert.equal(result.ok, true);
    assert.equal(task.title, "Novo título");
  });

  it("changeTitle rejeita título vazio", () => {
    const task = createTask();
    const result = task.changeTitle("");

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });

  it("changeTitle rejeita em tarefa concluída", () => {
    const task = createTask();
    task.start();
    task.complete();
    const result = task.changeTitle("Novo título");

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
    assert.match(result.error.message, COMPLETED_STATUS_PATTERN);
  });

  it("changeDescription atualiza a descrição", () => {
    const task = createTask();
    const result = task.changeDescription("Descrição atualizada");

    assert.equal(result.ok, true);
    assert.equal(task.description, "Descrição atualizada");
  });

  it("changeDescription rejeita em tarefa cancelada", () => {
    const task = createTask();
    task.cancel("Cancelada");
    const result = task.changeDescription("Nova desc");

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });

  it("changePriority atualiza a prioridade", () => {
    const task = createTask();
    const result = task.changePriority("urgent");

    assert.equal(result.ok, true);
    assert.equal(task.priority, "urgent");
  });

  it("changeDueDate atualiza a data limite", () => {
    const task = createTask();
    const future = new Date(Date.now() + 86_400_000);
    const result = task.changeDueDate(future);

    assert.equal(result.ok, true);
    assert.deepEqual(task.dueDate, future);
  });

  it("changeDueDate rejeita data no passado", () => {
    const task = createTask();
    const past = new Date(Date.now() - 86_400_000);
    const result = task.changeDueDate(past);

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.error instanceof TaskValidationError);
  });

  it("changeDueDate aceita null para limpar", () => {
    const task = createTask();
    const result = task.changeDueDate(null);

    assert.equal(result.ok, true);
    assert.equal(task.dueDate, null);
  });

  it("mutações atualizam updatedAt", () => {
    const task = createTask();
    const before = task.updatedAt;

    task.changeTitle("Alterado");

    assert.ok(task.updatedAt.getTime() >= before.getTime());
  });
});

describe("Propriedades computadas", () => {
  it("isActive é true para pending", () => {
    const task = createTask();
    assert.equal(task.isActive, true);
  });

  it("isActive é true para in_progress", () => {
    const task = createTask();
    task.start();
    assert.equal(task.isActive, true);
  });

  it("isActive é false para completed", () => {
    const task = createTask();
    task.start();
    task.complete();
    assert.equal(task.isActive, false);
  });

  it("isActive é false para cancelled", () => {
    const task = createTask();
    task.cancel("Feito");
    assert.equal(task.isActive, false);
  });

  it("isOverdue é false sem data limite", () => {
    const task = createTask();
    assert.equal(task.isOverdue, false);
  });

  it("isOverdue é true quando atrasada e ativa", () => {
    const task = new Task({
      id: "1",
      title: "Tarefa atrasada",
      description: null,
      status: "pending",
      priority: "medium",
      dueDate: new Date(Date.now() - 86_400_000),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    assert.equal(task.isOverdue, true);
  });

  it("isOverdue é false quando concluída mesmo se atrasada", () => {
    const task = new Task({
      id: "1",
      title: "Tarefa concluída",
      description: null,
      status: "completed",
      priority: "medium",
      dueDate: new Date(Date.now() - 86_400_000),
      completedAt: new Date(),
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    assert.equal(task.isOverdue, false);
  });

  it("isOverdue é false quando data limite é no futuro", () => {
    const task = new Task({
      id: "1",
      title: "Tarefa futura",
      description: null,
      status: "pending",
      priority: "medium",
      dueDate: new Date(Date.now() + 86_400_000),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    assert.equal(task.isOverdue, false);
  });
});
