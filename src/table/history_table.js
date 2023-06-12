import { orderBy, limit, doc, writeBatch, collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, runTransaction } from 'firebase/firestore';
import { get_sequence } from './sequence_table';
import { db } from '../firebase';
import { get_user_id_name, test, get_user_id_names } from './users_table';
import { useAuthContext } from '../contexts/AuthContext';



export const create_history = async (data) => {
    // console.log("debug create_history func start")

    // 1. sequenceテーブルから現在の値を取得(history_id)
    // 2.1 hisotryテーブルにレコードを追加
    // 2.2 sequenceテーブルの値を+1する
    // 3. batch処理を実行

    const sequenceRef = doc(db, 'sequence', 'STATIC');  // sequenceテーブル
    const batch = writeBatch(db);
    // console.log("after initial db")

    // 1. sequenceテーブルから現在の値を取得(history_id)
    const sequence = await getDoc(sequenceRef)
    const history_id = sequence.data()["history_id"];

    const historyRef = doc(db, 'history', history_id.toString());  // hisotryテーブル

    // console.log("after get sequence")
    // console.log("history_id: ", history_id)
    // console.log("type: ", data.type)
    // console.log("time: ", data.time)
    // console.log("user_id: ", data.user_id)
    // console.log("q_num: ", data.q_num)
    // console.log("q_correct_num: ", data.q_correct_num)
    // console.log("q_poc: ", data.q_poc)
    // console.log("is_debug: ", data.is_debug)
    // console.log("update_time", Timestamp.now())

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
    // console.log("after set historyRef")

    // 2.2 sequenceテーブルの値を+1する
    batch.update(sequenceRef, { "history_id": history_id + 1 });

    // console.log("after update sequenceRef")

    // 3. batch処理を実行
    await batch.commit();

}

export const get_history = async (q_type, question_type, user_id) => {
    // console.log("debug get_history func start")
    // console.log("q_type: ", q_type)

    // ------------------------------------------------------------------------------
    // --- q_typeの種類 ---
    // all_user_record: 全ユーザーの記録を取得
    // ---の時: ---


    // 処理の流れ
    // 1. historyテーブルからデータを取得
    // 2. usersテーブルからデータを取得
    // 3. 1,2のデータをuser_idをもとに結合して整形

    // ------------------------------------------------------------------------------


    // 1. historyテーブルからデータを取得
    const historyRef = collection(db, 'history');  // historyテーブル
    // all_user_recordの場合
    let q = "";
    if (q_type === "all_record") {
        q = query(historyRef, 
            where("type", "==", question_type), // typeがquestion_typeのものを絞り込む
            where("q_poc", "==", "100"), // q_pocが100のものを絞り込む
            where("is_debug", "==", false), // is_debugがfalseのものを絞り込む
            orderBy("time"), // timeの小さい順に並び替える
            limit(5) // 最大5件まで取得する
        );
    } else if (q_type === "all") {
        q = query(historyRef, 
            where("type", "==", question_type), // typeがquestion_typeのものを絞り込む
            where("is_debug", "==", false), // is_debugがfalseのものを絞り込む
            orderBy("update_time", "desc"), // update_timeの大きい順に並び替える
            limit(5) // 最大5件まで取得する
        );
    } else if (q_type === "your_record") {
        q = query(historyRef, 
            where("type", "==", question_type), // typeがquestion_typeのものを絞り込む
            where("user_id", "==", user_id), // user_idがuser.uidのものを絞り込む
            where("q_poc", "==", "100"), // q_pocが100のものを絞り込む
            where("is_debug", "==", false), // is_debugがfalseのものを絞り込む
            orderBy("time"), // timeの小さい順に並び替える
            limit(5) // 最大5件まで取得する
        );
    }

    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map(doc => doc.data());
    // console.log("result: ", result)

    // --- dataの整形 ---
    result.forEach((data) => {
        // 1. timeを少数第1位までにする(ex: 2122 -> 2.1秒)
        data.time = (data.time / 1000).toFixed(1) + "秒";
        // 2. update_timeを(ex)06/12 12:51の表記に変換する
        const date = new Date(data.update_time.seconds * 1000);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        data.update_time = `${month}/${day} ${hour}:${minute}`;
    })

    
    // 2. usersテーブルからデータを取得
    // nameからuser_idを取得
    // data.user_idが"NO_LOGIN_USER"でない要素だけを抽出する
    const filteredResult = result.filter((data) => data.user_id !== "NO_LOGIN_USER");
    // filteredResultの各要素からuser_idを取り出して新しい配列にする
    const user_id_list = filteredResult.map((data) => data.user_id);
    // console.log("user_id_list: ", user_id_list)

    const user_id_name_list = await get_user_id_names(user_id_list)
    // console.log("user_id_name_list: ", user_id_name_list)

    // 3. 1,2のデータをuser_idをもとに結合して整形
    const get_history_result = []
    result.forEach((data, index) => {
        // get_hisotry_listにオブジェクトを追加する
        const name = data.user_id === "NO_LOGIN_USER" ? "NO_LOGIN_USER" : user_id_name_list[data.user_id];
        const new_obj = {
            user_id: data.user_id,
            rank: `${index + 1}`,
            name: name,
            time: `${data.time}`,
            poc: `${data.q_poc}%`,
            update_time: `${data.update_time}`
        }

        get_history_result.push(new_obj)
    })

    // console.log("get_history_result: ", get_history_result)

    return get_history_result
    
}

