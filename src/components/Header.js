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
import { SignUp, signIn, mySignOut, isLogin } from '../firebase'
import { Link, useNavigate, Redirect } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { create_user, get_user_id_name }  from '../table/users_table';


// button style
const signUpStyle = {
    // テキスト色を白にする
    color: '#fff',
}

export const Header = () => {
  // const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = useState('');

  const navigate = useNavigate();
  // context 
  const { user } = useAuthContext();


  useEffect(() => {
    if (user) {
      get_user_id_name(user.uid).then((response) => {
        // 初回singUp時だとERROR_USER_NAMEになるので、displayNameを登録(signUp時に名前を設定できるようにしたら修正する必要あり)
        // 妥協案
        if (response[user.uid] === 'ERROR_USER_NAME') {
          setName(user.displayName);
        } else {
          setName(response[user.uid])
        }
      })
    } else {
      setName('Guest');
    }
  }, [user]);

  const handleMenu = (event) => {
    // console.log("event: ", event.currentTarget)
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
    SignUp();
    setAnchorEl(null);
  }
  const hadleSignIn = () => {
    signIn();
    setAnchorEl(null);
  }
  // appbar style

  const AppBarStyle_func = () => {
    // login時: stg->青色、prod->赤色
    // logout時はグレー
    if (user) {
      if (process.env.REACT_APP_ENV === 'PROD') {
        return '#ff0000';
      } else if (process.env.REACT_APP_ENV === 'STG') {
        return '#FDA802';
      }
    } else {
      return '#808080';
      }
    }

  const AppBarStyle = {
    background: AppBarStyle_func(),
    filter: "brightness(110%)"
  };

  // profileボタンを押す
  const handleProfile = () => {
    navigate('/profile/');
    setAnchorEl(null);
  }

  // function get_user_name() {
  //   if (user) {
  //     get_user_id_name(user.uid).then((response) => {
  //       console.log("response: ", response[user.uid])
  //       console.log("type: ", typeof(response[user.uid]))
  //       return response[user.uid];
  //     })
  //   } else {
  //     return 'Guest';
  //   }
  // }

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
          {/* Welecome {user ? get_user_id_name(user.uid)[user.uid] : 'Guest'} */}
        Welcome {name}
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
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
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


