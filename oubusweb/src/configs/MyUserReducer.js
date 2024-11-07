const MyUserReducer = (currentState, action) => {
    switch (action.type) {
        case 'login':
            localStorage.setItem('user', JSON.stringify(action.payload));  // Lưu thông tin người dùng vào localStorage
            return { ...currentState, user: action.payload };  // Cập nhật thông tin người dùng vào state
        case 'logout':
            localStorage.removeItem('user');  // Xóa thông tin người dùng khi logout
            return { ...currentState, user: null };
        default:
            return currentState;
    }
}

export default MyUserReducer;