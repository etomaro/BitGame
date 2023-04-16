import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

// 4bit2進数と対応する10進数のオブジェクトを作成
const bit4 = {
  '0000': '0',  
  '0001': '1',
  '0010': '2',
  '0011': '3',
  '0100': '4',
  '0101': '5',
  '0110': '6',
  '0111': '7',
  '1000': '8',
  '1001': '9',
  '1010': '10',
  '1011': '11',
  '1100': '12',
  '1101': '13',
  '1110': '14',
  '1111': '15',
}


// 数値ボタンのスタイル
const buttonStyle = {
  width: "calc(100% / 5)",
  height: "100px",
  // 背景を薄水色にする
  backgroundColor: "#e0ffff",
  // ボーダーを黒色にする
  border: "solid 1px #000000",
  // ボタンの文字を黒にする
  color: "#000000",
};
// okボタンのスタイル
const okButtonStyle = {
  width: "calc(100% / 7)",
  height: "70px",
  // ボーダーを黒色にする
  border: "solid 1px #000000",
  // ボタンの文字を黒にする
  color: "#000000",
  // 中央に配置する
  margin: "auto",
  // 上との間隔をあける
  marginTop: "20px",
};

// inputのスタイル
const inputStyle = {
  // 背景を薄水色にする
  backgroundColor: "#e0ffff",
  // ボタンの文字を黒にする
  color: "#000000",
  height: "50px",
};
// textのスタイル
const textStyle = {
  // フォントサイズを大きくする
  fontSize: "25px",
  // テキストの色を青にする
  color: "#e0ffff",
  // 下の余白をあける
  marginBottom: "70px",
}

// 画面スクロールを禁止にするコンポーネント
function DisableScroll() {
  useEffect(() => {
    // body要素にoverflow: hiddenを設定
    document.body.style.overflow = 'hidden';

    // コンポーネントがアンマウントされたときにoverflowスタイルを削除
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return null;
}

// QandA
const QandA = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // state
  const [seInNum, setInNum] = useState("");  // 入力された数値
  const [seCount, setCount] = useState(1);  // 問題数


  // ボタンをクリックしたときの処理
  const btnClick = (e) => {
    setInNum(seInNum + e.target.textContent);
  }
  // inputの値を変更したときの処理
  const inputChange = (e) => {
    // TextFieldの値を取得
    setInNum(e.target.value);
  }
  // 削除ボタンをクリックしたときの処理
  const deleteClick = () => {
    // seInNumの最後の文字を削除
    // setInNum(seInNum.slice(0, -1));

    // inNumを初期化
    setInNum("");
  }
  // okボタンをクリックしたときの処理
  const okClick = () => {
    // test

  }
  return (
      <>
        <DisableScroll />
        <Box>
          <Box style={textStyle}>2進数を10進数に変えてください</Box>
          <Box fontSize="midium" mb="20px">{seCount}問目</Box>
          <Box mb={3}> 1001,0001 -> 
            {/* 入力 */}
            <TextField onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle}/>
            {/* 削除ボタン */}
            <IconButton onClick={deleteClick} aria-label="delete" color="primary">
              <DeleteIcon fontSize="large"/>
            </IconButton>
          </Box>
          {/* 数値ボタン */}
          <Box display="flex" flexWrap="wrap">
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>0</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>1</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>2</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>3</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>4</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>5</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>6</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>7</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>8</Button>
            <Button variant="contained" style={buttonStyle} onClick={btnClick}>9</Button>
          </Box>
          {/* okボタン */}
          <Button variant="contained" style={okButtonStyle}>ok</Button>
        </Box>
      </>
  )
}
function App() {
  return (
    <div className="App">
      <body className="App-body">
        <QandA />
      </body>
    </div>
  );
}

export default App;
