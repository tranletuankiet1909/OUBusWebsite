import { Container, Typography, TextField, Button, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBus = () => {
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
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    useEffect(() => {
        fetchStation();
    }, []);

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
        setImage(URL.createObjectURL(file));
        setSelectedFile(file);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('license_plate', licensePlate);
        formData.append('station', station);
        formData.append('seat_number', seatNumber);
        formData.append('available', busStatus ? 'True' : 'False'); 
        formData.append('image', selectedFile);
        try {
            await axios.post(`/buses/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            navigate('/buses/');
        } catch (error) {
            console.error('Lỗi khi thêm xe bus:', error);
            setError('Có lỗi xảy ra khi lưu dữ liệu.');
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
            <Box sx={{ mt: 2 }}>
                <Typography variant="h4" textAlign={'center'} style={{ marginTop: 10, fontWeight: 'bold'}}>Thêm xe bus mới</Typography>
                
                <TextField
                    label="Tên xe bus"
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Biển số xe"
                    name="license_plate"
                    value={licensePlate}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Số ghế"
                    name="seat_number"
                    value={seatNumber}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="station-label">Bến xe</InputLabel>
                    <Select
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        labelId="station-label"
                        label='Bến xe'
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
                <Box mt={2}>
                    <Button variant="contained" component="label">
                        Thêm ảnh xe bus
                        <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleImageChange}
                        />
                    </Button>
                </Box>

                <FormControlLabel
                    control={
                        <Switch
                            checked={busStatus}
                            onChange={() => setBusStatus(!busStatus)}
                        />
                    }
                    label="Trạng thái hoạt động"
                />
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" style={{ backgroundColor: 'green'}} onClick={handleSave}>
                        Lưu
                    </Button>
                    <Button style={{ marginLeft: 10 }} variant="contained" color="grey" onClick={() => { navigate('/buses/'); }}>
                        Thoát
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AddBus;
