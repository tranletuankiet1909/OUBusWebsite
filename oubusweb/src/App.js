// import React, { useReducer, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
// import Contexts from './configs/Contexts';
// import { ThemeProvider } from '@emotion/react';
// import theme from './theme';
// import { CssBaseline } from '@mui/material';
// import MyUserReducer from './configs/MyUserReducer';
// import axios from 'axios';
// import Register from './pages/Register';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import MainLayout from './components/MainLayout';
// import TripDetail from './pages/TripDetail';
// import Profile from './pages/Profile';
// import ChangePassword from './pages/ChangePassword';
// import TicketsList from './pages/TicketsList';
// import Review from './pages/Review';
// import AddTrip from './pages/AddTrip';
// import EditTrip from './pages/EditTrip';

// const getUserFromLocalStorage = () => {
//   const storedUser = localStorage.getItem('user');
//   return storedUser ? JSON.parse(storedUser) : null;
// }

// function App() {
//   const [userState, dispatch] = useReducer(MyUserReducer, { user: getUserFromLocalStorage() });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const token = localStorage.getItem('access-token');
//       if (!token || !userState.user) {
//         navigate('/login');  
//       }
      
//     };
//     checkLoginStatus();
//   }, [userState.user, navigate]); 

//   return (
//     <Contexts.Provider value={[userState, dispatch]}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Routes>
//           <Route path="/login/" element={<Login />} />
//           <Route path="/register/" element={<Register />} />
//           {userState.user ? (
//             <Route element={<MainLayout />}>
//               <Route path="/" element={<Home />} />
//               <Route path="/bustrips/:id" element={<TripDetail />} />
//               <Route path="/profile/" element={<Profile />} />
//               <Route path="/change-password/" element={<ChangePassword />} />
//               <Route path="/tickets/" element={<TicketsList />} />
//               <Route path="/tickets/:id/review/" element={<Review />} />
//               <Route path="/add-trip/" element={<AddTrip />} />
//               <Route path="/edit-trip/:id" element={<EditTrip />} />
//             </Route>
//           ) : (
//             <Route path="*" element={<Navigate to="/login" />} /> 
//           )}
//         </Routes>
//       </ThemeProvider>
//     </Contexts.Provider>
//   );
// }

// export default App;
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Contexts from './configs/Contexts';
// import { ThemeProvider } from '@emotion/react';
// import theme from './theme';
// import { CssBaseline } from '@mui/material';
// import { useReducer, useEffect } from 'react';
// import MyUserReducer from './configs/MyUserReducer';
// import axios from 'axios';
// import Register from './pages/Register';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import MainLayout from './components/MainLayout';
// import TripDetail from './pages/TripDetail';
// import Profile from './pages/Profile';
// import ChangePassword from './pages/ChangePassword';
// import TicketsList from './pages/TicketsList';
// import Review from './pages/Review';
// import AddTrip from './pages/AddTrip';
// import EditTrip from './pages/EditTrip';

// const getUserFromLocalStorage = () => {
//   const storedUser = localStorage.getItem('user');
//   return storedUser ? JSON.parse(storedUser) : null;
// }

// function App() {
//   const [userState, dispatch] = useReducer(MyUserReducer, {user: null});

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const token = localStorage.getItem('access-token');
//         if (token) {
//           let userRes = await axios.get(`/users/user-profile/`, {
//             headers: { "Authorization": `Bearer ${token}` },
//           });
//           let userData = userRes.data;
//           userData = {
//             ...userData,  
//             ...userData.user  
//           };
//           dispatch({ 
//             type: 'login', 
//             payload: userData, 
//           });
//         } 
//       } catch (error) {
//         console.error("Lỗi khi kiểm tra trạng thái đăng nhập", error);
//         localStorage.removeItem('access-token');  // Xóa token nếu không hợp lệ
//       }
//     };

