import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Typography } from "@mui/material";

interface MarkdownMessageProps {
    content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
    return (
        <Box sx={{ "& p": { m: 0, mb: 1 }, "& ul, & ol": { pl: 2, mb: 1 } }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </Box>
    );
};
