import { doc, writeBatch, collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, runTransaction } from 'firebase/firestore';
import { get_sequence } from './sequence_table';
import { db } from '../firebase';


export const create_history = async (data) => {
    console.log("debug create_history func start")

    // 1. sequenceテーブルから現在の値を取得(history_id)
    // 2.1 hisotryテーブルにレコードを追加
    // 2.2 sequenceテーブルの値を+1する
    // 3. batch処理を実行

    const sequenceRef = doc(db, 'sequence', 'STATIC');  // sequenceテーブル
    const batch = writeBatch(db);
    console.log("after initial db")

    // 1. sequenceテーブルから現在の値を取得(history_id)
    const sequence = await getDoc(sequenceRef)
    const history_id = sequence.data()["history_id"];

    const historyRef = doc(db, 'history', history_id.toString());  // hisotryテーブル

    console.log("after get sequence")
    console.log("history_id: ", history_id)
    console.log("type: ", data.type)
    console.log("time: ", data.time)
    console.log("user_id: ", data.user_id)
    console.log("q_num: ", data.q_num)
    console.log("q_correct_num: ", data.q_correct_num)
    console.log("q_poc: ", data.q_poc)
    console.log("is_debug: ", data.is_debug)
    console.log("update_time", Timestamp.now())

    // 2.1 hisotryテーブルにレコードを追加
    batch.set(historyRef, {
        history_id: history_id,
        type: data.type,
        time: data.time,
        user_id: data.user_id,
        q_num: data.q_num,
        q_correct_num: data.q_correct_num,
        q_poc: data.q_poc,
        is_debug: data.is_debug,
        update_time: Timestamp.now()
    })
    console.log("after set historyRef")

    // 2.2 sequenceテーブルの値を+1する
    batch.update(sequenceRef, { "history_id": history_id + 1 });

    console.log("after update sequenceRef")

    // 3. batch処理を実行
    await batch.commit();

}
