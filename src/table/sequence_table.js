import { collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, doc } from 'firebase/firestore';
import { db } from '../firebase';


export const get_sequence = async (document_id) => {
    // sequenceテーブルから現在の値を取得(history_id)

    if (document_id === "STATIC") {
        console.log("debug sequence func start")
        const CollectionRef = doc(db, 'sequence', 'STATIC');  // sequenceテーブル
        const sequence = await getDoc(CollectionRef)

        console.log("sequence doc: ", sequence.data())
        return sequence.data();
    } else if (document_id === "OTHELLO") {
        const CollectionRef = doc(db, 'sequence', 'OTHELLO');  // sequenceテーブル
        const sequence = await getDoc(CollectionRef)
        return sequence.data();
    }

}