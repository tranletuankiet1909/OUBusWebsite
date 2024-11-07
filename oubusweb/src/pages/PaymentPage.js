// src/components/PaymentPage.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Contexts from '../configs/Contexts';

const PaymentPage = () => {
    const { id } = useParams(); // Lấy orderId từ URL
    const [paymentUrl, setPaymentUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userState] = useContext(Contexts);
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token')

    useEffect(() => {
        const createPayment = async () => {
        try {
            const response = await axios.post(`/tickets/${id}/create-payment/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            if (response.data.payment_url) {
            setPaymentUrl(response.data.payment_url);
            // Tự động chuyển hướng đến VNPay
            window.location.href = response.data.payment_url;
            } else {
            setError('Không thể tạo URL thanh toán.');
            }
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi tạo thanh toán.');
        } finally {
            setLoading(false);
        }
        };

        createPayment();
    }, [id]);

    if (loading) {
        return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
        );
    }

    if (error) {
        return (
        <Box textAlign="center" mt={5}>
            <Typography variant="h6" color="error">
            {error}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Quay lại
            </Button>
        </Box>
        );
    }

  return null;
};

export default PaymentPage;
