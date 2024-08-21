import { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs } from "firebase/firestore";
import Modal from "react-minimal-modal";
// import TaskModal from "../components/TaskModal";

const UserPage = () => {
  const navigate = useNavigate();
  //   const users = [
  //     { id: '1', name: 'User 1' },
  //     { id: '2', name: 'User 2' },
  //     { id: '3', name: 'User 3' },
  //   ];
  const [users, setUsers] = useState([]);
  //   const [user, serUser] = useState(null);

  //   const fetchUserData = async () => {
  //     auth.onAuthStateChanged(async (user) => {
  //       const docRef = doc(db, "Users", user.uid);

  //     });
  //   };

  //   const [tasks, setTasks] = useState(
  //     users.reduce((acc, user) => {
  //       acc[user.id] = [];
  //       return acc;
  //     }, {})
  //   );
  const [isOpen, setIsOpen] = useState();
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "",
    date: "",
  });
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

  const user = auth.currentUser();
  console.log(user);

  //   const addTask = (userId) => {
  //     if (newTask.trim() === "") return;

  //     setTasks({
  //       ...tasks,
  //       [userId]: [
  //         ...tasks[userId],
  //         { text: newTask, done: false, priority: selectedPriority },
  //       ],
  //     });

  //     setNewTask("");
  //   };

  const addTask = async () => {
    setNewTask();
  };

  //   const markTaskDone = (userId, taskIndex) => {
  //     const updatedTasks = tasks[userId].map((task, index) =>
  //       index === taskIndex ? { ...task, done: !task.done } : task
  //     );
  //     setTasks({ ...tasks, [userId]: updatedTasks });
  //   };

  //   const deleteTask = (userId, taskIndex) => {
  //     const updatedTasks = tasks[userId].filter(
  //       (_, index) => index !== taskIndex
  //     );
  //     setTasks({ ...tasks, [userId]: updatedTasks });
  //   };

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
              <h3>{user.username}</h3>
              <h3>{user.email}</h3>
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

      <Modal open={isOpen} onOpenChange={setIsOpen} title="Hello">
        <form className="space-y-4" onSubmit={() => addTask()}>
          {/* Task Input */}
          <div>
            <label
              htmlFor="task"
              className="block text-sm font-medium text-gray-700"
            >
              Task
            </label>
            <input
              type="text"
              onChange={(e) => {e.target.value}}
              id="task"
              placeholder="Enter task"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Priority Input */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>
      {/* Task Lists */}
      <div className="w-4/5 p-4 overflow-x-auto flex space-x-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="min-w-[300px] bg-white p-4 rounded shadow"
          >
            <h2 className="text-xl flex justify-between font-bold mb-4 capitalize">
              {`${user.username}'s Tasks`}
              <button
                onClick={() => setIsOpen(true)}
                className="text-blue-600 hover:cursor-pointer text-2xl"
              >
                +
              </button>
            </h2>

            {/* <div className="flex items-center mb-4">
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
                onClick={addTask}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Task
              </button>
            </div> */}
            {/* <ul className="space-y-2">
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
            </ul> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
