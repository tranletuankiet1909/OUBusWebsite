import { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, Typography, Link, Alert } from "@mui/material";
import Contexts from '../configs/Contexts';
import TextInput from '../components/TextInput';
import axios from 'axios';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [userState, dispatch] = useContext(Contexts);

    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress /> 
            </Box>
        );
    }

    const login = async () => {
        if (username === '' || password === '') {
            setError('Tên đăng nhập và mật khẩu không được bỏ trống');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('client_id', 'CsLcJjgEtG7TE8uGxYEJEiIB0Bp1Ct57X6qF4oye');
            formData.append('client_secret', 'cfk5v60Jk7m59o91DCTkxTUrzJaB2OB8cktQicgcQSapQe71WO2tB8xV9oAOY3iqinSJRiFqFD2E9VVw4qDVmY9duOmBFGVZJP7dZYA2PTWvOGoaJ5TD6aXfgb0WdgOI')
            formData.append('grant_type', 'password');

            let res = await axios.post(`/o/token/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            localStorage.setItem('access-token', res.data.access_token);
            setTimeout(async () => {
                let userRes = await axios.get(`/users/user-profile/`, {
                    headers: { Authorization: `Bearer ${res.data.access_token}`}       
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
                setSuccess('Đăng nhập thành công');
                setTimeout(() => {
                    navigate('/');
                }, 2000)
            }, 100)
        } catch (ex) {
            console.log(ex);
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={10} textAlign="center">
                <Typography variant="h4" color="#02053a" fontWeight="bold">
                    OU BUS 
                </Typography>
                <Typography variant="h5" color="#02053a" fontWeight="bold" mt={2}>
                    ĐĂNG NHẬP 
                </Typography>
            </Box>

            <Box mt={4}>
                <TextInput
                    label="Tên đăng nhập..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextInput
                    label="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                />
                {error && (
                    <Typography color="error" mt={2}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Alert severity="success" mt={2}>
                        {success}
                    </Alert>
                )}

                <Typography color="primary" fontWeight="500" mt={2}>
                    Quên mật khẩu?
                </Typography>
            </Box>

            <Box mt={4} textAlign="center">
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" onClick={login}>
                        Đăng nhập
                    </Button>
                )}
            </Box>

            <Box mt={2} textAlign="center">
                <Link href="/register/" variant="body2">
                    Chưa có tài khoản? Đăng ký tại đây
                </Link>
            </Box>
            
        </Container>
    );
};

export default Login;