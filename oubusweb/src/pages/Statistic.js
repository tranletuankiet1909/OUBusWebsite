import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

Chart.register(...registerables);


const Statistic = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
        fetchReviews();
    }, [startDate, endDate]);


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);


    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/tickets/get_ticket_per_route/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    start_date: startDate ? startDate.toISOString().split('T')[0] : '',
                    end_date: endDate ? endDate.toISOString().split('T')[0] : ''
                }
            });
            if (Array.isArray(response.data)) {
                setTickets(response.data);
            } else {
                console.error('Dữ liệu trả về không phải là mảng:', response.data);
                setTickets([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy vé:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/reviews/get_review_by_rating/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    start_date: startDate ? startDate.toISOString().split('T')[0] : '',
                    end_date: endDate ? endDate.toISOString().split('T')[0] : ''
                }
            });
            if (Array.isArray(response.data)) {
                setReviews(response.data);
            } else {
                console.error('Dữ liệu trả về không phải là mảng:', response.data);
                setReviews([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy vé:', error);
        }
    };


    const chartData1 = {
        labels: tickets.map(ticket => ticket.seat_bustrip__trip__route__route_code),
        datasets: [
            {
                label: 'Tickets Sold',
                data: tickets.map(ticket => ticket.total_sales),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };
    const chartData2 = {
        labels: reviews.map(review => `${review.rating} sao`), 
        datasets: [
            {
                label: 'Total Reviews',
                data: reviews.map(review => review.total_review),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            }
        ]
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box style={{ margin: 20 }}>
            <Typography variant='h4' style={{ fontWeight: 'bold', marginBottom: 10 }} textAlign={'center'}>THỐNG KÊ HỆ THỐNG</Typography>
            <Box style={{ display: 'flex'}}>
                <Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                        />
                    </LocalizationProvider>
                </Box> 
                <Box style={{ marginLeft: 10}}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi} >
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            style={{ marginLeft: 10}}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>
            
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 20, width: '100%' }}>
                <Box style={{ width: '30%', height: '30%' }}>
                    <Typography variant='h5' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        SỐ LƯỢNG VÉ MỖI TUYẾN
                    </Typography>
                    <Bar 
                        data={chartData1}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </Box>
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 20, width: '100%' }}>
                <Box style={{ width: '30%', height: '30%' }}>
                    <Typography variant='h5' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        SỐ LƯỢNG ĐÁNH GIÁ
                    </Typography>
                    <Pie 
                        data={chartData2}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(tooltipItem) {
                                            return `${tooltipItem.label}: ${tooltipItem.raw}`;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            </Box>                          
        </Box>
    );
};

export default Statistic;
