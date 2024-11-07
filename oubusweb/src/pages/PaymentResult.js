// src/components/PaymentResult.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';

const PaymentResult = () => {
    const location = useLocation();
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
        try {
            const response = await axios.get(`/payment-return${location.search}`);
            if (response.data.status === 'success') {
            setStatus('success');
            setMessage(response.data.message);
            } else {
            setStatus('error');
            setMessage(response.data.message);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Có lỗi xảy ra khi xác thực thanh toán.');
        }
        };

        verifyPayment();
    }, [location.search]);

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <Box textAlign="center" mt={10}>
        {status === 'success' ? (
            <>
            <Typography variant="h4" color="green" gutterBottom>
                {message}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleBackToHome}>
                Về trang chủ
            </Button>
            </>
        ) : (
            <>
            <Typography variant="h4" color="red" gutterBottom>
                {message}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleBackToHome}>
                Về trang chủ
            </Button>
            </>
        )}
        </Box>
    );
};

export default PaymentResult;
