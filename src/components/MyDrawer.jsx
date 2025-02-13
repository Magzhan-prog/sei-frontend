import React, { useState } from 'react';
import { Drawer, Button, List, ListItem, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Services = () => <div>Services Page</div>;
const Contact = () => <div>Contact Page</div>;

const MyDrawer = () => {
  const [open, setOpen] = useState(false);

  // Функция для открытия и закрытия Drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Router>
      <div>
        <AppBar position="sticky">
          <Toolbar>
            <Button onClick={toggleDrawer} color="inherit">
              Open Drawer
            </Button>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              My App
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer anchor="left" open={open} onClose={toggleDrawer}>
          <List>
            {/* Переход с использованием Link и без передачи true в button */}
            <ListItem component={Link} to="/" onClick={toggleDrawer} button>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem component={Link} to="/about" onClick={toggleDrawer} button>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem component={Link} to="/services" onClick={toggleDrawer} button>
              <ListItemText primary="Services" />
            </ListItem>
            <ListItem component={Link} to="/contact" onClick={toggleDrawer} button>
              <ListItemText primary="Contact" />
            </ListItem>
          </List>
        </Drawer>

        {/* Контент, который меняется в зависимости от маршрута */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default MyDrawer;
