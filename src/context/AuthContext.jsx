import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function logout() {
        return signOut(auth);
    }

    function updateUserProfile(name, photoURL) {
        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photoURL
        });
    }

    function updateUserEmail(email) {
        return updateEmail(auth.currentUser, email);
    }

    function updateUserPassword(password) {
        return updatePassword(auth.currentUser, password);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        loginWithGoogle,
        logout,
        logout,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
