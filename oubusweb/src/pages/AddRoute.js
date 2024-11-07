import { Container, Typography, TextField, Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddRoute = () => {
    const [routeCode, setRouteCode] = useState('');
    const [stationStart, setStationStart] = useState('');
    const [stationEnd, setStationEnd] = useState('');
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchStations = async () => {
        try {
            const response = await axios.get(`/stations/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setStations(response.data);
        } catch (error) {
            console.error('Lỗi khi tải bến xe:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoute = async () => {
        try {
            if (stationStart === stationEnd) {
                alert('Điểm đi và điểm đến không được giống nhau!');
                return;
            }
            const newRoute = {
                route_code: routeCode,
                starting_point: stationStart,
                ending_point: stationEnd,
            };
            await axios.post(`/routes/`, newRoute, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            alert('Tuyến xe đã được thêm thành công!');
            navigate('/routes/'); // Quay về danh sách tuyến xe sau khi thêm
        } catch (error) {
            console.error('Lỗi khi thêm tuyến xe:', error);
            setError('Có lỗi xảy ra khi thêm dữ liệu.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress /> 
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h4">Thêm tuyến xe</Typography>

                {error && <Typography color="error">{error}</Typography>}
                
                <TextField
                    label="Mã tuyến xe"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="station-start-label">Điểm đi</InputLabel>
                    <Select
                        value={stationStart}
                        onChange={(e) => setStationStart(e.target.value)}
                        labelId="station-start-label"
                        label='Điểm đi'
                    >
                        {stations.length > 0 && stations.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.name} ({s.address})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="station-end-label">Điểm kết thúc</InputLabel>
                    <Select
                        value={stationEnd}
                        onChange={(e) => setStationEnd(e.target.value)}
                        labelId="station-end-label"
                        label='Điểm kết thúc'
                    >
                        {stations.length > 0 && stations.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.name} ({s.address})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleAddRoute}>
                        Thêm
                    </Button>
                    <Button variant="contained" color="grey" onClick={() => navigate('/routes/')} style={{ marginLeft: 10 }}>
                        Thoát
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default AddRoute;
