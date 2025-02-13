import React from "react";
import {
  Typography,
  Divider,
  Card,
  List,
  ListItem,
  Box
} from "@mui/material";

const GetIndexAttributes = ({ indexAttributes }) => {
  return (
    <Box >
      {indexAttributes && (
        <Box sx={{ padding: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Паспорт показателя:
          </Typography>
          <List>
            {indexAttributes.passport?.map((item) => (
              <ListItem key={item.title}>
                <Box sx={{ display: "flex", width: "100%", mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {item.title}:
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body2">{item.value}</Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default GetIndexAttributes;
