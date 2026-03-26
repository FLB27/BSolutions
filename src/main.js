import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router_dashboard.js'
import { user } from './user.js'
import 'leaflet/dist/leaflet.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUwcMU33W2tYEMyq2mgwr8Y1aYGzh4R1E",
  authDomain: "bbsolution-dfbb0.firebaseapp.com",
  projectId: "bbsolution-dfbb0",
  storageBucket: "bbsolution-dfbb0.firebasestorage.app",
  messagingSenderId: "1072959484388",
  appId: "1:1072959484388:web:342ac195ef0f1c4dd517f1",
  measurementId: "G-DBSGYHPMEX"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseapp);
export const auth = getAuth(firebaseapp)
export const googleProvider = new GoogleAuthProvider()


const vueApp = createApp(App);
vueApp.use(router); // On "monte" le routeur dans l'application Vue pour qu'il soit pris en compte dans toute l'application
vueApp.mount('#app');



