import React, { useEffect, useState, useContext } from 'react';
import { db } from '../configs/firebaseConfig';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { TextField, Button, Paper, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import Contexts from '../configs/Contexts';

const ChatContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    maxHeight: '70vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
}));

const MessageContainer = styled(Box)(({ theme, fromStudent }) => ({
    display: 'flex',
    justifyContent: fromStudent ? 'flex-end' : 'flex-start',
    marginBottom: theme.spacing(1),
}));

const MessageBubble = styled(Paper)(({ theme, fromStudent }) => ({
    padding: theme.spacing(1.5),
    backgroundColor: fromStudent ? theme.palette.primary.light : theme.palette.secondary.light,
    color: fromStudent ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
    borderRadius: '15px',
    maxWidth: '60%',
}));

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userState] = useContext(Contexts); 

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));            
            setMessages(messagesData);
            console.info(messagesData);
        });
        return () => unsubscribe();
    }, []);

    // Gửi tin nhắn
    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: newMessage,
                    role: userState.user.user.role, 
                    createdAt: new Date().toISOString(),
                });
                setNewMessage(''); 
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };
    return (
        <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: 2 }}>
            <Typography variant="h5" align="center" gutterBottom>Chat giữa sinh viên và nhân viên</Typography>
            <ChatContainer>
                {messages.map((msg) => (
                    <MessageContainer key={msg.id} fromStudent={msg.role === 'student'}>
                        <Avatar sx={{ marginRight: 1, backgroundColor: msg.role === 'student' ? 'primary.main' : 'secondary.main' }}>
                            {msg.role === 'student' ? 'SV' : 'NV'}
                        </Avatar>
                        <MessageBubble fromStudent={msg.role === 'student'}>
                            <Typography variant="body1">{msg.text}</Typography>
                        </MessageBubble>
                    </MessageContainer>
                ))}
            </ChatContainer>
            <form onSubmit={sendMessage}>
                <Box display="flex" mt={2}>
                    <TextField
                        fullWidth
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        variant="outlined"
                    />
                    <Button type="submit" variant="contained" color="primary" sx={{ marginLeft: 1 }}>
                        Gửi
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default Chat;
