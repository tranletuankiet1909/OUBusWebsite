import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAx-pi9mVuj_nqQ3sX5x9VkAe81NTUtZyM",
    authDomain: "ou-bus.firebaseapp.com",
    projectId: "ou-bus",
    storageBucket: "ou-bus.appspot.com",
    messagingSenderId: "127264855841",
    appId: "1:127264855841:web:ebc57d4b580567c726d060",
    measurementId: "G-JDXGMDH5J0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };
