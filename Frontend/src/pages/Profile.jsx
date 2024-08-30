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
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(""); // For re-authentication
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        setUsername(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setImage(currentUser.photoURL || "https://via.placeholder.com/150");

        // Fetch user data from Firestore to display existing values
        const userCollectionRef = collection(db, "users");
        const q = query(userCollectionRef, where("id", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUsername(userDoc.data().username || currentUser.displayName);
        }
      }
    };
    fetchUserData();
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
    setLoading(true);

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

        // Handle profile picture upload
        let photoURL = image; // Default to existing image
        if (file) {
          // Upload new profile picture
          const imageRef = ref(
            storage,
            `profilePictures/${currentUser.uid}/${file.name}`
          );
          await uploadBytes(imageRef, file);
          photoURL = await getDownloadURL(imageRef);
          console.log("Uploaded photo URL:", photoURL);
        }

        // Update profile information
        await updateProfile(currentUser, {
          displayName: username,
          photoURL: photoURL,
        });

        // Update Firestore with new username
        const userCollectionRef = collection(db, "users");
        const q = query(userCollectionRef, where("id", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
          await updateDoc(userDocRef, {
            username: username,
            photoURL: photoURL,
          });
          console.log("Username and photoURL updated successfully");
        } else {
          console.error("User document not found");
          alert("User document not found. Please check if the user exists.");
        }

        // Update password if provided
        if (password) {
          await updatePassword(currentUser, password);
          setPassword(""); // Clear password field
        }

        // Clear currentPassword field
        setCurrentPassword("");

        alert("Profile updated successfully!");
        navigate("/user"); // Redirect to the user page after update
      } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Error updating profile: " + error.message);
      } finally {
        setLoading(false);
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
              className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
            >
              <span className="sr-only">Change profile picture</span>
              <FaCloudUploadAlt />
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
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
        <Link to="/">
          <button className="text-slate-800 hover:text-red-600">
            <IoIosCloseCircleOutline className="h-8 w-8" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
