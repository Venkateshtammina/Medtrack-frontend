import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1677FF', dark: '#0958D9', light: '#EAF3FF' },
    secondary: { main: '#13A8A8' },
    background: { default: '#F6F8FC', paper: '#FFFFFF' },
    text: { primary: '#172033', secondary: '#667085' },
    divider: '#E7ECF3',
    success: { main: '#12B76A' },
    warning: { main: '#F79009' },
    error: { main: '#F04438' },
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 720, letterSpacing: '-0.025em' },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F6F8FC' },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: 'none', minHeight: 40 },
        contained: { boxShadow: '0 8px 18px rgba(22, 119, 255, 0.18)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
        notchedOutline: { borderColor: '#DDE4EE' },
      },
    },
  },
});

export default theme;
