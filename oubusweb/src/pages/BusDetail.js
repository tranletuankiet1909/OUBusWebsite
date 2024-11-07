import { Container, Typography, TextField, Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BusDetail = () => {
    const { id } = useParams();
    const [bus, setBus] = useState(null);
    const [station, setStation] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // Tệp ảnh được chọn
    const [seatNumber, setSeatNumber] = useState('');
    const [busStatus, setBusStatus] = useState(false);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    useEffect(() => {
        fetchBusDetail();
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

    const fetchBusDetail = async () => {
        try {
            const response = await axios.get(`/buses/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const busData = response.data;
            setBus(busData);
            setStation(busData.station.id);
            setName(busData.name);
            setLicensePlate(busData.license_plate);
            setSeatNumber(busData.seat_number);
            setBusStatus(busData.available); // Trạng thái của bus
            setImage(busData.image);
        } catch (error) {
            console.error('Lỗi hiển thị thông tin chi tiết xe bus:', error);
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
        
        if (name === 'name') {
            setName(value);
        } else if (name === 'license_plate') {
            setLicensePlate(value);
        } else if (name === 'seat_number') {
            setSeatNumber(value);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(URL.createObjectURL(file)); // Hiển thị ảnh đã chọn
        setSelectedFile(file);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('license_plate', licensePlate);
        formData.append('station', station);
        formData.append('seat_number', seatNumber);
        formData.append('available', busStatus ? 'True' : 'False'); 
        formData.append('image', selectedFile?selectedFile:image);
        try {
            await axios.put(`/buses/${id}/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setIsEditing(false); 
        } catch (error) {
            console.error('Lỗi khi lưu thông tin xe bus:', error);
            setError('Có lỗi xảy ra khi lưu dữ liệu.');
        }
    };

    const handleDeleteBus = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa xe bus này?")) {
            try {
                await axios.delete(`/buses/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                alert('Xe bus đã được xóa thành công!');
                navigate('/buses/');
            } catch (error) {
                console.error('Lỗi khi xóa xe bus:', error);
                alert('Có lỗi xảy ra khi xóa xe bus!');
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
            {bus ? (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" textAlign={'center'} style={{ marginTop: 10, fontWeight: 'bold'}}>Thông tin chi tiết xe bus</Typography>
                    
                    <TextField
                        label="Tên xe bus"
                        name="name"
                        value={name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        disabled={!isEditing} 
                    />
                    <TextField
                        label="Biển số xe"
                        name="license_plate"
                        value={licensePlate}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        disabled={!isEditing} 
                    />
                    <TextField
                        label="Số ghế"
                        name="seat_number"
                        value={seatNumber}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        type="number"
                        disabled={!isEditing} 
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="station-label">Bến xe</InputLabel>
                        <Select
                            value={station}
                            onChange={(e) => setStation(e.target.value)}
                            labelId="station-label"
                            label='Bến xe'
                            disabled={!isEditing}
                        >
                            {stations.length > 0 && stations.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name} ({s.address})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Avatar
                        alt="Bus Image"
                        src={image}
                        sx={{ width: 200, height: 200, marginTop: 2, marginBottom: 2 }}
                    />
                    {isEditing && (
                        <Box mt={2}>
                            <Button variant="contained" component="label">
                                Thay đổi ảnh xe bus
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Box>
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={busStatus}
                                onChange={() => setBusStatus(!busStatus)}
                                disabled={!isEditing}
                            />
                        }
                        label="Trạng thái hoạt động"
                    />
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
                                <Button variant="contained" style={{ backgroundColor: 'red', marginLeft: 10 }} onClick={handleDeleteBus}>
                                    Xóa
                                </Button>
                                <Button style={{ marginLeft: 10 }} variant="contained" color="grey" onClick={() => { navigate('/buses/'); }}>
                                    Thoát
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            ) : (
                <Typography color="error">Không tìm thấy thông tin xe bus.</Typography>
            )}
        </Box>
    );
};

export default BusDetail;
