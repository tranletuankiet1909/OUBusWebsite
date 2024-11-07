import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, FormControl, RadioGroup, FormControlLabel, Radio, DialogActions } from '@mui/material';
import { format } from 'date-fns';

const ComboList = () => {
    const [combos, setCombos] = useState([]);
    const [payMethods, setPayMethods] = useState([]);
    const [selectedComboId, setSelectedComboId] = useState(null);
    const [selectedPayMethod, setSelectedPayMethod] = useState('');
    const [open, setOpen] = useState(false);
    const [studentCombo, setStudentCombo] = useState(null);

    useEffect(() => {
        fetchCombos();
        fetchPayMethods();
        fetchStudentCombo();
    }, []);


    const fetchStudentCombo = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/users/combo/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            response.data && setStudentCombo(response.data);
        } catch (error) {
            console.error('Error fetching student combo:', error);
        }
    };

    const fetchCombos = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/comboes/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setCombos(response.data);
        } catch (error) {
            console.error('Error fetching combos:', error);
        }
    };

    // Lấy danh sách phương thức thanh toán
    const fetchPayMethods = async () => {
        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.get('/paymethods/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const filteredMethods = response.data.filter(method => method.name !== 'Combo');
            setPayMethods(filteredMethods);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const handleRegisterCombo = (comboId) => {
        setSelectedComboId(comboId);
        setOpen(true);
    };

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('access-token');
            await axios.post(`/comboes/${selectedComboId}/register-combo/`, {
                payment_method: selectedPayMethod,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setOpen(false);
            alert('Đăng ký combo thành công!');
            fetchStudentCombo();
        } catch (error) {
            console.error('Error registering combo:', error);
            alert('Đăng ký combo thất bại!');
        }
    };

    return (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={4}>
            {studentCombo ? (
                <Box
                    sx={{
                        width: 300,
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Combo đã đăng ký
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {console.info(studentCombo)}
                        {studentCombo.combo.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Số vé còn lại: {studentCombo.remaining_ticket}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Giá: {studentCombo.combo.price} VND
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Ngày hết hạn: {format(new Date(studentCombo.expiration_date), 'dd/MM/yyyy')}
                    </Typography>
                </Box>
            ) : (
                // Nếu chưa đăng ký combo, hiển thị danh sách combo để đăng ký
                combos.map((combo) => (
                    <Box
                        key={combo.id}
                        sx={{
                            width: 300,
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            {combo.name}
                        </Typography>
                        <Typography dangerouslySetInnerHTML={{ __html: combo.description }} />
                        <Typography variant="body2" color="textSecondary">
                            Số vé: {combo.number_of_tickets}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Giá: {combo.price} VND
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Thời hạn: {combo.duration} ngày
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleRegisterCombo(combo.id)}
                            sx={{ mt: 2 }}
                        >
                            Đăng ký combo
                        </Button>
                    </Box>
                ))
            )}

            {/* Dialog chọn phương thức thanh toán */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selectedPayMethod}
                            onChange={(e) => setSelectedPayMethod(e.target.value)}
                        >
                            {payMethods.map((method) => (
                                <FormControlLabel
                                    key={method.id}
                                    value={method.id}
                                    control={<Radio />}
                                    label={method.name}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="secondary">Hủy</Button>
                    <Button onClick={handlePayment} color="primary" disabled={!selectedPayMethod}>Xác nhận</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ComboList;
