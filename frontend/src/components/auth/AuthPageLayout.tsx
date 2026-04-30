import { Box, Typography } from "@mui/material";
import type React from "react";
import loginIcon from "@assets/login-icon.png";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  footerLabel: string;
  footerLinkLabel: string;
  onFooterClick: () => void;
}

const AuthPageLayout = ({
  children,
  footerLabel,
  footerLinkLabel,
  onFooterClick,
}: AuthPageLayoutProps) => (
  <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", px: "4rem" }}>
    <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
      {children}
    </Box>

    <Box
      sx={{
        flex: 1,
        display: "grid",
        justifyItems: "center",
        alignSelf: "center",
        gap: 2,
      }}
    >
      <Box
        component="img"
        src={loginIcon}
        sx={{ display: { xs: "none", md: "block" }, width: "100%", maxWidth: "30rem" }}
      />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2">{footerLabel}</Typography>
        <Box
          onClick={onFooterClick}
          sx={{
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {footerLinkLabel}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default AuthPageLayout;
