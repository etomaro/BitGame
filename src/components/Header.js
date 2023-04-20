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
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect } from 'react';

// button style
const signUpStyle = {
    // テキスト色を白にする
    color: '#fff',
}

export const Header = () => {
  // const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const navigate = useNavigate();
  // context 
  const { user } = useAuthContext();
  // useEffect(() => {
  //   setAuth(user);
  // }, [user]);

  const handleMenu = (event) => {
    console.log("event: ", event.currentTarget)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSignOut = () => {
    // 確認用のダイアログを表示
    if (!window.confirm('ログアウトしますか？')) {
      setAnchorEl(null);
      return;
    }
    mySignOut();
    // ログアウト後にリダイレクト
    navigate('/');
    setAnchorEl(null);
  };
  const hadleSignUp = () => {
    signUp();
    setAnchorEl(null);
  }
  const hadleSignIn = () => {
    signIn();
    setAnchorEl(null);
  }
  // appbar style
  const AppBarStyle = {
    // login時は青色、logout時はグレー
    background: user ? '#1976d2' : '#808080',
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={AppBarStyle}>
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
          Welecome {user ? user.displayName : 'Guest'}
          </Typography>
          {/* マイページ(LogIn時)*/}
          {user && (
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
            {!user && (
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
                  <MenuItem onClick={hadleSignUp}>Sign Up</MenuItem>
                  <MenuItem onClick={hadleSignIn}>Sign In</MenuItem>
                </Menu>
              </div>
              )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}


