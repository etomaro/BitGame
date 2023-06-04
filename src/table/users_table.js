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