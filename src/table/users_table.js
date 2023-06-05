import { setDoc, doc, writeBatch, collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, runTransaction } from 'firebase/firestore';
import { get_sequence } from './sequence_table';
import { db } from '../firebase';


export const create_users = async (data) => {
    // userテーブルにレコードを追加
    //collectionでレコードを追加
    console.log("a")
    const userRef = doc(db, 'users', data.user_id.toString());  // userテーブル
    console.log("b")
    getDoc(userRef).then((docSnapshot) => {
        console.log("c")
        if (docSnapshot.exists()) {
            console.log("uesr already exists")
        } else {
            setDoc(userRef, {
                user_id: data.user_id,
                name: data.name,
                update_time: Timestamp.now()
            })
            console.log("user created")
        }
        console.log("d")
    }).catch((error) => {
        console.log("e")
        Error(error);
    })
}

export const get_users_name = async (user_id_list) => {
    // Returns: {user_id: user_name, ...}
    let result = {};
    
    // 配列をループする
    user_id_list.forEach((user_id) => {
        console.log("start")
        const usersRef = doc(db, 'users', user_id);
        console.log("get user name: ", user_id)
        getDoc(usersRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                console.log("docSnapshot: ", docSnapshot.data())
                result[user_id] = docSnapshot.data()["name"];
            } else {
                console.log("docSnapshot: ", docSnapshot.data())
                result[user_id] = "ERROR_USER_NAME";
            }
        }).catch((error) => {
            console.log("error: ", error);
        })
    })

    return result;
}