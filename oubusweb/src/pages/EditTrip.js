import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Box, Typography, Container, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'; 
import { vi } from 'date-fns/locale'; 

const EditTrip = () => {
    const { id } = useParams(); // Lấy ID chuyến xe từ URL
    const [tripData, setTripData] = useState(null);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [routeSelect, setRouteSelect] = useState('');
    const [busSelect, setBusSelect] = useState('');
    const [driverSelect, setDriverSelect] = useState('');
    const [statusSelect, setStatusSelect] = useState('');
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const navigate = useNavigate();

    const statusOptions = [
        { value: 'ready', label: 'Chưa khởi hành' },
        { value: 'ongoing', label: 'Đang di chuyển' },
        { value: 'finish', label: 'Hoàn thành' }
    ];

    useEffect(() => {
        fetchDrivers();
        fetchRoutes();
        fetchBuses();
    }, []);

    useEffect(() => {
        const loadTripData = async () => {
            try {
                const response = await axios.get(`/bustrips/${id}/`);
                const trip = response.data;
                setTripData(trip);
                setStartTime(new Date(trip.start_time));
                setEndTime(new Date(trip.end_time));
                setRouteSelect(trip.route.id);
                setBusSelect(trip.bus.id);
                setDriverSelect(trip.driver.id);
                setStatusSelect(trip.trip_status);
            } catch (error) {
                console.error(error);
                setError('Không thể tải dữ liệu chuyến xe. Vui lòng thử lại sau.');
            }
        };

        // Lấy dữ liệu routes, buses, drivers
        const loadRoutesBusesDrivers = async () => {
            try {
                const [routesRes, busesRes, driversRes] = await Promise.all([
                    axios.get('/routes/'),
                    axios.get('/buses/'),
                    axios.get('/drivers/')
                ]);
                setRoutes(routesRes.data);
                setBuses(busesRes.data);
                setDrivers(driversRes.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadTripData();
        loadRoutesBusesDrivers();
    }, [id]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access-token');
            const updatedTrip = {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                route: routeSelect,
                bus: busSelect,
                driver: driverSelect,
                trip_status: statusSelect
            };

            await axios.patch(`/bustrips/${id}/`, updatedTrip, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            alert('Chuyến xe đã được cập nhật thành công!');
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi cập nhật chuyến xe!');
        }
    };

    if (!tripData) return <div>Đang tải dữ liệu...</div>;

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" align="center" fontWeight={'bold'} gutterBottom mt={4}>
                Chỉnh sửa Chuyến Xe
            </Typography>

            <Box mt={4}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DateTimePicker
                            label="Thời gian đi"
                            value={startTime}
                            onChange={(newValue) => setStartTime(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DateTimePicker
                            label="Thời gian kết thúc"
                            value={endTime}
                            onChange={(newValue) => setEndTime(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="route-select-label">Tuyến xe</InputLabel>
                        <Select
                            value={routeSelect}
                            onChange={(e) => setRouteSelect(e.target.value)}
                            labelId="route-select-label"
                            label='Tuyến xe'
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

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="driver-select-label">Tài xế</InputLabel>
                        <Select
                            value={driverSelect}
                            onChange={(e) => setDriverSelect(e.target.value)}
                            labelId="driver-select-label"
                            label='Tài xế'
                        >
                            {drivers.length > 0 && drivers.map((d) => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="driver-select-label">Trạng thái</InputLabel>
                        <Select
                            value={statusSelect}
                            onChange={(e) => setStatusSelect(e.target.value)}
                            labelId="driver-select-label"
                            label='Trạng thái'
                        >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box mt={2} display="flex" flexDirection="column" gap={2}>
                    <Button style={{ backgroundColor: 'green' }} variant="contained" fullWidth onClick={handleSubmit}>
                        Xác nhận
                    </Button>
                    <Button style={{ backgroundColor: 'red' }} variant="contained" fullWidth onClick={() => navigate('/')}>
                        Hủy
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default EditTrip;
