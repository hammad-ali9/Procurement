import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyArFu9oNV6uekke-SPkje6nKm5IOG1z6Fk",
    authDomain: "procurement-25200.firebaseapp.com",
    projectId: "procurement-25200",
    storageBucket: "procurement-25200.firebasestorage.app",
    messagingSenderId: "237939824598",
    appId: "1:237939824598:web:d649f44f778f6ec932f677",
    measurementId: "G-4MQ0C1HT0K"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
