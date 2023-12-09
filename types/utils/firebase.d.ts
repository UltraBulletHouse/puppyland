import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/firestore';

export declare const auth: firebase.auth.Auth;
export declare const firestore: firebase.firestore.Firestore;
export type UserFirebase = firebase.User | null;
