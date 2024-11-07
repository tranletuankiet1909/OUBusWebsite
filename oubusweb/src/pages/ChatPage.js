import { useContext } from 'react';
import Chat from '../components/Chat';
import Contexts from '../configs/Contexts';
// import { useContext } from "react";
// import Contexts from '../configs/Contexts';
// import { ref, push } from 'firebase/database';
// import { db } from '../configs/firebaseConfig';  // Import Firebase Realtime Database

const ChatPage = () => {
    const [userState, dispatch] = useContext(Contexts)
    return (
        <div>
            <Chat user={userState.user}/>
        </div>
    );
};

export default ChatPage;
