import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { signUp, signIn, mySignOut, isLogin } from '../firebase'
import { Link, useNavigate, Redirect } from 'react-router-dom';

// button style
const signUpStyle = {
    // テキスト色を白にする
    color: '#fff',
}

export const Header = () => {
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const navigate = useNavigate();

  const handleMenu = (event) => {
    console.log("event: ", event.currentTarget)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSignOut = () => {
    mySignOut();
    // ログアウト後にリダイレクト
    navigate('/');
  };
  const hadleSignUp = () => {
    signUp();
    setAnchorEl(null);
  }
  const hadleSignIn = () => {
    signIn();
    setAnchorEl(null);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        {/* 横三列のマーク */}
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Welecome ゲスト
          </Typography>
          {/* マイページ(LogIn時)*/}
          {auth && (
            <div>
              {/* 人マークのボタン */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
              <AccountCircle />
              </IconButton>
              {/* マイページのメニュー */}
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleSignOut}>SignOut</MenuItem>
              </Menu>
            </div>
            )}
            {/* マイページ(LogOut時)*/}
            {!auth && (
              <div>
                {/* 人マークのボタン */}
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                <AccountCircle />
                </IconButton>
                {/* マイページのメニュー */}
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>Sign Up</MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign In</MenuItem>
                </Menu>
              </div>
              )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}


