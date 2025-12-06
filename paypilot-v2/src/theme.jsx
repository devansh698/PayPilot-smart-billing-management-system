import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    colors: {
      primary: '#000',
      secondary: '#fff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    colors: {
      primary: '#fff',
      secondary: '#000',
    },
  },
  colorSchemes: {
    dark: {
      primary: '#fff',
      secondary: '#000',
    },
  },
  colors: {
    primary: '#fff',
    secondary: '#000',
  },
  color: {
    primary: '#fff',
    secondary: '#000',
  },
  colorScheme: {
    primary: '#fff',
    secondary: '#000',
  },

});

export { lightTheme, darkTheme };
