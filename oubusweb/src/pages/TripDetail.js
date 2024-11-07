import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Contexts from '../configs/Contexts';
import { Typography, CircularProgress, Table, TableRow, TableCell, Box, Button, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const TripDetail = () => {
    const { id } = useParams();
    const [bustrip, setBustrip] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null); // Thông tin sinh viên tìm thấy
    const [students, setStudents] = useState([]);
    const [mssv, setMssv] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [userState, dispatch] = useContext(Contexts);
    const token = localStorage.getItem('access-token'); 
    const navigate = useNavigate();


    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await axios.get(`/bustrips/${id}/`);
                setBustrip(res.data);
            } catch (ex) {
                setError('Không thể tải thông tin chuyến xe. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
        const fetchSeats = async () => {
            try {
                const res = await axios.get(`/bustrips/${id}/seats`); 
                setSeats(res.data);
            } catch (ex) {
                setError('Không thể tải danh sách ghế. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
        if (userState.user.user.role === 'staff') {
            const fetchStudents = async () => {
                try {
                    const res = await axios.get(`/students/`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }); 
                    setStudents(res.data);
                } catch (ex) {
                    setError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
                } finally {
                    setLoading(false);
                }
            };
            fetchStudents();
        }    
    }, [id]);

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

    if (!bustrip) {
        return <Typography>Chuyến xe không tồn tại.</Typography>; 
    }

    const handleBooking = async () => {
        const formData = new FormData(); 
        formData.append('seat_bustrip', selectedSeat);
        if (studentInfo ) {
            formData.append('student', studentInfo.id)
        }
        console.info(selectedSeat)
        try {
            const res = await axios.post(`/bustrips/${id}/booking/`, formData , {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.status === 201) {
                alert('Đặt vé thành công!');
                navigate('/');
            }

        } catch (ex) {
            alert('Đặt vé không thành công! Vui lòng thử lại');
        }
    };
    
    const handleSearchStudent = async () => {
        const sInfo = students.find((student) => student.student_code === mssv);
        setStudentInfo(sInfo);
    };

    return (
        <Box style={{ margin: 10 }}>
            <Box mt={5} textAlign='center'>
                <Typography variant="h4" color="#02053a" fontWeight="bold">CHI TIẾT CHUYẾN XE</Typography>
            </Box>
            <Table style={{ marginLeft: '25%', marginTop:10, width:'50%' }}>      
                <TableRow  className='row-style'>
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Nơi xuất phát</TableCell>
                    <TableCell>{bustrip.route.starting_point.name} - {bustrip.route.starting_point.address}</TableCell>
                </TableRow>     
                <TableRow  className='row-style' >
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Nơi kết thúc</TableCell>
                    <TableCell>{bustrip.route.ending_point.name} - {bustrip.route.ending_point.address}</TableCell>
                </TableRow>
                <TableRow  className='row-style'>
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Giờ khởi hành</TableCell>
                    <TableCell>{new Date(bustrip.start_time).toLocaleTimeString()}</TableCell>
                </TableRow>
                <TableRow  className='row-style'>
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Ngày khởi hành</TableCell>
                    <TableCell>{new Date(bustrip.start_time).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow  className='row-style'>
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Tên tài xế</TableCell>
                    <TableCell>{bustrip.driver.name}</TableCell>
                </TableRow>  
                <TableRow  className='row-style'>
                    <TableCell variant="head" style={{ fontWeight: 'bold', fontSize:16 }}>Bảng số xe bus</TableCell>
                    <TableCell>{bustrip.bus.license_plate}</TableCell>
                </TableRow>       
            </Table>
            <Box mt={4}>
                <Typography variant="h6" color="#02053a" fontWeight="bold" textAlign='center'>Danh Sách Ghế Ngồi</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {seats.map(seat => (
                        <Box key={seat.id} sx={{ margin: 1 }}>
                            <Button 
                                variant="outlined" 
                                // color={seat.available ? "primary" : "secondary"} 
                                color={selectedSeat === seat.id ? "success" : (seat.available ? "primary" : "secondary")} 
                                disabled={!seat.available}
                                onClick={() => {
                                    setSelectedSeat(seat.id); // Lưu ghế đã chọn
                                    alert(`Bạn đã chọn ghế số ${seat.seat.code}`);
                                }}
                                fullWidth
                            >
                                {seat.seat.code}
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>
            {userState.user.user.role === 'staff' && (
                <Box mt={4} textAlign="center">
                    <TextField
                        label="Nhập mã số sinh viên"
                        variant="outlined"
                        value={mssv}
                        onChange={(e) => setMssv(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSearchStudent} 
                        style={{ marginLeft: 10 }}
                    >
                        Tìm kiếm sinh viên
                    </Button>

                    {/* Hiển thị thông tin sinh viên nếu tìm thấy */}
                    {studentInfo && (
                        <Box mt={2}>
                            <Typography variant="h6">Thông tin sinh viên:</Typography>
                            <Typography>MSSV: {studentInfo.student_code}</Typography>
                            <Typography>Tên: {studentInfo.fullname}</Typography>
                        </Box>
                    )}
                </Box>
            )}           
            <Box mt={4} textAlign="center">
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                        if (selectedSeat) {
                            handleBooking();
                            console.log(`Đặt vé cho ghế số ${selectedSeat}`);
                        } else {
                            alert('Bạn chưa chọn ghế.');
                        }
                    }}
                >
                    Đăng ký vé
                </Button>
            </Box>
        </Box>
    );
}

export default TripDetail;
