import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signOut } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { create_users }  from './table/users_table';
import { useAuthContext } from './contexts/AuthContext';


const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// analytics
export function getAnaly() {
    //  本番環境のみFirebase Analyticsを有効にする
    if (process.env.REACT_APP_ENV === 'PROD') {
        // firebase analytics
        getAnalytics(app);
    }
}

// auth
const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
// SignUp
export const SignUp = () => {

    try{
        signInWithPopup(auth, provider).then((result) => {
            // console.log("signUp result: ", result.user.uid);
            // databaseにuidとdisplayNameを登録
            create_users({user_id: result.user.uid, name: result.user.displayName})
            // context登録
            // setConName(result.user.displayName)
        }).cahtch((error) => {
            Error(error);
        })
    } catch (error) {
        console.log(error);
    }
}
// SignIn
export const signIn = () => {
    try{
        signInWithPopup(auth, provider);
    } catch (error) {
        console.log(error);
    }
}
// SignOut
export const mySignOut = () => {
    try{
        signOut(auth);
    } catch (error) {
        console.log(error);
    }
}

// ログインしているかどうか判定する関数
export const isLogin = () => {
    const result = auth.currentUser;
    // console.log("login state: ", result);
    return result;
}

// database
export const db = getFirestore(app);





