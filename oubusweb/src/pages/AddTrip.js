import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, CircularProgress, Typography, Container, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale'; // Ngôn ngữ tiếng Việt
import { useNavigate } from 'react-router-dom';

const AddTrip = () => {
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [routeSelect, setRouteSelect] = useState('');
    const [busSelect, setBusSelect] = useState('');
    const [driverSelect, setDriverSelect] = useState('');
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchDrivers();
        fetchRoutes();
        fetchBuses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('access-token');
            console.info(token);
            const response = await axios.get('/drivers/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            setDrivers(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị tài xế:', error);
            alert(error);
        }
    };
    const fetchRoutes = async () => {
        try {
            const token = localStorage.getItem('access-token');
            console.info(token);
            const response = await axios.get('/routes/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            setRoutes(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị tuyến xe:', error);
            alert(error);
        }
    };
    const fetchBuses = async () => {
        try {
            const token = localStorage.getItem('access-token');
            console.info(token);
            const response = await axios.get('/buses/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            setBuses(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị xe:', error);
            alert(error);
        }
    };

    const handleAddTrip = async () => {
        if (!startTime || !endTime || !routeSelect || !busSelect || !driverSelect) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        const startTimeISO = startTime.toISOString().slice(0, 19);
        const endTimeISO = endTime.toISOString().slice(0, 19);

        const formData = new FormData();
        formData.append('start_time', startTimeISO);
        formData.append('end_time', endTimeISO);
        formData.append('route', routeSelect);
        formData.append('bus', busSelect);
        formData.append('driver', driverSelect);

        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.post('/bustrips/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            console.log(response.data);
            alert('Chuyến xe đã được thêm thành công!');
            navigate('/');
        } catch (error) {
            console.error('Lỗi khi thêm chuyến xe:', error);
            alert('Có lỗi xảy ra khi thêm chuyến xe!');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />  {/* Component loading */}
            </Box>
        );
    }
    return (
    <Container maxWidth="sm">
        <Typography variant="h4" align="center" fontWeight={'bold'} gutterBottom mt={4}>
            Thêm Chuyến Xe
        </Typography>

        <Box mt={4}>
            <Box display="flex" flexDirection="column" gap={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <DateTimePicker
                        label="Thời gian đi"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </LocalizationProvider>           

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <DateTimePicker
                        label="Thời gian kết thúc"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </LocalizationProvider>           

                <FormControl fullWidth margin="normal">
                <InputLabel id="driver-select-label">Tài xế</InputLabel>
                    <Select
                        value={driverSelect}
                        onChange={(e) => setDriverSelect(e.target.value)}
                        labelId="driver-select-label"
                        label='Tài xế'
                    >
                        {drivers.length > 0 && drivers.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="route-select-label">Tuyến xe</InputLabel>
                    <Select
                        value={routeSelect}
                        onChange={(e) => setRouteSelect(e.target.value)}
                        labelId="route-select-label"
                        label='Tuyến xe'
                    >
                        {routes.length > 0 && routes.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{r.route_code}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="bus-select-label">Xe Bus</InputLabel>
                    <Select
                        value={busSelect}
                        onChange={(e) => setBusSelect(e.target.value)}
                        labelId="bus-select-label"
                        label='Xe Bus'
                    >
                        {buses.length > 0 && buses.map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.station.name} / {b.license_plate}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box mt={2} display="flex" flexDirection="column" gap={2}>
                <Button style={{ backgroundColor: 'green' }} variant="contained" fullWidth onClick={handleAddTrip}>
                    Xác nhận
                </Button>
                <Button style={{ backgroundColor: 'red' }} variant="contained" fullWidth onClick={() => navigate('/')}>
                    Hủy
                </Button>
            </Box>
        </Box>
    </Container>
    );
};

export default AddTrip;
