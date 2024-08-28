import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase-config";
import {
  arrayUnion,
  writeBatch,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import Modal from "react-minimal-modal";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { FaCheckSquare, FaEdit, FaSquare, FaTrashAlt } from "react-icons/fa";

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
    assign_date: "",
    last_date: "",
    done: false,
    isDeleted: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

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
    e.preventDefault();
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleEdit = (userId, task) => {
    setIsEditing(true); // Set editing mode
    setCurrentTaskId(task.id); // Store the current task ID
    setNewTask({
      task: task.task,
      priority: task.priority,
      assign_date: task.assign_date,
      last_date: task.last_date,
      done: task.done,
      isDeleted: task.isDeleted,
    });
    setSelectedUserId(userId); // Set the selected user ID
    setIsOpen(true); // Open the modal
  };

  const addTask = async (e) => {
    e.preventDefault();

    if (newTask.task === "" || newTask.assign_date === "" || !selectedUserId) {
      alert("Please fill in all fields and select a user");
      return;
    }

    const currentUser = auth.currentUser;

    const taskWithId = {
      ...newTask,
      assignedBy: currentUser.email,
      id: isEditing ? currentTaskId : Date.now(), // Use existing ID if editing
    };

    try {
      const userDocRef = doc(db, "users", selectedUserId);

      // Fetch the current user document
      const userDoc = await getDoc(userDocRef);
      const userTasks = userDoc.data()?.tasks || [];

      if (isEditing) {
        // Editing existing task
        const updatedTasks = userTasks
          .filter((task) => !task.isDeleted)
          .map((task) => (task.id === currentTaskId ? taskWithId : task));

        await updateDoc(userDocRef, {
          tasks: updatedTasks,
        });
      } else {
        // Adding new task
        const filteredTasks = userTasks.filter((task) => !task.isDeleted);

        await updateDoc(userDocRef, {
          tasks: [...filteredTasks, taskWithId],
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
        assign_date: "",
        last_date: "",
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
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    // Calculate the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0); // Normalize to midnight

    // Calculate the start of the current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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
        filteredTasks = tasks.filter((task) => {
          const assignDate = new Date(task.assign_date);
          const lastDate = new Date(task.last_date);
          assignDate.setHours(0, 0, 0, 0); // Normalize dates to midnight
          lastDate.setHours(0, 0, 0, 0);

          return today >= assignDate && today <= lastDate;
        });
        break;

      case "weekly":
        filteredTasks = tasks.filter((task) => {
          const assignDate = new Date(task.assign_date);
          const lastDate = new Date(task.last_date);
          assignDate.setHours(0, 0, 0, 0); // Normalize dates to midnight
          lastDate.setHours(0, 0, 0, 0);

          return assignDate <= today && lastDate >= startOfWeek;
        });
        break;

      case "monthly":
        filteredTasks = tasks.filter((task) => {
          const assignDate = new Date(task.assign_date);
          const lastDate = new Date(task.last_date);
          return (
            (assignDate.getMonth() === today.getMonth() &&
              assignDate.getFullYear() === today.getFullYear()) ||
            (lastDate.getMonth() === today.getMonth() &&
              lastDate.getFullYear() === today.getFullYear())
          );
        });
        break;

      case "yearly":
        filteredTasks = tasks.filter((task) => {
          const assignDate = new Date(task.assign_date);
          const lastDate = new Date(task.last_date);
          return (
            (assignDate.getFullYear() === today.getFullYear() &&
              today >= assignDate &&
              today <= lastDate) ||
            (lastDate.getFullYear() === today.getFullYear() &&
              today >= assignDate &&
              today <= lastDate)
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

  const handleResetTasks = async () => {
      // Show a confirmation dialog to the user
  const userConfirmed = window.confirm("Are you sure you want to delete all tasks for all users?");

  if (!userConfirmed) {
    // If the user clicks "Cancel," exit the function
    return;
  }

    try {
      // Get a reference to the users collection
      const usersCollectionRef = collection(db, "users");

      // Fetch all users
      const usersSnapshot = await getDocs(usersCollectionRef);

      // Initialize a batch instance
      const batch = writeBatch(db);

      // Iterate over each user document
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Check if user has tasks
        if (userData.tasks) {
          // Update all tasks to set isDeleted to true
          const updatedTasks = userData.tasks.map((task) => ({
            ...task,
            isDeleted: true,
          }));

          // Get the document reference for the user
          const userDocRef = doc(db, "users", userId);

          // Add the update operation to the batch
          batch.update(userDocRef, { tasks: updatedTasks });
        }
      });

      // Commit the batch operation
      await batch.commit();

      // Update local state to reflect changes safely
      setUsers((prevUsers) =>
        (prevUsers || []).map((user) => ({
          ...user,
          tasks: (user.tasks || []).map((task) => ({
            ...task,
            isDeleted: true,
          })),
        }))
      );

      console.log("All tasks have been marked as deleted for all users");
    } catch (error) {
      console.error("Error resetting tasks: ", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <Header
        toggleSidebar={toggleSidebarUser}
        showFilters={true}
        onFilterChange={handleFilterChange}
        handleResetTasks={handleResetTasks}
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

        <Modal
          open={isOpen}
          onOpenChange={setIsOpen}
          title={isEditing ? "Edit Task" : "Add Task"}
        >
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

            {/* Assigned Date Input */}
            <div>
              <label
                htmlFor="assign_date"
                className="block text-sm font-medium text-gray-700"
              >
                Assigned Date
              </label>
              <input
                type="date"
                name="assign_date"
                value={newTask.assign_date}
                onChange={handleTaskInput}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Last Date Input */}
            <div>
              <label
                htmlFor="last_date"
                className="block text-sm font-medium text-gray-700"
              >
                Last Date
              </label>
              <input
                type="date"
                name="last_date"
                value={newTask.last_date}
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
                {isEditing ? "Update Task" : "Add Task"}
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
                      .filter((task) => !task.isDeleted && !task.done)
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
                            <p className="text-xs text-gray-600">Assigned:-</p>
                            <p className="text-xs text-gray-600">
                              Date: {task.assign_date}
                            </p>
                            <p className="text-xs text-gray-500 flex">
                              by: {task.assignedBy}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 ">
                              <button
                                onClick={() =>
                                  toggleTaskDone(user.id, task.id, task.done)
                                }
                                className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded"
                                title={
                                  task.done
                                    ? "Undo task, click this button"
                                    : "Complete task, click this button"
                                }
                              >
                                {task.done ? (
                                  <FaCheckSquare className="text-blue-500" />
                                ) : (
                                  <FaSquare className="text-blue-500" />
                                )}
                              </button>

                              <button
                                onClick={() => handleEdit(user.id, task)} // Handler to open modal for editing
                                className="text-yellow-500 hover:text-yellow-700"
                                title={"Edit task"}
                              >
                                <FaEdit />
                              </button>

                              <button
                                onClick={() => handleDelete(user.id, task.id)}
                                className="text-sm p-2 rounded"
                                title={"Delete task"}
                              >
                                <FaTrashAlt className="text-red-500 hover:text-red-700" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600">
                              Last Date: {task.last_date}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No tasks available</p>
                )}
              </div>
              {/* Completed Tasks */}
              <br />
              <hr className="border-t-2 border-gray-300 my-4" />
              <div className="completed-tasks">
                <h3 className="text-lg font-bold mb-2">Completed Tasks</h3>

                {user.tasks ? (
                  <ul>
                    {filterTasks(user.tasks)
                      .filter((task) => !task.isDeleted && task.done)
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
                            <p className="text-xs text-gray-600">Assigned:-</p>
                            <p className="text-xs text-gray-600">
                              Date: {task.assign_date}
                            </p>
                            <p className="text-xs text-gray-500 flex">
                              by: {task.assignedBy}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  toggleTaskDone(user.id, task.id, task.done)
                                }
                                className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded"
                                title={
                                  task.done
                                    ? "Undo task, click this button"
                                    : "Complete task, click this button"
                                }
                              >
                                {task.done ? (
                                  <FaCheckSquare className="text-blue-500" />
                                ) : (
                                  <FaSquare className="text-blue-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(user.id, task)} // Handler to open modal for editing
                                className="text-yellow-500 hover:text-yellow-700"
                                title={"Edit task"}
                              >
                                <FaEdit />
                              </button>{" "}
                              <button
                                onClick={() => handleDelete(user.id, task.id)}
                                className="text-sm p-2 rounded"
                                title={"Delete task"}
                              >
                                <FaTrashAlt className="text-red-500 hover:text-red-700" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600">
                              Last Date: {task.last_date}
                            </p>
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
