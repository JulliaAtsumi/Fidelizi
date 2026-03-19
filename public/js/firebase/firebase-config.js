// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDVFKAW7mlYtCuq-NAl3JtAZZCCXEAl7xo",
    authDomain: "fidelizi-ac69e.firebaseapp.com",
    projectId: "fidelizi-ac69e",
    storageBucket: "fidelizi-ac69e.firebasestorage.app",
    messagingSenderId: "783994917710",
    appId: "1:783994917710:web:5af5df6e5c5d8e3bb4441f",
    measurementId: "G-43L1778V7F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
const db = firebase.firestore();