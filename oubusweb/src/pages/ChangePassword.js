import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />  {/* Component loading */}
            </Box>
        );
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp!');
            return;
        }

        const formData = new FormData();
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);

        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.patch('/users/change-password/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                setSuccess('Thay đổi mật khẩu thành công!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            setError('Đã xảy ra lỗi trong quá trình thay đổi mật khẩu.');
        }
    };

    return (
        <Box mt={5} display="flex" flexDirection="column" alignItems="center" width="100%">
            <Typography variant="h4" mb={4}>Đổi Mật Khẩu</Typography>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Mật khẩu hiện tại"
                    type="password"
                    variant="outlined"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Mật khẩu mới"
                    type="password"
                    variant="outlined"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <Typography color="error">{error}</Typography>}
                {success && <Typography color="primary">{success}</Typography>}

                <Button variant="contained" color="primary" type="submit" style={{ marginTop: 20 }}>
                    Thay Đổi Mật Khẩu
                </Button>
            </form>
        </Box>
    );
};

export default ChangePassword;
