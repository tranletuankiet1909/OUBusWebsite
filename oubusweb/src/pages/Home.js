import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { TextField, Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import debounce from 'lodash.debounce';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
const Home = () => {
  const [bustrips, setBustrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [userState, dispatch] = useContext(Contexts);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [routeId, setRouteId] = useState('')
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0); 
  const navigate = useNavigate();
  const pageSize = 10;
  const token = localStorage.getItem('access-token');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    console.info(newPage);
  };

  useEffect(() => {
    const maxPage = Math.ceil(totalCount / pageSize) - 1;
    if (page > maxPage && maxPage >= 0) {
      setPage(0);
    }
  }, [totalCount, pageSize, page]);
  

  const handleChange = (event) => {
    const selectedRouteName = event.target.value;
    setSelectedRoute(selectedRouteName);

    const selectedRouteObj = routes.find(route => route.route_code === selectedRouteName);
    if (selectedRouteObj) {
        handleRouteSelect(selectedRouteObj.id);
    }
  };

  const handleRouteSelect = (routeId) => {
    setRouteId(routeId);
    setPage(1);
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
    setPage(1);
  }
  const search = (value) => {
    setPage(1);
    setQ(value);
  };
  const handleTripDetail = () => {
    navigate('/tripdetail/')
  }

  useEffect(() => {
    const loadRoute = async () => {
        try {
            let res = await axios.get('/routes/');
            setRoutes(res.data);
        } catch (ex) {
            console.error(ex);
            setError('Không thể tải tuyến đi. Vui lòng thử lại sau.');
        }
    };
    loadRoute();
  }, []);


  const loadTrips = async () => {
    if (page > 0 && !loading) {
      const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
      let url = `/bustrips?q=${q}&route_id=${routeId}&page=${page}&start_time=${formattedDate}`;
      try {
          setLoading(true);
          let res = await axios.get(url);
          let loadedTrips = res.data.results;
          if (userState.user.user.role === 'student') {
            loadedTrips = loadedTrips.filter(trip => trip.trip_status === 'ready');
          }   
          setBustrips(loadedTrips);       
          setTotalCount(userState.user.user.role === 'student' ? loadedTrips.length : res.data.count);
        } catch (ex) {
          console.error(ex);
          setError('Không thể tải chuyến đi. Vui lòng thử lại sau.');
      } finally {
          setLoading(false);
      }
    }
  };

  const debouncedLoadTrips = useCallback(debounce(loadTrips, 300), [q, routeId, page, selectedDate]);

  useEffect(() => {
    debouncedLoadTrips();
    return debouncedLoadTrips.cancel;
  }, [q, routeId, page, selectedDate]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyến xe này?")) {
        try {
            const token = localStorage.getItem('access-token');
            await axios.delete(`/bustrips/${tripId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            alert('Chuyến xe đã được xóa thành công!');
            setBustrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        } catch (error) {
            console.error('Lỗi khi xóa chuyến xe:', error);
            alert('Có lỗi xảy ra khi xóa chuyến xe!');
        }
    }
  };

  return (
    token ? (
      <Box style={{ margin: 10 }}>
        <Box mt={5} textAlign='center'>
          <Typography variant="h4" color="#02053a" fontWeight="bold" > ĐẶT VÉ XE OU BUS </Typography>
        </Box>
        <Box mt={2} style={{ display: 'flex'}}>
          <TextField
            label="Tìm kiếm chuyến xe...."
            variant="outlined"
            sx={{marginBottom: 2, width: '40%' }}
            onChange={(e) => search(e.target.value)}
          />
          <div style={{ marginLeft: 20, marginRight: 20}}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Chọn ngày đi"
                value={selectedDate}
                onChange={(newValue) => handleDateChange(newValue)}
                inputFormat="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} sx={{ flex: 1, marginLeft: 2, marginRight: 2 }} />}/>
            </LocalizationProvider>
          </div>
          <FormControl style={{ marginRight: 10, width: '35%'}}>
            <InputLabel id="route-select-label">Chọn Tuyến Xe</InputLabel>
            <Select
                labelId="route-select-label"
                value={selectedRoute}
                onChange={handleChange}
                label="Chọn Tuyến Xe"
            >
                {routes.map((route) => (
                    <MenuItem key={route.id} value={route.route_code} >
                        {route.route_code}
                    </MenuItem>   
                ))}
            </Select>
          </FormControl> 
        </Box>
        {userState.user.user.role === 'staff' &&
          <Box style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
            <Button onClick={() => navigate('/add-trip/')} style={{ backgroundColor:'green', color:'white', marginTop:5, marginBottom:15, right:0 }}> 
              <Typography variant='h6'>Thêm chuyến xe</Typography> 
            </Button>
          </Box>       
        }

        <TableContainer component={Paper}>
              <Table>
                  <TableHead>
                      <TableRow>
                          <TableCell style={{ fontWeight: 'bold'}}>Điểm Xuất Phát</TableCell>
                          <TableCell style={{ fontWeight: 'bold'}}>Điểm Đến</TableCell>
                          <TableCell style={{ fontWeight: 'bold'}}>Giờ Xuất Phát</TableCell>
                          <TableCell style={{ fontWeight: 'bold'}}>Ngày đi</TableCell>
                          <TableCell style={{ fontWeight: 'bold'}}>Trạng thái chuyến đi</TableCell>
                          {userState.user.user.role === 'staff' && <TableCell style={{ fontWeight: 'bold'}}>Hành động</TableCell>}
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {bustrips
                          .map((trip) => (
                            <>
                            {userState.user.user.role === 'staff' && (
                              <TableRow key={trip.id} onClick={() => navigate(`/bustrips/${trip.id}`)}>
                                  <TableCell>{trip.route.starting_point.name}</TableCell>
                                  <TableCell>{trip.route.ending_point.name}</TableCell>
                                  <TableCell>{format(new Date(trip.start_time), 'HH:mm')}</TableCell>
                                  <TableCell>{format(new Date(trip.start_time), 'dd/MM/yyyy')}</TableCell>
                                  <TableCell>{trip.trip_status}</TableCell>
                                  <TableCell>
                                    <Button style={{ backgroundColor: 'yellow', marginRight: 5}} onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/edit-trip/${trip.id}`)
                                    }}>Chỉnh sửa</Button>
                                    <Button style={{ backgroundColor: 'red'}} onClick={(e) => { 
                                        e.stopPropagation();
                                        handleDeleteTrip(trip.id);
                                    }}>Xóa</Button>
                                  </TableCell>
                              </TableRow>
                            )}
                            {userState.user.user.role === 'student' && trip.trip_status === 'ready' && (
                              <TableRow key={trip.id} onClick={() => navigate(`/bustrips/${trip.id}`)}>
                                  <TableCell>{trip.route.starting_point.name}</TableCell>
                                  <TableCell>{trip.route.ending_point.name}</TableCell>
                                  <TableCell>{format(new Date(trip.start_time), 'HH:mm')}</TableCell>
                                  <TableCell>{format(new Date(trip.start_time), 'dd/MM/yyyy')}</TableCell>
                                  <TableCell>{trip.trip_status}</TableCell>
                              </TableRow>
                            )}
                            </>
                          ))}
                  </TableBody>
              </Table>
          </TableContainer>
          <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={pageSize} // Kích thước trang cố định
              rowsPerPageOptions={[]} // Không cần điều chỉnh số dòng
              labelRowsPerPage=""
          />
      </Box>
  ) : (
    navigate('/login/')
  ));
};
export default Home;

