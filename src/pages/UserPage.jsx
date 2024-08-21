import { useEffect, useRef, useState } from "react";
import { db } from "../firebase-config";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Modal from "react-minimal-modal";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const UserPage = () => {
  const sideBarRef = useRef();
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "medium",
    date: "",
    done: false,
    isDeleted: false,
  });

  useEffect(() => {
    const userCollectionRef = collection(db, "users");
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef);
      const userArray = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsers(userArray);
    };
    getUsers();
  }, [newTask]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebarUser = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTaskInput = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (newTask.task === "" || newTask.date === "" || !selectedUserId) {
      alert("Please fill in all fields and select a user");
      return;
    }

    const taskWithId = {
      ...newTask,
      id: Date.now(), // Add a unique ID
    };

    try {
      const userDocRef = doc(db, "users", selectedUserId);
      await updateDoc(userDocRef, {
        tasks: arrayUnion(taskWithId),
      });

      // Fetch the updated user data
      const updatedUserData = await getDoc(userDocRef);
      const updatedUser = { ...updatedUserData.data(), id: updatedUserData.id };

      // Update the users state to reflect changes
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId ? updatedUser : user
        )
      );

      // Reset the form and close the modal
      setNewTask({
        task: "",
        priority: "medium",
        date: "",
        done: false,
        isDeleted: false,
      });
      setIsOpen(false);

      alert("Task added successfully");
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const handleDelete = async (userId, taskId) => {
    try {
      // Get the reference to the user document
      const userDocRef = doc(db, "users", userId);

      // Fetch the current tasks for the user
      const userSnapshot = await getDoc(userDocRef);
      const userTasks = userSnapshot.data().tasks;

      // Update the specific task's isDeleted field to true
      const updatedTasks = userTasks.map((task) =>
        task.id === taskId ? { ...task, isDeleted: true } : task
      );

      // Update the Firestore document with the updated tasks
      await updateDoc(userDocRef, { tasks: updatedTasks });

      // Update the users state to reflect the change in the UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, tasks: updatedTasks } : user
        )
      );

      console.log("Task marked as deleted in Firestore and UI updated");
    } catch (error) {
      console.error("Error marking task as deleted: ", error);
    }
  };

  const toggleTaskDone = async (userId, taskId, currentStatus) => {
    try {
      // Get the reference to the user document
      const userDocRef = doc(db, "users", userId);

      // Fetch the current tasks for the user
      const userSnapshot = await getDoc(userDocRef);
      const userTasks = userSnapshot.data()?.tasks || [];

      // Create an updated tasks array with the toggled done status
      const updatedTasks = userTasks.map((task) =>
        task.id === taskId ? { ...task, done: !currentStatus } : task
      );

      // Update the tasks array in Firestore
      await updateDoc(userDocRef, { tasks: updatedTasks });

      // Update the users state to reflect the change in the UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, tasks: updatedTasks } : user
        )
      );
      console.log("Task status updated");
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getBorderColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-green-500";
      default:
        return "border-gray-300";
    }
  };

  const openTaskModal = (userId) => {
    setSelectedUserId(userId);
    setIsOpen(true);
  };

  const filterTasks = (tasks) => {
    const today = new Date();

    // Calculate the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Define priority order
    const priorityOrder = {
      high: 1,
      medium: 2,
      low: 3,
    };

    // Filter tasks based on the filter type
    let filteredTasks = [];

    switch (filterType) {
      case "daily":
        filteredTasks = tasks.filter(
          (task) =>
            new Date(task.date).toDateString() === new Date().toDateString()
        );
        break;

      case "weekly":
        filteredTasks = tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return taskDate >= startOfWeek && taskDate <= today;
        });
        break;

      case "monthly":
        filteredTasks = tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return (
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
          );
        });
        break;

      case "all":
        filteredTasks = tasks;
        break;

      default:
        filteredTasks = tasks;
        break;
    }

    // Sort the filtered tasks by priority
    return filteredTasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <Header
        toggleSidebar={toggleSidebarUser}
        showFilters={true}
        onFilterChange={handleFilterChange}
        className="fixed top-0 left-0 right-0 z-10"
      />
      <div className="flex h-full flex-1">
        {/* Sidebar */}
        <aside
          ref={sideBarRef}
          className={`sidebar h-5/6 fixed inset-y-0 left-0 bg-gray-200 p-4 pb-6 transition-transform transform overflow-y-scroll ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-1/5 w-64 z-20`}
        >
          <Link to="/profile">
            <button className="bg-blue-500 text-md rounded-md px-4 py-2">
              Profile
            </button>
          </Link>
          <h2 className="text-lg font-bold mb-4">Users</h2>

          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-2 bg-white rounded shadow">
                <h3>{user.username}</h3>
                <h3>{user.email}</h3>
              </li>
            ))}
          </ul>
        </aside>

        <Modal open={isOpen} onOpenChange={setIsOpen} title="Hello">
          <form className="space-y-4" onSubmit={addTask}>
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
                name="task"
                value={newTask.task}
                onChange={handleTaskInput}
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
                name="priority"
                value={newTask.priority}
                onChange={handleTaskInput}
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
                name="date"
                value={newTask.date}
                onChange={handleTaskInput}
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
        <div className="w-4/5 p-4 overflow-x-auto flex space-x-4 h-5/6 overflow-scroll">
          {users.map((user) => (
            <div
              key={user.id}
              className="min-w-[300px] bg-white p-4 rounded shadow"
            >
              <h2 className="text-xl flex justify-between font-bold mb-4 capitalize">
                {`${user.username}'s Tasks`}
                <button
                  onClick={() => openTaskModal(user.id)}
                  className="text-blue-600 hover:cursor-pointer text-2xl"
                >
                  +
                </button>
              </h2>
              <div className="task-list">
                {user.tasks ? (
                  <ul>
                    {filterTasks(user.tasks)
                      .filter((task) => !task.isDeleted)
                      .map((task) => (
                        <li
                          key={task.id}
                          className={`task-item p-4 mb-2 border-l-4 ${getBorderColor(
                            task.priority
                          )} bg-white shadow-md rounded flex justify-between items-center`}
                        >
                          <div>
                            <h3
                              className={`${
                                task.done ? "line-through" : ""
                              } text-xl font-semibold`}
                            >
                              {task.task}
                            </h3>
                            <p className="text-sm text-gray-600">{task.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                toggleTaskDone(user.id, task.id, task.done)
                              }
                              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              {task.done ? "Undo" : "Done"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, task.id)}
                              className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No tasks available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
