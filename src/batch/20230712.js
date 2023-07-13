/*
   「history_qテーブルのquestion_idを10進数で保存 -> 出題された問題で保存」
   の、変更によりquestion_idを10進数から2進数に変換する
 */

import { orderBy, limit, doc, writeBatch, collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, runTransaction } from 'firebase/firestore';
import '../../table/sequence_table'
// import 'test'


// const historyQRef = collection(db, 'history_q');  // historyテーブル