import { useState, useEffect } from "react";
import { auth, storage, db } from "../firebase-config"; // Adjust path as needed
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("https://via.placeholder.com/150");
  const [file, setFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(""); // For re-authentication
  const [loading, setLoading] = useState(false); // To show loading spinner

  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setImage(currentUser.photoURL || "https://via.placeholder.com/150");
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Display the selected image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner

    if (currentUser) {
      try {
        // Re-authenticate the user if a current password is provided
        if (currentPassword) {
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
          );
          await reauthenticateWithCredential(currentUser, credential);
        }

        let photoURL = image;

        // Handle profile picture upload
        if (file) {
          const imageRef = ref(
            storage,
            `profilePictures/${currentUser.uid}/${file.name}`
          );
          await uploadBytes(imageRef, file);
          photoURL = await getDownloadURL(imageRef);
        }

        // Update profile information if there are changes
        if (
          currentUser.displayName !== username ||
          currentUser.photoURL !== photoURL
        ) {
          await updateProfile(currentUser, {
            displayName: username,
            photoURL: photoURL,
          });
        }

        // Update password if needed
        if (password) {
          await updatePassword(currentUser, password);
          setPassword(""); // Clear password field
        }

        // Fetch the user document from Firestore
        const userCollectionRef = collection(db, "users");
        const q = query(userCollectionRef, where("id", "==", currentUser.uid));
        const usersSnap = await getDocs(q);

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          const docRef = doc(db, "users", userDoc.id);

          // Update Firestore with new username and profileComplete status
          await updateDoc(docRef, {
            username: username,
            profileComplete: true, // Mark profile as complete
          });

          console.log("Profile updated successfully in Firestore");

          // Navigate to user page immediately after updating Firestore
          navigate("/user");
        } else {
          console.error("User document not found in Firestore");
        }
      } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Error updating profile: " + error.message);
      } finally {
        setLoading(false); // Hide loading spinner
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md flex max-w-3xl w-full items-start gap-2">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={image}
              alt="User Avatar"
              className="w-48 h-48 rounded object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute bottom-0 right-0 opacity-0 w-12 h-12 cursor-pointer"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
            >
              <span className="sr-only">Change profile picture</span>
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7h18M4 7v12h16V7H4zM3 7v12m0 0h18m0 0V7m0 0h-18"
                />
              </svg>
            </label>
          </div>
        </div>
        <div className="ml-8 flex-1">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Leave blank if you don't want to change"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        
        </div>
        <Link to="/user">
          <button className="text-white pl-2 rounded-md p-2 focus:outline-none bg-red-500">
            <FaTimes className="h-6 w-6" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
