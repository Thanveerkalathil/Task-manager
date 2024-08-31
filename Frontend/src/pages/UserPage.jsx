import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase-config";
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
import { format, parse } from "date-fns";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaRegSquare, FaSquareCheck } from "react-icons/fa6";

const UserPage = () => {
  const sideBarRef = useRef();
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "medium",
    date: "",
    time: "",
    assignedBy: "",
    done: false,
    isDeleted: false,
  });

  const user = users.find((user) => user.email === auth.currentUser.email);

  const sortedUsers = users.sort((a, b) => {
    if (a.id === user?.id) return -1; // Place logged-in user first
    if (b.id === user?.id) return 1; // Place other users after
    return 0; // Maintain original order for others
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
      assignedBy: user.email,
    }));
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (newTask.task === "" || newTask.date === "" || !selectedUserId) {
      alert("Please fill in all fields and select a user");
      return;
    }

    try {
      const userDocRef = doc(db, "users", selectedUserId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // Check if we're editing an existing task
      if (isEditing) {
        // Find and update the task
        const updatedTasks = userData.tasks.map((task) =>
          task.id === currentTaskId ? { ...newTask, id: currentTaskId } : task
        );

        await updateDoc(userDocRef, {
          tasks: updatedTasks,
        });
      } else {
        // Add new task
        const taskWithId = {
          ...newTask,
          assignedBy: user.email,
          id: Date.now(),
        };

        await updateDoc(userDocRef, {
          tasks: arrayUnion(taskWithId),
        });
      }

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
        time: "",
        assignedBy: "",
        done: false,
        isDeleted: false,
      });
      setIsEditing(false);
      setCurrentTaskId(null);
      setIsOpen(false);

      alert(
        isEditing ? "Task updated successfully" : "Task added successfully"
      );
    } catch (error) {
      console.error("Error adding/updating task: ", error);
    }
  };

  const handleEdit = (userId, task) => {
    setIsEditing(true); // Set editing mode
    setCurrentTaskId(task.id); // Store the current task ID
    setNewTask({
      task: task.task,
      priority: task.priority,
      date: task.date, // Update date field
      time: task.time, // Update time field
      done: task.done,
      isDeleted: task.isDeleted,
    });
    setSelectedUserId(userId); // Set the selected user ID
    setIsOpen(true); // Open the modal
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
    const endOfWeek = new Date(today);
    const daysUntilSaturday = 6 - today.getDay(); // 6 represents Saturday
    endOfWeek.setDate(today.getDate() + daysUntilSaturday);

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
            !task.isDeleted &&
            new Date(task.date).toDateString() === today.toDateString()
        );
        break;

      case "weekly":
        filteredTasks = tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return (
            !task.isDeleted && taskDate >= startOfWeek && taskDate <= endOfWeek
          );
        });
        break;

      case "monthly":
        filteredTasks = tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return (
            !task.isDeleted &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
          );
        });
        break;

      case "all":
        filteredTasks = tasks.filter((task) => !task.isDeleted);
        break;

      default:
        filteredTasks = tasks.filter((task) => !task.isDeleted);
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
        user={user ? user.username : ""}
        toggleSidebar={toggleSidebarUser}
        showFilters={true}
        onFilterChange={handleFilterChange}
        className="fixed top-0 left-0 right-0 z-10"
      />
      <div className="flex h-screen flex-1 overflow-x-auto">
        {/* Sidebar */}
        <aside
          ref={sideBarRef}
          className={`sidebar h-full fixed inset-y-0 left-0 bg-gray-200 p-4 pb-6 transition-transform transform overflow-y-auto ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-2/5 lg:w-3/12 w-64 z-20`}
        >
          <div className="w-5/5 flex flex-col justify-center items-center rounded-md bg-zinc-300 p-3">
            <div className="flex flex-row items-center">
              <img
                className="w-[70px] h-[70px] rounded-full"
                src={
                  auth.currentUser.photoURL || "https://via.placeholder.com/150"
                }
                alt="user-dp"
              />
              <div className=" w-full p-2 my-2 rounded-sm">
                <h4 className="capitalize text-md font-semibold">
                  {user ? user.username : ""}
                </h4>
                <h4 className="lowercase text-md font-semibold">
                  {user ? user.email : ""}
                </h4>
                <Link
                  to="/profile"
                  className="text-blue-600 uppercase font-semibold text-[10px] hover:underline hover:underline-offset-1"
                >
                  Edit profile
                </Link>
              </div>
            </div>
          </div>
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
                required
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
                required
                type="date"
                name="date"
                value={newTask.date}
                onChange={handleTaskInput}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Time Input */}
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Time
              </label>
              <input
                required
                type="time"
                name="time"
                value={newTask.time}
                onChange={handleTaskInput}
                id="time"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? "Update task" : "Add task"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Task Lists */}
        <div className="w-full p-4 pb-1 overflow-x-auto flex space-x-4 h-full task-list">
          {sortedUsers.map((user) => (
            <div
              key={user.id}
              className="min-w-[350px] h-full bg-white p-4 rounded shadow overflow-auto"
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
              <div>
                {user.tasks ? (
                  filterTasks(user.tasks).filter((task) => !task.done).length >
                  0 ? (
                    <ul>
                      {filterTasks(user.tasks)
                        .filter((task) => !task.done && !task.isDeleted)
                        .map((task) => (
                          <li
                            key={task.id}
                            className={`task-item p-4 mb-2 border-l-4 ${getBorderColor(
                              task.priority
                            )} bg-white shadow-md rounded flex justify-between items-center`}
                          >
                            <div className="overflow-hidden">
                              <h3
                                className={`${
                                  task.done ? "line-through" : ""
                                } text-lg font-semibold overflow-auto`}
                              >
                                {task.task}
                              </h3>
                              <p className="text-xs font-medium me-3 text-gray-600">
                                <span className="uppercase">Due : </span>
                                {task.date} <br />
                                {format(
                                  parse(task.time, "HH:mm", new Date()),
                                  "hh:mm a"
                                )}
                              </p>
                              <p className="text-xs">
                                <span className="uppercase">by </span>
                                {task.assignedBy || "unknown"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  toggleTaskDone(user.id, task.id, task.done)
                                }
                                className="text-sm text-blue-500 rounded hover:text-blue-800"
                              >
                                {task.done ? (
                                  <FaSquareCheck />
                                ) : (
                                  <FaRegSquare />
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(user.id, task)}
                                className="text-yellow-400 hover:text-yellow-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, task.id)}
                                className="text-sm text-red-500 rounded hover:text-red-700"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No tasks available</p>
                  )
                ) : (
                  <p>No tasks available</p>
                )}
              </div>
              {/* Completed Tasks */}
              <div className="mt-4">
                {user.tasks ? (
                  filterTasks(user.tasks).filter(
                    (task) => task.done && !task.isDeleted
                  ).length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Completed Tasks
                      </h3>
                      <ul>
                        {filterTasks(user.tasks)
                          .filter((task) => task.done && !task.isDeleted)
                          .map((task) => (
                            <li
                              key={task.id}
                              className={`task-item p-4 mb-2 border-l-4 ${getBorderColor(
                                task.priority
                              )} bg-white shadow-md rounded flex justify-between items-center`}
                            >
                              <div className="overflow-hidden">
                                <h3
                                  className={`${
                                    task.done ? "line-through" : ""
                                  } text-lg font-semibold overflow-auto`}
                                >
                                  {task.task}
                                </h3>
                                <p className="text-xs font-medium me-3 text-gray-600">
                                  <span className="uppercase">Due : </span>
                                  {task.date} <br />
                                  {format(
                                    parse(task.time, "HH:mm", new Date()),
                                    "hh:mm a"
                                  )}
                                </p>
                                <p className="text-xs">
                                  <span className="uppercase">by </span>
                                  {task.assignedBy || "unknown"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    toggleTaskDone(user.id, task.id, task.done)
                                  }
                                  className="text-sm text-blue-500 rounded hover:text-blue-800"
                                >
                                  {task.done ? (
                                    <FaSquareCheck />
                                  ) : (
                                    <FaRegSquare />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEdit(user.id, task)}
                                  className="text-yellow-400 hover:text-yellow-800"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id, task.id)}
                                  className="text-sm text-red-500 rounded hover:text-red-700"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No completed tasks available</p>
                  )
                ) : (
                  <p>No completed tasks available</p>
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
