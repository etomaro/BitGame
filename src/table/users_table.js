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
                create_time: Timestamp.now(),
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

export const get_user_id_name = async (user_id) => {
    // Returns: {user_id: user_name}

    const userRef = doc(db, 'users', user_id.toString());  // userテーブル
    const docSnapshot = await getDoc(userRef);
    // console.log("docSnapshot: ", docSnapshot.data())
    if (docSnapshot.exists()) {
        return {[user_id]: docSnapshot.data()["name"]};
    } else {
        return {[user_id]: "ERROR_USER_NAME"};
    }
}
export const test = async () => {
    return "test"
}

    

export const get_user_id_names = async (user_id_list) => {
    // Returns: {user_id1: user_name1, user_id2: user_name2, ...}
    
    // 各user_idに対してuser_nameを同時に(順番ではなく)取得する
    const promises = user_id_list.map((user_id) => {
        return get_user_id_name(user_id)
    })

    // すべてのリソースが取得できるまで待つ
    const responses = await Promise.all(promises)

    // console.log("[responses] get_user_id_names fnc: ", responses)

    let result = {}
    responses.forEach((response) => {
        result = {...result, ...response}
    })

    return result
}