import React, { useEffect, useState } from "react";
import "./App.css";
import { SERVER_URL } from "./constants";
import { createTheme } from "./theme/index";

// Ui
import {
  Snackbar,
  Alert,
  Grid,
  Paper,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material";
import { Box, styled } from "@mui/system";

// Styled components
const Root = styled("div")``;

function App() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const cs = new WebSocket(`ws://${SERVER_URL}/routes_ws`);

    cs.onerror = () => {
      setOpen(true);
    };

    cs.onopen = () => {
      cs.send("start");
    };

    cs.onmessage = (e) => {
      let data = JSON.parse(e.data);
      console.log(data);
    };
    return () => {
      cs.close();
    };
  }, []);

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Root
          sx={{
            backgroundColor: "background.dark",
            minHeight: "100vh",
          }}
        >
          <Grid container maxWidth={false}>
            <Grid item xs="4">
              <Paper elevation={24}>
                <Box width="100%" height="100%"></Box>
              </Paper>
            </Grid>
            <Grid item xs="8"></Grid>
          </Grid>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              An error has occured while connecting to the API !
            </Alert>
          </Snackbar>
        </Root>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

export default App;
