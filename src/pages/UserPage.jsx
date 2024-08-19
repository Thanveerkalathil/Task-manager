import { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import TaskModal from "../components/TaskModal";

const UserPage = () => {
  const navigate = useNavigate();
  //   const users = [
  //     { id: '1', name: 'User 1' },
  //     { id: '2', name: 'User 2' },
  //     { id: '3', name: 'User 3' },
  //   ];
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState(
    users.reduce((acc, user) => {
      acc[user.id] = [];
      return acc;
    }, {})
  );
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("medium");

  const userCollectionRef = collection(db, "users");

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef);
      console.log(data.docs);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getUsers();
  }, []);

  const addTask = (userId) => {
    if (newTask.trim() === "") return;

    setTasks({
      ...tasks,
      [userId]: [
        ...tasks[userId],
        { text: newTask, done: false, priority: selectedPriority },
      ],
    });

    setNewTask("");
  };

  const markTaskDone = (userId, taskIndex) => {
    const updatedTasks = tasks[userId].map((task, index) =>
      index === taskIndex ? { ...task, done: !task.done } : task
    );
    setTasks({ ...tasks, [userId]: updatedTasks });
  };

  const deleteTask = (userId, taskIndex) => {
    const updatedTasks = tasks[userId].filter(
      (_, index) => index !== taskIndex
    );
    setTasks({ ...tasks, [userId]: updatedTasks });
  };

  const handleUserLogOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
      console.log("User logged out");
    } catch {
      console.log("error");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">Users</h2>

        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-2 bg-white rounded shadow">
              {user.name}
            </li>
          ))}
        </ul>
        <button
          onClick={handleUserLogOut}
          className="py-2 px-4 mt-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>

      {/* Task Lists */}
      <div className="w-4/5 p-4 overflow-x-auto flex space-x-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="min-w-[300px] bg-white p-4 rounded shadow"
          >
            <h2 className="text-lg font-bold mb-4">{user.name}s Tasks</h2>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New task"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="ml-2 px-3 py-2 border border-gray-300 rounded"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={() => <TaskModal isTrue />}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Task
              </button>
            </div>
            <ul className="space-y-2">
              {tasks[user.id].map((task, index) => (
                <li
                  key={index}
                  className={`p-2 rounded shadow flex justify-between items-center ${
                    task.done ? "line-through text-gray-400" : ""
                  }`}
                  style={{
                    borderColor:
                      task.priority === "high"
                        ? "red"
                        : task.priority === "medium"
                        ? "orange"
                        : "green",
                    borderWidth: "2px",
                  }}
                >
                  {task.text}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markTaskDone(user.id, index)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      {task.done ? "Undo" : "Done"}
                    </button>
                    <button
                      onClick={() => deleteTask(user.id, index)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
