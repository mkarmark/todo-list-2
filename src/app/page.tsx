"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const DB_URL = "https://todo-list-2--mk060700v11nl.data.appgroupstest3.mitalicustomdomain.net/keyValuePairs";
const DB_TOKEN = "a3a761ff4851472c8648ce58d8c4ef66";

interface Todo {
  id: string;
  text: string;
}

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${DB_URL}/list`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${DB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ AreAllUsersAndGlobalKeysReturned: true }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.keyValuePairs) return [];
  return Object.entries(data.keyValuePairs).map(([id, text]: [string, any]) => ({ id, text: String(text) }));
}

async function addTodo(text: string): Promise<Todo> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await fetch(`${DB_URL}/createOrUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${DB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: id, value: text }),
  });
  return { id, text };
}

async function removeTodo(id: string) {
  await fetch(`${DB_URL}/remove`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${DB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: id }),
  });
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos().then((t) => {
      setTodos(t);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    const todo = await addTodo(input.trim());
    setTodos((prev) => [...prev, todo]);
    setInput("");
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    setRemoving(id);
    await removeTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setRemoving(null);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: 480, width: "100%" }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>My Todo List</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>Stay organized and productive.</p>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new todo..."
            className={styles.input}
            disabled={adding}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }}
          />
          <button
            type="submit"
            className={styles.primary}
            disabled={adding || !input.trim()}
            style={{ minWidth: 100 }}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>
        <div style={{ background: "var(--gray-alpha-100)", borderRadius: 12, padding: 24, minHeight: 180 }}>
          {loading ? (
            <div>Loading todos...</div>
          ) : todos.length === 0 ? (
            <div style={{ color: "#aaa" }}>No todos yet. Add your first one!</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {todos.map((todo) => (
                <li key={todo.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <span style={{ fontSize: 18 }}>{todo.text}</span>
                  <button
                    onClick={() => handleRemove(todo.id)}
                    className={styles.secondary}
                    disabled={removing === todo.id}
                    style={{ marginLeft: 16 }}
                  >
                    {removing === todo.id ? "Removing..." : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <span style={{ color: "#aaa", fontSize: 14 }}>Todo App &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
