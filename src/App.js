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
import useSound from 'use-sound';
import SoundCorrect from './correct.mp3';
import SoundInCorrect from './incorrect.mp3';

import './App.css';

// 8bit2進数を10進数に変換する関数
function binaryToDecimal(binary) {
  return binary.split('').reverse().reduce((acc, curr, index) => {
    return acc + curr * Math.pow(2, index);
  }, 0);
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

// startボタンのスタイル
const startButtonStyle = {
  width: "calc(100% / 7)",
  height: "70px",
  // ボーダーを黒色にする
  border: "solid 1px #000000",
  // ボタンの文字を黒にする
  color: "#000000",
  // 中央に配置する
  margin: "auto",
  // 上との間隔をあける
  marginTop: "45%",
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
// doneのスタイル
const doneStyle = {
  // 画面の下に固定する
  position: "fixed",
  bottom: "30px",
}
// resultのスタイル
const resultStyle = {
  // 画面の下に固定する
}

const itemStyle = {
  width: "70px",
  // テキストを左寄せにする
  textAlign: "left",
  // フォントサイズ
  fontSize: "15px",
};


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
  const [seMaxCount, setMaxCount] = useState(10);  // 問題数の最大値
  const [seIsGame, setIsGame] = useState(0);  // ゲーム開始(0)、中(1)、終了(2)
  const [sedone, setDone] = useState([]);   // 解答した問題の正負
  const [seQuestion, setQuestion] = useState("")  // 問題の10進数
  const [seIsGood, setIsGood] = useState(false);  // 正解の時
  const [seIsBad, setIsBad] = useState(false);  // 不正解の時
  const [playCor, { stopCor, pauseCor }] = useSound(SoundCorrect);  // 正解の音
  const [playInCor, { stopInCor, pauseInCor }] = useSound(SoundInCorrect);  // 正解の音

  // 正答率を計算する関数
  const calcRate = () => {
    // 正答数を計算
    const goodCount = sedone.filter((value) => {
      return value;
    }).length;
    // 正答率を計算
    const rate = Math.round(goodCount / seMaxCount * 100);
    return rate;
  }
  // 問題をランダムに作成する関数
  const createQuestion = () => {
    // 0~255の乱数を作成
    const num = Math.floor(Math.random() * 256);
    // 2進数に変換
    const binary = num.toString(2);
    // 8桁になるように0を追加
    const question = binary.padStart(8, "0");
    return question;
  }

  // 最初にstate(問題)を設定
  useEffect (() => {
    console.log("a")
    setQuestion(createQuestion());
  },[])


  // 数値ボタンをクリックしたときの処理
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
    // 問題を10進数に変換
    const question = binaryToDecimal(seQuestion);
    // questionを文字に変換
    const questionStr = question.toString();
    // decimalとquestionが一致したら正解
    if (seInNum === questionStr) {
      // 正解した問題を配列に追加
      setDone([...sedone, true]);
      console.log("正解")
      setIsGood(true);
      // correctの音を鳴らす
      playCor();
    } else {
      // 不正解の場合はfalseを追加
      setDone([...sedone, false]);
      console.log("不正解")
      setIsBad(true);
      // coreectの音を鳴らす
      playInCor();
    }
    // 問題数が最大値に達したらゲーム終了
    if (seCount === seMaxCount) {
      setIsGame(2);
    }

    // 問題数を1増やす
    setCount(seCount + 1);
    // 問題を作成
    setQuestion(createQuestion());
    // 入力を初期化
    setInNum("");

    // 0.2秒後に正解or不正解の表示を消す
    setTimeout(() => {
      setIsGood(false);
      setIsBad(false);
    }
    , 2000);
  }
  // startボタンをクリックしたときの処理
  const startClick = () => {
    // ゲーム開始
    setIsGame(1);
  }
  // 正誤の表示
  const done = (value) => {
    if (value === true) {
      return  "○";
    } else if (value === false) {
      return "×";
    } else {
      return "";
    }
  }
  return (
      <>
        <DisableScroll />
        {/* ゲーム開始前の時 */}
        {seIsGame === 0 &&
          <Button variant="contained" style={startButtonStyle} onClick={startClick}>START</Button>
        }
        {/* ゲーム中の時 */}
        {seIsGame === 1 &&
          <Box>
          <Box style={textStyle}>2進数を10進数に変えてください</Box>
          <Box fontSize="midium" mb="20px">{seCount}問目</Box>
          <Box mb={3}> 
            {seQuestion} ->
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
          <Button variant="contained" style={okButtonStyle} onClick={okClick}>ok</Button>
          {/* 解答済みの正誤 */}
          <Box style={doneStyle}>
            <Box display="flex" flexWrap="wrap">
              <Box style={itemStyle}>1問: {done(sedone[0])}</Box>
              <Box style={itemStyle}>2問: {done(sedone[1])}</Box>
              <Box style={itemStyle}>3問: {done(sedone[2])}</Box>
              <Box style={itemStyle}>4問: {done(sedone[3])}</Box>
              <Box style={itemStyle}>5問: {done(sedone[4])}</Box>
            </Box>
            <Box display="flex" flexWrap="wrap">
              <Box style={itemStyle}>6問: {done(sedone[5])}</Box>
              <Box style={itemStyle}>7問: {done(sedone[6])}</Box>
              <Box style={itemStyle}>8問: {done(sedone[7])}</Box>
              <Box style={itemStyle}>9問: {done(sedone[8])}</Box>
              <Box style={itemStyle}>10問: {done(sedone[9])}</Box>
            </Box>
          </Box>
          {/* 正解の場合 */}
          {seIsGood && <div className="circle"></div>}
          {/* 不正解の場合 */}
          {seIsBad && <div className="cross"></div>}
        </Box>
        }
        {/* ゲーム終了の時 */}
        {seIsGame === 2 &&
        <>
          <Box style={textStyle}>結果</Box>
          <Box style={textStyle}>正答率: {calcRate()}%</Box>

          <Box style={resultStyle}>
            <Box display="flex" flexWrap="wrap">
              <Box style={itemStyle}>1問: {done(sedone[0])}</Box>
              <Box style={itemStyle}>2問: {done(sedone[1])}</Box>
              <Box style={itemStyle}>3問: {done(sedone[2])}</Box>
              <Box style={itemStyle}>4問: {done(sedone[3])}</Box>
              <Box style={itemStyle}>5問: {done(sedone[4])}</Box>
            </Box>
            <Box display="flex" flexWrap="wrap">
              <Box style={itemStyle}>6問: {done(sedone[5])}</Box>
              <Box style={itemStyle}>7問: {done(sedone[6])}</Box>
              <Box style={itemStyle}>8問: {done(sedone[7])}</Box>
              <Box style={itemStyle}>9問: {done(sedone[8])}</Box>
              <Box style={itemStyle}>10問: {done(sedone[9])}</Box>
            </Box>
          </Box>
        </>
        }
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
