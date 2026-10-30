import {cert, initializeApp} from "firebase-admin"
import serviceAccountKey from "../utils/serviceAccountKey.json" with {type:"json"};

export const app = initializeApp({
    credential: cert(serviceAccountKey)
});