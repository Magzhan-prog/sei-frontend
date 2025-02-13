import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Box, Typography, AppBar, Toolbar, CssBaseline, Drawer, List, ListItemButton, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GetItems from './TestGetItems';
import UserIdChanger from './UserIDChanger';
import UserIdDisplay from './UserIdDisplay';
import Dashboard from './TestDashboard';

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Социально-экономические показатели</Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
          onKeyDown={() => toggleDrawer(false)}
        >
          <List>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="editData" />
            </ListItemButton>
            <ListItemButton component={Link} to="/getitems">
              <ListItemText primary="getData" />
            </ListItemButton>
            <ListItemButton component={Link} to="/changeid">
              <ListItemText primary="UserIdChange" />
            </ListItemButton>
            <ListItemButton component={Link} to="/displayid">
              <ListItemText primary="UserIdDisplay" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Container>
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/getitems" element={<GetItems />} />
            <Route path="/changeid" element={<UserIdChanger />} />
            <Route path="/displayid" element={<UserIdDisplay />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
};

export default App;
