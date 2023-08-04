import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

export const darkTheme = createTheme({
    palette: {
      mode: "dark",
  
      primary: {
        main: "#c5cae9"
      },

      background: {
        default: "#333333",
      },
  
      secondary:{
        main: "#fff"
      }
      
    },
  });