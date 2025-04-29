import { useEffect, useState } from "react";

type ColumnKey = "todo" | "inProgress" | "done";

interface Item {
  id: number;
  content: string;
}

interface Column {
  name: string;
  items: Item[];
}

type Columns = Record<ColumnKey, Column>;

function App() {
  const [columns, setColumns] = useState<Columns>(() => {
    const savedTasks = localStorage.getItem("Saved Tasks");
    return savedTasks
      ? JSON.parse(savedTasks)
      : {
          todo: {
            name: "To Do",
            items: [{ id: 1, content: "Learning Next.js" }],
          },
          inProgress: {
            name: "In Progress",
            items: [{ id: 2, content: "Learning React" }],
          },
          done: {
            name: "Done",
            items: [{ id: 3, content: "Learning TypeScript" }],
          },
        };
  });
  useEffect(() => {
    localStorage.setItem("Saved Tasks", JSON.stringify(columns));
  }, [columns]);

  const [newTask, setNewTask] = useState("");
  const [activeColumn, setActiveColumn] = useState<ColumnKey>("todo");
  const [draggedItem, setDraggedItem] = useState<{
    columnId: ColumnKey;
    item: Item;
  } | null>(null);

  const addNewTask = () => {
    if (newTask.trim() === "") return;
    const updatedColumns = { ...columns };
    updatedColumns[activeColumn].items.push({
      id: Date.now(),
      content: newTask,
    });
    setColumns(updatedColumns);
    setNewTask("");
  };

  const removeTask = (columnId: ColumnKey, taskId: number) => {
    const updatedColumns = { ...columns };
    updatedColumns[columnId].items = updatedColumns[columnId].items.filter((item: { id: number }) => item.id !== taskId);
    setColumns(updatedColumns);
  };

  const handleDragStart = (columnId: ColumnKey, item: Item) => {
    setDraggedItem({ columnId, item });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnKey) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { columnId: sourceColumnId, item } = draggedItem;
    if (sourceColumnId === columnId) return;
    const updatedColumn = { ...columns };
    updatedColumn[sourceColumnId].items = updatedColumn[sourceColumnId].items.filter((i) => i.id !== item.id);

    updatedColumn[columnId].items.push(item);

    setColumns(updatedColumn);
    setDraggedItem(null);
  };

  const columnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400",
    },
    done: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400",
    },
  };

  return (
    <>
      <div className="px-4 py-15 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="flex items-center justify-center flex-col gap-4 w-full max-w-6xl">
          <h1 className="text-6xl text-center font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-400">React Kanban Board</h1>
          <div className="mb-8 flex flex-col md:flex-row w-full max-w-lg shadow-lg rounded-lg overflow-hidden">
            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new Task..." className="flex-grow p-3 bg-zinc-700 text-white outline-0" onKeyDown={(e) => e.key === "Enter" && addNewTask()} />

            <select value={activeColumn} onChange={(e) => setActiveColumn(e.target.value as ColumnKey)} className="p-3 bg-zinc-700 text-white border-0 border-l outline-0 border-zinc-600">
              {Object.keys(columns).map((columnId) => (
                <option key={columnId} value={columnId}>
                  {columns[columnId as ColumnKey].name}
                </option>
              ))}
            </select>
            <button onClick={addNewTask} className="px-6 bg-gradient-to-r h-10 md:h-auto from-yellow-600 to-amber-500 text-white font-medium hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 cursor-pointer">
              Add
            </button>
          </div>
          <div className="flex gap-6 flex-col lg:flex-row items-center lg:items-start justify-center pb-6 w-full">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className={`flex-shrink-0 w-80 min-h-64 max-w-full bg-zinc-800 rounded-lg shadow-xl border-t-4 ${columnStyles[columnId as ColumnKey].border} `} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, columnId as ColumnKey)}>
                <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId as ColumnKey].header}`}>
                  {columns[columnId as ColumnKey].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">{columns[columnId as ColumnKey].items.length}</span>
                </div>

                <div className="p-3 min-h-64">
                  {columns[columnId as ColumnKey].items.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic text-sm">Drop tasks here</div>
                  ) : (
                    columns[columnId as ColumnKey].items.map((item) => (
                      <div key={item.id} className="p-4 mb-3 bg-zinc-700 text-white rounded-lg shadow-md cursor-move flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg" draggable onDragStart={() => handleDragStart(columnId as ColumnKey, item)}>
                        <span className="mr-2">{item.content}</span>
                        <button onClick={() => removeTask(columnId as ColumnKey, item.id)} className="text-zinc-400 hover:text-red-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600">
                          <span className="text-lg cursor-pointer">x</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
