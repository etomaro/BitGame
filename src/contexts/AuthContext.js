import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { get_user_id_name } from '../table/users_table';

const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState('');

  const value = {
    user
  };

  useEffect(() => {
    const unsubscribed = auth.onAuthStateChanged((user) => {
      // user情報が変更したらuser情報をcontextに設定
      setUser(user);
    });
    return () => {
      unsubscribed();
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}