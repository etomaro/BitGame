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
import appIcon from '../assets/appIcon.png';
import appIcon_left from '../assets/appIcon_left.png';
import appIcon_right from '../assets/appIcon_right.png';
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";


// button style
const signUpStyle = {
    // テキスト色を白にする
    color: '#fff',
}

// inputKey(コナミコマンド用)
let inputKey = [];

export const Header = () => {
  // const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(appIcon)
  const [pos, setPos] = useState(50);  // iconの位置
  const [pos_mobile, setPos_mobile] = useState(30);  // iconの位置
  const [is_move, setIs_move] = useState(true);  // iconのアニメーション実行中フラグ
  const [is_icon_left, setIs_icon_left] = useState(true);  // iconのアニメーションが左か右か

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // コナミコマンドチェック
  document.onkeydown = function (e) {
    var konamiCommand = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; //↑↑↓↓←→←→BA
      inputKey.push(e.keyCode);
      if (inputKey.toString().indexOf(konamiCommand) >= 0) {
          //codes...
          console.log("konamiCommand")
          iconMove();
          inputKey = [];
      }
  }

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
        return '#1976d2';
      }
    } else {
      return '#808080';
      }
    }

  const AppBarStyle = {
    background: AppBarStyle_func(),
  };

  // profileボタンを押す
  const handleProfile = () => {
    navigate('/profile/');
    setAnchorEl(null);
  }
  const handleAnaly = () => {
    navigate('/record/');
    setAnchorEl(null);
  }


  const iconStyle = {
    width: '50px',
    zIndex: 3,  // 重なり順を一番上に
    position: 'absolute',  // 位置を絶対値に
    left: isMobile ? pos_mobile : pos,  // 左から10pxの位置に配置
  }
  const iconMove = () => {
    /*
    1. アイコンが左の場合(初期状態)
      PC: 50px -> Max-50px まで移動
      Mobile: 30px -> Max-30px まで移動
    2. アイコンが右の場合
      PC: Max-50px -> 50px まで移動
      Mobile: Max-30px -> 30px まで移動
    */
  const width = window.innerWidth;  // 画面の横幅を取得
  if (is_icon_left)  {
    // 1. アイコンが左の場合(初期状態)
    setIcon(appIcon_left)
    const width = window.innerWidth;  // 画面の横幅を取得
    // 最後の位置
    const lastPos = isMobile ? width-100 : width - 110;  // 最初の位置が50pxなので
    // アイコンが左が右か(偶数の時右、奇数の時左)
    let index = 1;
    let pos_tmp = isMobile ? pos_mobile : pos;
    const interval_id = setInterval(() => {
      const is_right = index % 2 === 0 ? false : true;  // 奇数の時左、偶数の時右
      pos_tmp += 20;
      isMobile ? setPos_mobile(pos_tmp) : setPos(pos_tmp)
      if (is_right) {
        setIcon(appIcon_right)
      } else {
        setIcon(appIcon_left)
      }
      index++;
      
      // 処理を抜ける
      if(pos_tmp >= lastPos) {
        setIs_icon_left(false)
        setIcon(appIcon)
        clearInterval(interval_id);
      }
    }, 250);
  } else {
    // 1. アイコンが右の場合
    console.log("右！")
    setIcon(appIcon_right)
    // 最後の位置
    const lastPos = isMobile ? 30 : 50;
    let index = 1;
    let pos_tmp = isMobile ? pos_mobile : pos;
    const interval_id = setInterval(() => {
      const is_right = index % 2 === 0 ? false : true;  // 奇数の時左、偶数の時右
      pos_tmp -= 20;
      isMobile ? setPos_mobile(pos_tmp) : setPos(pos_tmp)
      if (is_right) {
        setIcon(appIcon_right)
      } else {
        setIcon(appIcon_left)
      }
      index++;

      // 処理を抜ける
      if(pos_tmp <= lastPos) {
        setIs_icon_left(true)
        setIcon(appIcon)
        clearInterval(interval_id);
      }
    }, 250);
  }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={AppBarStyle}>
      
        {/* 横三列のマーク */}
        <Toolbar>
        <img src={icon} style={iconStyle}></img>
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
                <MenuItem onClick={handleAnaly}>分析</MenuItem>
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


