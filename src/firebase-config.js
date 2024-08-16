
import { initializeApp } from "firebase/app";
import {getFirestore} from '@firebase/firestore'
import {getAuth} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyDqBXswWm3YaZpzkx6e8XAybK343SWWk5k",
    authDomain: "task-manager-931cc.firebaseapp.com",
    projectId: "task-manager-931cc",
    storageBucket: "task-manager-931cc.appspot.com",
    messagingSenderId: "546543860137",
    appId: "1:546543860137:web:f34369f4bb80478f286cb8",
    measurementId: "G-TZ8SK74H41"
  };
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth();