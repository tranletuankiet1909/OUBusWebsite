import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // hoặc 'dark' tùy thuộc vào nhu cầu của bạn
        primary: {
            main: '#02053a', // Màu chủ đạo của bạn
        },
        secondary: {
            main: '#f50057', // Màu phụ của bạn
        },
    },
});

export default theme;
