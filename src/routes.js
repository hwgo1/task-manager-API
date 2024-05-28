import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { formatDate, formateDateWithTime } from "./utils/formatDate.js";
import { BuildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: BuildRoutePath("/tasks"),
    handler: (req, res) => {
      if (!req.body) {
        return res.writeHead(400).end(JSON.stringify({ error: "Invalid JSON" }));
      }

      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(400).end(JSON.stringify({ error: "Title and description are required" }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: formatDate(new Date()),
        completed: false,
        completed_at: null,
        updated_at: formateDateWithTime(new Date())
      };

      database.insert(task, "tasks");
      return res.writeHead(201).end("");
    },
  },
  {
    method: "GET",
    path: BuildRoutePath("/tasks"),
    handler: (req, res) => {
      const tasks = database.select("tasks");
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "GET",
    path: BuildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.parameters;
      const task = database.select("tasks", { id });

      if (task.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }

      return res.end(JSON.stringify(task[0]));
    },
  },
  {
    method: "PUT",
    path: BuildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.parameters;
      const existingTask = database.select("tasks", { id });

      if (existingTask.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }

      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(400).end(JSON.stringify({ error: "Title and description are required" }));
      }

      const updatedTask = {
        ...existingTask[0],
        title,
        description,
        updated_at: formateDateWithTime(new Date())
      };

      database.update(id, updatedTask, "tasks");
      return res.writeHead(200).end("");
    },
  },
  {
    method: "PATCH",
    path: BuildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.parameters;
      const existingTask = database.select("tasks", { id });

      if (existingTask.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }

      const { title, description, completed } = req.body;

      const updatedTask = {
        ...existingTask[0],
        title: title || existingTask[0].title,
        description: description || existingTask[0].description,
        updated_at: formateDateWithTime(new Date()),
        completed: completed !== undefined ? completed : existingTask[0].completed,
        completed_at: completed ? formateDateWithTime(new Date()) : existingTask[0].completed_at
      };

      database.update(id, updatedTask, "tasks");
      return res.writeHead(200).end("");
    },
  },
  {
    method: "DELETE",
    path: BuildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.parameters;
      const existingTask = database.select("tasks", { id });

      if (existingTask.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ error: "Task not found" }));
      }

      database.delete(id, "tasks");
      return res.writeHead(204).end(); // 204 No Content
    },
  }
];