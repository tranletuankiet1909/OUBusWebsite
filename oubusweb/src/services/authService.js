import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './configs/firebase';

export const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};
