import React, { useState } from "react";
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
  Button,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import { Box, styled } from "@mui/system";
import DzMap from "./components/map";
import LoadingComponent from "./components/Loading";

// Styled components
const Root = styled("div")``;

const distanceBetweenPoints = (current, previous) => {
  const xs = ((current.x - previous.x) * Math.PI) / 180;
  const ys = ((current.y - previous.y) * Math.PI) / 180;

  const a =
    Math.sin(xs / 2) * Math.sin(xs / 2) +
    Math.cos(toRad(current.x)) *
      Math.cos(toRad(previous.x)) *
      Math.sin(ys / 2) *
      Math.sin(ys / 2);
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371;
};

const distance = (data = []) => {
  let dist = 0;
  data.forEach((current, index) => {
    if (index === 0) {
      //
    } else {
      const previous = data[index - 1];
      let tmpDist = distanceBetweenPoints(current, previous);
      dist += tmpDist;
    }
  });
  return dist.toFixed(2);
};

const toRad = (dg) => {
  return (dg * Math.PI) / 180;
};

function App() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);
  const [iteration, setIteration] = useState(null);
  const [solving, setSolving] = useState(false);
  const [allowRouteAnimation] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const solve = () => {
    setData([]);
    setHistory([]);
    setSolving(true);
    let tmpData = [];
    const cs = new WebSocket(`ws://${SERVER_URL}/routes_ws`);

    cs.onerror = () => {
      setOpen(true);
    };

    cs.onopen = () => {
      cs.send("start");
    };

    cs.onmessage = (e) => {
      if (e.data !== "done") {
        tmpData = Object.entries(JSON.parse(e.data))
          .map(([key, value]) => ({
            ...value,
            name: key,
          }))
          .sort((a, b) => parseInt(a?.index) - parseInt(b?.index));
        setHistory((state) => {
          setIteration(state.length);
          return [...state, { index: state?.length, data: [...tmpData] }];
        });
        setTimeout(() => {
          setData([...tmpData]);
        }, [250]);
      } else {
        setData([...tmpData]);
        cs.close();
        setSolving(false);
      }
    };
  };

  const theme = createTheme();

  const getPreviousPosition = (code) => {
    if (iteration === 0) return "Initial";
    let previous = history[iteration - 1].data.find((elm) => elm.code === code);
    return previous?.index + 1;
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Root
          sx={{
            backgroundColor: "background.dark",
            minHeight: "100vh",
            pb: 10,
          }}
        >
          <Grid container spacing={5} padding={5}>
            <Grid item xs="5">
              <DzMap
                data={data}
                solving={solving}
                allowRouteAnimation={allowRouteAnimation}
              />
            </Grid>
            <Grid item xs="7">
              <Paper elevation={24} sx={{ p: 3, width: "90%", m: "auto" }}>
                <Box width="100%" height="100%">
                  <Grid container spacing={4} sx={{ alignItems: "center" }}>
                    <Grid item xs="6">
                      <Box
                        dispaly="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Button variant="contained" onClick={solve}>
                          SOLVE IT !
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setData([]);
                            setHistory([]);
                          }}
                          sx={{ mx: 2 }}
                          disabled={solving}
                        >
                          RESET
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs="12">
                      <Grid container spacing={3} sx={{ alignItems: "center" }}>
                        <Grid item xs="12" sm="6">
                          Totale distance : {distance(data)} KM
                        </Grid>
                        <Grid item xs="12" sm="6">
                          <Autocomplete
                            options={history}
                            getOptionLabel={(option) =>
                              `Iteration ${
                                typeof option === "number"
                                  ? option + 1
                                  : option.index + 1
                              }`
                            }
                            isOptionEqualToValue={(option, value) =>
                              option?.index === value
                            }
                            value={iteration}
                            onChange={(e, newValue) => {
                              setIteration(
                                newValue ? newValue.index : history?.length - 1
                              );
                              setData([
                                ...(newValue?.data ||
                                  history[history?.length - 1].data),
                              ]);
                            }}
                            disabled={history?.length < 1 || solving}
                            renderInput={({ ...props }) => (
                              <TextField
                                {...props}
                                fullWidth
                                placeholder="Iterations History"
                                label="Iterations History"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs="12">
                      {solving ? (
                        <LoadingComponent />
                      ) : (
                        <Box
                          sx={{
                            maxHeight: 550,
                            overflowY: "scroll",
                          }}
                        >
                          <Stepper orientation="vertical">
                            {data.map((wilaya, index) => (
                              <Step key={index} active>
                                <StepLabel
                                  optional={
                                    <Box display="flex" flexDirection="column">
                                      <Typography variant="caption">
                                        Previous position :{" "}
                                        {getPreviousPosition(wilaya.code)}
                                      </Typography>
                                      {index + 1 < data?.length && (
                                        <Typography variant="caption">
                                          To next point :{" "}
                                          {distanceBetweenPoints(
                                            wilaya,
                                            data[index + 1]
                                          ).toFixed(2)}{" "}
                                          KM
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                >
                                  {`${wilaya.name} (${wilaya.code})`}
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
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
