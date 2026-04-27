import React from "react";
import { Box, Container } from "@mui/material";
import { RagAssistant } from "@components/common/RagAssistant";

const AiAssistant: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100%",
        py: 4,
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <RagAssistant />
      </Container>
    </Box>
  );
};

export default AiAssistant;
