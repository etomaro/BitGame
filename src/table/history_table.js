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

    // 2.1 hisotryテーブルにレコードを追加
    batch.set(historyRef, {
        history_id: history_id,
        type: data.type,
        time: data.time,
        user_id: data.user_id,
        update_time: data.update_time
    })
    console.log("after set historyRef")

    // 2.2 sequenceテーブルの値を+1する
    batch.update(sequenceRef, { "history_id": history_id + 1 });

    console.log("after update sequenceRef")

    // 3. batch処理を実行
    await batch.commit();

}
