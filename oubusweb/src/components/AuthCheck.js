import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCheck = ({ children, dispatch }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkLoginStatus = async () => {
        try {
            const token = localStorage.getItem('access-token');
            if (!token) {
                dispatch({ type: 'logout' }); // Đảm bảo rằng `userState.user` được đặt về null
                navigate('/login/'); // Chuyển hướng đến trang đăng nhập nếu không có token
                return;
            }
            console.info(token);
            if (token) {
            let userRes = await axios.get(`/users/user-profile/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            let userData = userRes.data;
            userData = {
                ...userData,  
                ...userData.user  
            };
            dispatch({ 
                type: 'login', 
                payload: userData, 
            });
            } 
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái đăng nhập", error);
            localStorage.removeItem('access-token');
            navigate('/login/'); 
        }
    };

    checkLoginStatus(); 
    }, [dispatch, navigate]);

    return children;  
};

export default AuthCheck;
