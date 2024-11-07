import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Select, MenuItem, FormControl, Modal, FormControlLabel, RadioGroup, Radio, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TicketsList = () => {
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState('all');
    const [open, setOpen] = useState(false); 
    const [openPayment, setOpenPayment] = useState(false);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, [filter, startDate, endDate]);


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);


    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/users/tickets/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const ticketsWithInvoiceStatus = await Promise.all(response.data.map(async (ticket) => {
                try {
                    const invoiceResponse = await axios.get(`/tickets/${ticket.id}/invoice/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    return { ...ticket, invoiceExists: true }; 
                } catch (error) {
                    return { ...ticket, invoiceExists: false }; 
                }
            }));

            setTickets(ticketsWithInvoiceStatus);
        } catch (error) {
            console.error('Lỗi khi lấy vé:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/paymethods/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const filteredMethods = response.data.filter(method => method.name !== 'Combo');
            setPaymentMethods(filteredMethods);
        } catch (error) {
            console.error('Lỗi khi lấy phương thức thanh toán:', error);
        }
    };

    const handlePayment = async () => {
        if (!selectedTicketId || !paymentMethod) {
            return alert('Vui lòng chọn phương thức thanh toán.');
        }
        try {
            const token = localStorage.getItem('access-token');
            const formData = new FormData();
            formData.append('payment_method', paymentMethod);         
            const selectedMethod = paymentMethods.find((method) => method.id === Number(paymentMethod)); 
            if (selectedMethod.pay_code === 'VNPAY') {
                navigate(`/tickets/${selectedTicketId}/create-payment/`)
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
        }
    };

    const showTicketDetail = async (ticketId) => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get(`/tickets/${ticketId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setTicketDetail(response.data);
            setOpen(true);
        } catch (error) {
            console.error('Lỗi hiển thị:', error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress /> 
            </Box>
        );
    }

    const openPaymentModal = (ticketId) => {
        setSelectedTicketId(ticketId); 
        setOpenPayment(true);
        fetchPaymentMethods(); 
    };

    const handleClose = () => setOpen(false); 
    const handleClosePayment = () => setOpenPayment(false);

    const handleRating = (ticketId, tripStatus) => {

        if (tripStatus !== 'finish') {
            return alert('Bạn chỉ có thể đánh giá chuyến đi khi nó đã hoàn thành.');
        }
        
        navigate(`/tickets/${ticketId}/review/`);
    };
    const filteredTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.seat_bustrip.trip.start_time).toLocaleDateString();
        const start = startDate ? new Date(startDate).toLocaleTimeString() : null; 
        const end = endDate ? new Date(endDate).toLocaleDateString() : null;

        const isWithinDateRange = (!start || ticketDate >= start) && 
                                (!end || ticketDate <= end);
        console.info(startDate)

        if (filter === 'unpaid') return !ticket.invoiceExists && isWithinDateRange;
        if (filter === 'paid') return ticket.invoiceExists && isWithinDateRange; 
        return isWithinDateRange; 
    });

    return (
        <Box style={{ margin: 10, marginTop: 20 }}>
            <Box style={{ display: 'flex', marginRight:40}} justifyContent='space-between'>
                <div style={{ width: '100%', marginRight:5}}>
                    <Typography fontWeight={'bold'}> Trạng thái vé </Typography>
                    <FormControl fullWidth margin="normal" style={{ width: '100%'}}>
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                            <MenuItem value="paid">Đã thanh toán</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                
                <div style={{ width: '100%', marginRight:5}}>
                    <Typography fontWeight={'bold'}>Ngày bắt đầu</Typography>
                    <FormControl fullWidth margin="normal" style={{ width: '100%' }}>
                        <TextField
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </FormControl>
                </div>
                
                <div style={{ width: '100%', marginRight:5 }}>
                    <Typography fontWeight={'bold'}>Ngày kết thúc</Typography>
                    <FormControl fullWidth margin="normal" style={{ width: '100%' }}>
                    <TextField
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </FormControl>
                </div>     
            </Box>


            <Box display="flex" flexWrap="wrap" gap={2}>
                {filteredTickets.map((ticket) => (
                    <Box key={ticket.id} flexBasis="calc(33% - 16px)" mb={2}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Chuyến đi: {ticket.seat_bustrip.trip.route.route_code}
                                </Typography>
                                <Typography variant="body2" color="textSecondary"> 
                                    Trạng thái: {ticket.invoiceExists ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Typography>
                                <Typography variant="body2"> 
                                    Ngày đi: {new Date(ticket.seat_bustrip.trip.start_time).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2"> 
                                    Giờ đi: {new Date(ticket.seat_bustrip.trip.start_time).toLocaleTimeString()}
                                </Typography>
                                <Typography variant="body2"> 
                                    Giá vé: {ticket.price.toLocaleString()} VNĐ
                                </Typography>
                                <Typography variant="body2"> 
                                    Ghế: {ticket.seat_bustrip.seat.code}
                                </Typography>

                                <Box mt={2}>
                                    <Button variant="contained" onClick={() => showTicketDetail(ticket.id)} style={{ marginRight: 5, color: '#02053a', backgroundColor: 'white'}}>
                                            Chi tiết vé
                                    </Button>
                                    {!ticket.invoiceExists && 
                                        <Button variant="contained" color="primary" onClick={() => openPaymentModal(ticket.id)}>
                                            Thanh toán
                                        </Button>
                                    }
                                    {ticket.seat_bustrip.trip.trip_status === 'finish' && ticket.invoiceExists &&
                                        <Button variant="outlined" color="secondary" onClick={() => handleRating(ticket.id, ticket.seat_bustrip.trip.trip_status)}>
                                            Đánh giá vé
                                        </Button>
                                    }       

                                    
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {/* Modal Chi tiết vé */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '1px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    {ticketDetail ? (
                        <>
                            <Typography variant="h5" textAlign='center'>Chi tiết vé</Typography>
                            <Typography variant="body1">Họ tên SV: {ticketDetail.student.fullname}</Typography>
                            <Typography variant="body1">Mã số SV: {ticketDetail.student.student_code}</Typography>
                            <Typography variant="body1">Nhân viên lập vé: {ticketDetail.staff.fullname}</Typography>
                            <Typography variant="body1">Ngày đi: {new Date(ticketDetail.seat_bustrip.trip.start_time).toLocaleDateString()}</Typography>
                            <Typography variant="body1">Giờ đi: {new Date(ticketDetail.seat_bustrip.trip.start_time).toLocaleTimeString()}</Typography>
                            <Typography variant="body1">Ghế: {ticketDetail.seat_bustrip.seat.code}</Typography>
                            <Typography variant="body1">Biển số xe: {ticketDetail.seat_bustrip.seat.bus.license_plate}</Typography>
                            <Typography variant="body1">Bãi xe đi: {ticketDetail.seat_bustrip.trip.route.starting_point.name}</Typography>
                            <Typography variant="body1">Giá vé: {ticketDetail.price.toLocaleString()} VNĐ</Typography>
                            <Box mt={2}>
                                <Button variant="contained" color="primary" onClick={handleClose}>OK</Button>
                            </Box>
                        </>
                    ) : (
                        <Typography>Đang tải thông tin...</Typography>
                    )}
                </Box>
            </Modal>

            {/* Modal Thanh toán */}
            <Modal open={openPayment} onClose={handleClosePayment}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6">Chọn phương thức thanh toán</Typography>
                    {paymentMethods.length > 0 ? (
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                {paymentMethods.map((method) => (
                                    <FormControlLabel
                                        key={method.id}
                                        value={method.id}
                                        control={<Radio />}
                                        label={method.name}
                                    />
                                ))}
                            </RadioGroup>
                            <Box mt={2}>
                                <Button variant="contained" color="primary" onClick={handlePayment}>
                                    Thanh toán
                                </Button>
                                <Button variant="contained" onClick={handleClosePayment} style={{ marginLeft: 10 }}>
                                    Hủy
                                </Button>
                            </Box>
                        </FormControl>
                    ) : (
                        <Typography>Đang tải phương thức thanh toán...</Typography>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default TicketsList;
