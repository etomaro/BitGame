import { orderBy, limit, doc, writeBatch, collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue, runTransaction } from 'firebase/firestore';
import { get_sequence } from './sequence_table';
import { db } from '../firebase';
import { get_user_id_name, test, get_user_id_names } from './users_table';
import { useAuthContext } from '../contexts/AuthContext';