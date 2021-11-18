import React, { useEffect, useState } from "react";

// UI
import { LinearProgress, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

// Others
import NProgress from "nprogress";

// Styled Components
const Root = styled("div")``;

const LoadingComponent = () => {
  const [repeat, setRepeat] = useState(1);

  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setRepeat((state) => (state + 1) % 4);
    }, [400]);
  }, [repeat]);

  return (
    <Root
      sx={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: 3,
        mb: 10,
      }}
    >
      <Box width={300}>
        <Typography sx={{ textAlign: "center", mb: 3 }} variant="h3">
          Please wait {".".repeat(repeat)}
        </Typography>
        <LinearProgress />
      </Box>
    </Root>
  );
};

export default LoadingComponent;