//     checkLoginStatus();  // Gọi hàm kiểm tra trạng thái đăng nhập khi component được mount
//   }, [dispatch]);

//   return (
//     <Contexts.Provider value={[userState, dispatch]}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Router>
//           <Routes>
//             <Route path="/login/" element={<Login />} />
//             <Route path="/register/" element={<Register />} />
//             <Route 
//               path="/" 
//               element={userState.user ? (
//                 <MainLayout>
//                   <Home />
//                 </MainLayout>
//               ) : (
//                 <Navigate to="/login/" />
//               )} 
//             />
//             <Route path="/bustrips/:id" element={userState.user ? (
//                 <MainLayout>
//                   <TripDetail />
//                 </MainLayout>
//               ) : (
//                 <Navigate to="/login/" />
//               )} 
//             />
//             {/* Thêm các route khác tương tự */}
//           </Routes>
//         </Router>
//       </ThemeProvider>
//     </Contexts.Provider>
//   );
// }

// export default App;
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Contexts from './configs/Contexts';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import { CssBaseline } from '@mui/material';
import { useReducer, useEffect } from 'react';
import MyUserReducer from './configs/MyUserReducer';
import axios from 'axios';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import TripDetail from './pages/TripDetail';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import TicketsList from './pages/TicketsList';
import Review from './pages/Review';
import AddTrip from './pages/AddTrip';
import EditTrip from './pages/EditTrip';
import RouteList from './pages/RouteList';
import RouteDetail from './pages/RouteDetail';
import AddRoute from './pages/AddRoute';
import BusList from './pages/BusList';
import BusDetail from './pages/BusDetail';
import AddBus from './pages/AddBus';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';
import Statistic from './pages/Statistic';
import ComboList from './pages/ComboList';
import PaymentPage from './pages/PaymentPage';
import PaymentResult from './pages/PaymentResult';
import ChatPage from './pages/ChatPage';

const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
}

function App() {
  const [userState, dispatch] = useReducer(MyUserReducer, { user: getUserFromLocalStorage() });

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = localStorage.getItem('access-token');
        if (token) {
          let userRes = await axios.get(`/users/user-profile/`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          let userData = userRes.data;
          dispatch({ 
            type: 'login', 
            payload: userData, 
          });
        } else {
          dispatch({ type: 'logout' });
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập", error);
        localStorage.removeItem('access-token'); 
        dispatch({ type: 'logout' });
      }
    };

    checkLoginStatus();
  }, [dispatch]);

  return (
    <Contexts.Provider value={[userState, dispatch]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login/" element={<Login />} />
            <Route path="/register/" element={<Register />} />
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/bustrips/:id" element={<TripDetail />} />
                <Route path="/profile/" element={<Profile />} />              
                <Route path="/change-password/" element={<ChangePassword />} />
                <Route path="/tickets/" element={<TicketsList />} />
                <Route path="/comboes/" element={<ComboList />} />
                <Route path="/tickets/:id/review/" element={<Review />} />
                <Route path="/add-trip/" element={<AddTrip />} />
                <Route path="/edit-trip/:id" element={<EditTrip />} />
                <Route path="/routes/" element={<RouteList />} />
                <Route path="/routes/:id" element={<RouteDetail />} />
                <Route path="/add-route/" element={<AddRoute />} />
                <Route path="/buses/" element={<BusList />} />
                <Route path="/buses/:id" element={<BusDetail />} />
                <Route path="/add-bus/" element={<AddBus />} />
                <Route path="/reviews/" element={<ReviewList />} />
                <Route path="/reviews/:id" element={<ReviewDetail />} />
                <Route path="/statistic/" element={<Statistic />} />
                <Route path="/tickets/:id/create-payment" element={<PaymentPage />} />
                <Route path="/payment-result/" element={<PaymentResult />} />
                <Route path="/chat/" element={<ChatPage />} />
              </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Contexts.Provider>
  );
}

export default App;


