import { Container, Typography, TextField, Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const RouteDetail = () => {
    const { id } = useParams(); // Lấy routeId từ URL
    const [route, setRoute] = useState(null);
    const [stationStart, setStationStart] = useState('');
    const [stationEnd, setStationEnd] = useState('');
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    useEffect(() => {
        fetchRouteDetail();
        fetchStation();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchStation = async () => {
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
        }
    };

    const fetchRouteDetail = async () => {
        try {
            const response = await axios.get(`/routes/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setRoute(response.data);
            setStationStart(response.data.starting_point.id);
            setStationEnd(response.data.ending_point.id);
        } catch (error) {
            console.error('Lỗi hiển thị thông tin chi tiết tuyến xe:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu.'); 
        } finally {
            setLoading(false); 
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoute({ ...route, [name]: value }); 
    };

    const handleSave = async () => {
        try {
            const updatedRoute = {
                ...route,
                starting_point: stationStart,
                ending_point: stationEnd,
            };
            await axios.put(`/routes/${id}/`, updatedRoute, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setIsEditing(false); 
        } catch (error) {
            console.error('Lỗi khi lưu thông tin tuyến xe:', error);
            setError('Có lỗi xảy ra khi lưu dữ liệu.');
        }
    };

    const handleDeleteRoute = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tuyến xe này?")) {
            try {
                await axios.delete(`/routes/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                alert('Tuyến xe đã được xóa thành công!');
                navigate('/routes/');
            } catch (error) {
                console.error('Lỗi khi xóa tuyến xe:', error);
                alert('Có lỗi xảy ra khi xóa tuyến xe!');
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress /> 
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>; 
    }

    return (
        <Box margin={10}>
            {route ? (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" textAlign={'center'} style={{ marginTop: 10, fontWeight: 'bold'}}>Thông tin chi tiết tuyến xe</Typography>
                    
                    <TextField
                        label="Mã tuyến xe"
                        name="route_code"
                        value={route.route_code}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        disabled={!isEditing} 
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="station-start-label">Điểm đi</InputLabel>
                        <Select
                            value={stationStart}
                            onChange={(e) => setStationStart(e.target.value)}
                            labelId="station-start-label"
                            label='Điểm đi'
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                        >
                            {stations.length > 0 && stations.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name} ({s.address})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2 }}>
                        {isEditing ? (
                            <>
                                <Button variant="contained" style={{ backgroundColor: 'green'}} onClick={handleSave}>
                                    Lưu
                                </Button>
                                <Button style={{ marginLeft: 10 }} variant="contained" color="grey" onClick={() => { setIsEditing(false); }}>
                                    Thoát
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="contained" style={{ backgroundColor: 'yellow', color: 'black' }} onClick={handleEditToggle}>
                                    Chỉnh sửa
                                </Button>
                                <Button variant="contained" style={{ backgroundColor: 'red', marginLeft: 10 }} onClick={handleDeleteRoute}>
                                    Xóa
                                </Button>
                                <Button style={{ marginLeft: 10 }} variant="contained" color="grey" onClick={() => { navigate('/routes/'); }}>
                                    Thoát
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            ) : (
                <Typography color="error">Không tìm thấy thông tin tuyến xe.</Typography>
            )}
        </Box>
    );
};

export default RouteDetail;
