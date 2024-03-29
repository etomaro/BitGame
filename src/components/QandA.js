import logo from '../logo.svg';
import '../App.css';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import useSound from 'use-sound';
import SoundCorrect from '../correct.mp3';
import SoundInCorrect from '../incorrect.mp3';
import { Link, useNavigate, Redirect } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, getDoc, where, query, addDoc, Timestamp, FieldValue } from 'firebase/firestore';
import { create_history, get_history } from '../table/history_table';
import { get_sequence } from '../table/sequence_table';
import { EventNote } from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { blue } from '@mui/material/colors';
import { get_users_name } from '../table/users_table';


// QandA
export const QandA = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // ---------------------  state  ---------------------
  // initial state
  const init_state = {
    "seInNum": "",
    "seCount": 1,
    "seMaxCount": 10,
    "seIsGame": 0,
    "seDone": [],
    "seQuestion": "",
    "seIsGood": false,
    "seIsBad": false,
    "seStartTime": null,
    "seEndMinute": "",
    "seEndSecond": "",
    "seElapsedTime": [],
    "seLastEndTime": "",
    "seQuestionType": "1",
    "seIsDebug": false,
    "seSuccessResult": [],
    "seFaultResult": [],
    "seQuestionList": [],
  }
  const init_allRecHistory = [
    {"rank": "1", "name": "", "time": "", "update_time": ""},
    {"rank": "2", "name": "", "time": "", "update_time": ""},
    {"rank": "3", "name": "", "time": "", "update_time": ""},
    {"rank": "4", "name": "", "time": "", "update_time": ""},
    {"rank": "5", "name": "", "time": "", "update_time": ""}
  ];
  const init_allHistory = [
    {"rank": "1", "name": "", "time": "", "poc": "", "update_time": ""},
    {"rank": "2", "name": "", "time": "", "poc": "", "update_time": ""},
    {"rank": "3", "name": "", "time": "", "poc": "", "update_time": ""},
    {"rank": "4", "name": "", "time": "", "poc": "", "update_time": ""},
    {"rank": "5", "name": "", "time": "", "poc": "", "update_time": ""}
  ];
  const init_yourRecHistory = [
    {"rank": "1", "time": "", "update_time": ""},
    {"rank": "2", "time": "", "update_time": ""},
    {"rank": "3", "time": "", "update_time": ""},
    {"rank": "4", "time": "", "update_time": ""},
    {"rank": "5", "time": "", "update_time": ""}
  ];

  // game情報
  const GAME_INFO = {
    "0": {
      "q_choice_text": "2進数 -> 10進数",
      "q_text": "2進数を10進数に変換してください",
      "ex_question": "0001,0001",
      "ex_answer": "17"
    },
    "1": {
      "q_choice_text": "2進数(上位4bitは固定) -> 10進数",
      "q_text": "2進数を10進数に変換してください",
      "ex_question": "0000,0001",
      "ex_answer": "1"
    },
    "2": {
      "q_choice_text": "2進数(下位4bitは固定) -> 10進数",
      "q_text": "2進数を10進数に変換してください",
      "ex_question": "0001,0000",
      "ex_answer": "16"
    },
    "3": {
      "q_choice_text": "10進数 -> 2進数",
      "q_text": "10進数を2進数に変換してください",
      "ex_question": "17",
      "ex_answer": "0001,0001"
    },
    "4": {
      "q_choice_text": "10進数 -> 2進数(上位4bitは固定)",
      "q_text": "10進数を2進数に変換してください",
      "ex_question": "1",
      "ex_answer": "0000,0001"
    },
    "5": {
      "q_choice_text": "10進数 -> 2進数(下位4bitは固定)",
      "q_text": "10進数を2進数に変換してください",
      "ex_question": "16",
      "ex_answer": "0001,0000"
    },
    "6": {
      "q_choice_text": "16進数 -> 10進数",
      "q_text": "16進数を10進数に変換してください",
      "ex_question": "0x11",
      "ex_answer": "17"
    },
    "7": {
      "q_choice_text": "10進数 -> 16進数",
      "q_text": "10進数を16進数に変換してください",
      "ex_question": "17",
      "ex_answer": "0x11"
    }
  }

  // state
  const [seInNum, setInNum] = useState(init_state.seInNum);  // 入力された数値
  const [seCount, setCount] = useState(init_state.seCount);  // 問題数
  const [seMaxCount, setMaxCount] = useState(init_state.seMaxCount);  // 問題数の最大値
  const [seIsGame, setIsGame] = useState(init_state.seIsGame);  // ゲーム開始(0)、中(1)、終了(2)
  const [sedone, setDone] = useState(init_state.seDone);   // 解答した問題の正負
  const [seQuestion, setQuestion] = useState(init_state.seQuestion)  // 問題の10進数
  const [seIsGood, setIsGood] = useState(init_state.seIsGood);  // 正解の時
  const [seIsBad, setIsBad] = useState(init_state.seIsBad);  // 不正解の時
  const [seStartTime, setStartTime] = useState(init_state.seStartTime);  // 開始時刻
  const [seEndMinute, setEndMinute] = useState(init_state.seEndMinute)  // 経過時間(分)
  const [seEndSecond, setEndSecond] = useState(init_state.seEndSecond)  // 経過時間(秒)
  const [seElapsedTime, setElapsedTime] = useState(init_state.seElapsedTime)  // 1問あたりの経過時間のリスト(number型)
  const [seLastEndTime, setLastEndTime] = useState(init_state.seLastEndTime)  // 最後に問題を解いたときの時間(Date型)
  // 0: 8bit2進数を10進数に変換する
  // 1: 8bit2進数を10進数に変換する(上位4bitは0)
  // 2: 8bit2進数を10進数に変換する(下位4bitは0)
  const [seQuestionType, setQuestionType] = useState(init_state.seQuestionType);  // 問題の種類
  const [seIsDebug, setIsDebug] = useState(init_state.seIsDebug);  // デバッグモード
  const [seSuccessResult, setSuccessResult] = useState(init_state.seSuccessResult);  // 正解した問題
  const [seFaultResult, setFaultResult] = useState(init_state.seFaultResult);  // 間違えた問題
  const [seQuestionList, setQuestionList] = useState(init_state.seQuestionList);  // 問題のリスト(2進数で保持)
  // historyデータ
  const [allRecHistory_zero, setAllRecHistory_zero] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:0)
  const [allRecHistory_one, setAllRecHistory_one] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:1)
  const [allRecHistory_two, setAllRecHistory_two] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:2)
  const [allRecHistory_three, setAllRecHistory_three] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:3)
  const [allRecHistory_four, setAllRecHistory_four] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:4)
  const [allRecHistory_five, setAllRecHistory_five] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:5)
  const [allRecHistory_six, setAllRecHistory_six] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:6)
  const [allRecHistory_seven, setAllRecHistory_seven] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:7)
  const [allHistory_zero, setAllHistory_zero] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:0)
  const [allHistory_one, setAllHistory_one] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:1)
  const [allHistory_two, setAllHistory_two] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:2)
  const [allHistory_three, setAllHistory_three] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:3)
  const [allHistory_four, setAllHistory_four] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:4)
  const [allHistory_five, setAllHistory_five] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:5)
  const [allHistory_six, setAllHistory_six] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:6)
  const [allHistory_seven, setAllHistory_seven] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:7)
  const [yourRecHistory_zero, setyourRecHistory_zero] = useState(init_yourRecHistory);  // 自分の記録(type:0)
  const [yourRecHistory_one, setyourRecHistory_one] = useState(init_yourRecHistory);  // 自分の記録(type:1)
  const [yourRecHistory_two, setyourRecHistory_two] = useState(init_yourRecHistory);  // 自分の記録(type:2)
  const [yourRecHistory_three, setyourRecHistory_three] = useState(init_yourRecHistory);  // 自分の記録(type:3)
  const [yourRecHistory_four, setyourRecHistory_four] = useState(init_yourRecHistory);  // 自分の記録(type:4)
  const [yourRecHistory_five, setyourRecHistory_five] = useState(init_yourRecHistory);  // 自分の記録(type:5)
  const [yourRecHistory_six, setyourRecHistory_six] = useState(init_yourRecHistory);  // 自分の記録(type:6)
  const [yourRecHistory_seven, setyourRecHistory_seven] = useState(init_yourRecHistory);  // 自分の記録(type:7)

  // useSound
  const [playCor, { stopCor, pauseCor }] = useSound(SoundCorrect);  // 正解の音
  const [playInCor, { stopInCor, pauseInCor }] = useSound(SoundInCorrect);  // 正解の音

  // set initial state
  const setInitState = () => {
    setInNum(init_state.seInNum);
    setCount(init_state.seCount);
    setMaxCount(init_state.seMaxCount);
    setIsGame(init_state.seIsGame);
    // console.log("a")
    // sedone = init_state.seDone;
    // console.log("b")
    setDone(init_state.seDone);
    setQuestion(init_state.seQuestion);
    setIsGood(init_state.seIsGood);
    setIsBad(init_state.seIsBad);
    setStartTime(init_state.seStartTime);
    setEndMinute(init_state.seEndMinute);
    setEndSecond(init_state.seEndSecond);
    setElapsedTime(init_state.seElapsedTime);
    // setQuestionType(init_state.seQuestionType);
    setIsDebug(init_state.seIsDebug);
    // seFaultResult = init_state.seFaultResult;
    setSuccessResult(init_state.seSuccessResult);
    setFaultResult(init_state.seFaultResult);
    // seQuestionList = init_state.seQuestionList
    setQuestionList(init_state.seQuestionList);
  }

  // --debug print state
  const printState = () => {
    console.log("seInNum: " + seInNum);
    console.log("seCount: " + seCount);
    console.log("seMaxCount: " + seMaxCount);
    console.log("seIsGame: " + seIsGame);
    console.log("sedone: " + sedone);
    console.log("seQuestion: " + seQuestion);
    console.log("seIsGood: " + seIsGood);
    console.log("seIsBad: " + seIsBad);
    console.log("seStartTime: " + seStartTime);
    console.log("seEndMinute: " + seEndMinute);
    console.log("seEndSecond: " + seEndSecond);
    console.log("seQuestionType: " + seQuestionType);
    console.log("seIsDebug: " + seIsDebug);
    console.log("seFaultResult: " + seFaultResult);
    console.log("seQuestionList: " + seQuestionList);
  }
  // ---------------------  /state ---------------------


  // ---------------------  context ---------------------
  const { user } = useAuthContext();
  // ---------------------  /context ---------------------


  // ---------------------  use effect  ---------------------
  useEffect(() => {
    // 過去の記録データをセットする
    setHistory();
  }, []);

  useEffect(() => {
    user && setHistory_login(user.uid);
  }, [user])
  // ---------------------  /use effect  ---------------------


  // ---------------------  デザイン  ---------------------
  // --- デフォルトのデザインを加工 ---
  // checkbox
  const TestCheckbox = styled(Checkbox)({
    "&.MuiCheckbox-root": {
        border: ".15em solid rgb(217, 176, 255)", 
        borderRadius: "1em",
        margin: "10px",
    },
    "&.Mui-checked": {
        boxShadow: "0 0 1em .25em rgb(217, 176, 255),0 0 4em 1em rgba(191,123,255,.781),inset 0 0 .75em .25em rgb(217,176,255)", 
    },
    // チェックマークを消す
    "& .MuiSvgIcon-root": {
        display: "none"
    },
})
// button
const TestButton = styled(Button)({
  // --- ネオン系 ---
  border: ".25em solid rgb(217, 176, 255)", // borderの色
  padding: "1em 3em", 
  color: "rgb(217, 176, 255)",  // fontのcolor
  fontSize: "25px", 
  fontWeight: "bold",
  backgroundColor: "rgb(100, 61, 136)", // 背景の色
  borderRadius: "1em",  // 角丸
  outline: "none", 
  // 光る感じ
  boxShadow: "0 0 1em .25em rgb(217, 176, 255),0 0 4em 1em rgba(191,123,255,.781),inset 0 0 .75em .25em rgb(217,176,255)", 
  textShadow: "0 0 .5em rgb(217,176,255)", 
  position: "relative", 
  transition: "all .3s" ,
  // --- 以下 ネオン系以外 ---
  width: "calc(100% / 7)",
  height: "90px",
  // 下との間隔をあける
  marginBottom: isMobile ? "10px" : "50px",
});

// --- それぞれのデザイン定義 ---
  // 数値ボタンのスタイル(active)
  const buttonStyle = {
    width: isMobile ? "70px": "100px",
    height: isMobile ? "70px": "100px",
    // 背景を薄水色にする
    backgroundColor: "#e0ffff",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
  };
  // 数値ボタンのスタイル(disactive)
  const buttonDisStyle = {
    width: isMobile ? "70px": "100px",
    height: isMobile ? "70px": "100px",
    // 背景を薄暗く色にする
    backgroundColor: "#808080",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
  }

  // okボタンのスタイル
  const okButtonStyle = {
    width: "calc(100% / 7)",
    height: "70px",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
    // 上との間隔をあける
    marginTop: "50px",
  };

  // startボタンのスタイル
  const startButtonStyle = {
    width: isMobile ? "130px": "170px",
    height: "70px",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
    marginTop: isMobile ? "15px": "20px",
    // 下との間隔をあける
    marginBottom: isMobile ? "10px" : "20px",
    // 角丸
    borderRadius: "1em",
  };

  // debugボタンのスタイル
  const debugButtonStyle = {
    height: "70px",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
    // 背景をオレンジにする
    backgroundColor: "#ff9900",
    // 上との間隔をあける
    marginTop: "50px",
  };
  // もう一度ボタンのスタイル
  const againButtonStyle = {
    height: "70px",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
    // 右との間隔をあける
    marginRight: "30px",
    // 上との間隔をあける
    marginTop: "50px",
  };

  // inputのスタイル
  const inputStyle = {
    // 背景を薄水色にする
    backgroundColor: "#e0ffff",
    // ボタンの文字を黒にする
    color: "#000000",
    height: "50px",
    marginBottom: "30px",
  };
  const inputStyle_half = {
    // 背景を薄水色にする
    backgroundColor: "#e0ffff",
    // ボタンの文字を黒にする
    color: "#000000",
    height: "50px",
    marginBottom: "30px",
    width: "105px",
  }

  // textのスタイル
  const textStyle = {
    // フォントサイズを大きくする
    fontSize: isMobile ? "20px" : "25px",
    // テキストの色を青にする
    color: "#e0ffff",
    // 下の余白をあける
    marginBottom: "30px",
    marginTop: "10px",
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
  const choiceStyle = {
    // --- ネオン系 ---
    // color: "rgb(217, 176, 255)",
    // textShadow: "0 0 .5em rgb(217,176,255)",
    // --- 以下 ネオン系以外 ---
    // テキストを左寄せにする
    textAlign: "left",
    // 縦に並べる
    flexDirection: "column",
    // 下との間隔をあける
    marginBottom: isMobile ? "10px" : "10px",
    // 青色の枠線
    border: "solid 3px #1976d2",
    padding: "25px",
    width: isMobile ? "77%": "100%",
    // 真ん中に寄せる
    margin: "auto",
  }
  const choiceTitleStyle = {
    marginTop: "10px",
    // 左詰め
    textAlign: "left",
    fontSize: "15px",
    // 左の余白をあける
    marginLeft: "18px",
  }
  const checkStyle = {
    // 丸いチェックボックスにする
    borderRadius: "50%",
  }
  // ---------------------  /デザイン  ---------------------


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


  // 問題を10問ランダムに作成する関数
  const createQuestionList = () => {
    let questionList = [];
    let question = "";
    
    if (seQuestionType === "0") {
      // 0. 2進数を10問作成
      for (let i = 0; i < 10; i++) {
        // 0~255の乱数を作成
        const num = Math.floor(Math.random() * 256);
        // 2進数に変換
        const binary = num.toString(2);
        // 8桁になるように0を追加
        question = binary.padStart(8, "0");
        // 問題のリストに追加
        questionList.push(question);
      }
    }else if (seQuestionType === "1") {
      // 1. 2進数を10問作成(上位4bitは0)
      for (let i = 0; i < 10; i++) {
        // 0~15の乱数を作成
        const num = Math.floor(Math.random() * 16);
        // 2進数に変換
        const binary = num.toString(2);
        // 4桁になるように0を追加
        question = binary.padStart(4, "0");
        // 先頭に0000を追加
        question = "0000".concat(question);
        // 問題のリストに追加
        questionList.push(question);
      }
    }else if (seQuestionType === "2") {
      // 2. 2進数を10問作成(下位4bitは0)
      for (let i = 0; i < 10; i++) {
        // 0~15の乱数を作成
        const num = Math.floor(Math.random() * 16);
        // 2進数に変換
        const binary = num.toString(2);
        // 4桁になるように0を追加
        question = binary.padStart(4, "0");
        // 8桁になるように0を追加
        question = question.concat("0000");
        // 問題のリストに追加
        questionList.push(question);
      }
    }else if (seQuestionType === "3") {
      // 3. 10進数を10問作成
      for (let i = 0; i < 10; i++) {
        // 0~255の乱数を作成
        const num = Math.floor(Math.random() * 256);
        questionList.push(num.toString())
      };
    }else if (seQuestionType === "4") {
      // 4. 10進数を10問作成(2進数変換した際に上位4bitは0)
      for (let i = 0; i < 10; i++) {
        // 0~15の乱数を作成
        const num = Math.floor(Math.random() * 16);
        questionList.push(num.toString())
      };
    }else if (seQuestionType === "5") {
      // 5. 10進数を10問作成(2進数変換した際に下位4bitは0)
      for (let i = 0; i < 10; i++) {
        // 0~15の乱数を作成
        const num = Math.floor(Math.random() * 16);
        // 2進数に変換
        const binary = num.toString(2);
        // 4桁になるように0を追加
        question = binary.padStart(4, "0");
        // 8桁になるように0を追加
        question = question.concat("0000");
        // 2進数を10進数に変換
        question = binaryToDecimal(question);
        questionList.push(question.toString())
      };
    }else if (seQuestionType === "6") {
      // 6. 16進数を10問作成
      for (let i = 0; i < 10; i++) {
        // 0~255の乱数を作成
        const num = Math.floor(Math.random() * 256);
        // 16進数に変換
        const hex = num.toString(16);
        // 大文字にする
        question = hex.toUpperCase();
        // 問題のリストに追加
        questionList.push(question);
      };
    }else if (seQuestionType === "7") {
      // 7. 10進数を10問作成(16進数変換した際に下位4bitは0)
      for (let i = 0; i < 10; i++) {
        // 0~255の乱数を作成
        const num = Math.floor(Math.random() * 256);
        questionList.push(num.toString())
      };
    }
    console.log("作成した問題: ", questionList)

    return questionList;
  }

  // 8bit2進数を10進数に変換する関数
  function binaryToDecimal(binary) {
    return binary.split('').reverse().reduce((acc, curr, index) => {
      return acc + curr * Math.pow(2, index);
    }, 0);
  }

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
  window.onkeydown = function(e){
    if (e.keyCode == 13 & seIsGame === 1 ) {
      okClick();
    }
  }

  // 正答率を計算する関数
  const calcRate = (done, maxCount) => {
    // 正答数を計算
    const goodCount = done.filter((value) => {
      return value;
    }).length;
    // console.log("sedone: , ", done)
    // console.log("good count: ", goodCount)
    // console.log("seMaxCount: ", maxCount)
    // 正答率を計算
    const rate = Math.round(goodCount / maxCount * 100);
    return rate.toString();
  }

  const okClick = () => {
    // 解答が2進数の場合、8桁になるように0を追加
    console.log("seInNum: ", seInNum)
    let correct = seInNum;
    if (seQuestionType === "3") {
      correct = correct.padStart(8, "0");
    }else if (seQuestionType === "4") {
      correct = "0000" + correct;
    }else if(seQuestionType === "5") {
      correct = correct.padStart(4, "0")
      correct = correct + "0000";
    }

    // 1つの問題の解答時間を計測
    const oneEndTime = new Date();
    let newElapsedTime = [];
    if (seElapsedTime.length === 0) {
      // 最初の問題の場合
      newElapsedTime = oneEndTime - seStartTime;
      setElapsedTime([newElapsedTime]);
      setLastEndTime(oneEndTime);
    } else {
      // 2問目以降の場合
      const oneElapsedTime = oneEndTime - seLastEndTime
      newElapsedTime = [...seElapsedTime, oneElapsedTime];
      setElapsedTime(newElapsedTime);
      setLastEndTime(oneEndTime);
    }
    
    // 答えを作成
    let questionStr = "";
    if (seQuestionType === "0" || seQuestionType === "1" || seQuestionType === "2") {
      // 問題を10進数に変換
      const question = binaryToDecimal(seQuestion);
      // questionを文字に変換
      questionStr = question.toString();
    }else if (seQuestionType === "3" || seQuestionType === "4" || seQuestionType === "5") {
      // 問題を2進数に変換
      const question = parseInt(seQuestion, 10).toString(2);
      // 8桁になるように0を追加
      questionStr = question.padStart(8, "0");
    }else if (seQuestionType === "6") {
      // 問題を16進数から10進数に変換
      const question = parseInt(seQuestion, 16).toString(10);
      questionStr = question.toString();
    }else if (seQuestionType === "7") {
      // 問題の10進数を16進数に変換
      const question = parseInt(seQuestion, 10).toString(16);
      questionStr = question.toUpperCase();
    }

    // decimalとquestionが一致したら正解
    let newDone = [];
    console.log("正解: ", correct)
    console.log("解答: ", questionStr)
    console.log("seQuestion: ", seQuestion)
    if (correct === questionStr || correct.toUpperCase() === questionStr) {
      // 正解した問題を配列に追加
      newDone = [...sedone, true];
      setDone(newDone);
      const newSuccessResult = [...seSuccessResult, seQuestion];
      setSuccessResult(newSuccessResult);
      // console.log("正解")
      setIsGood(true);
      // correctの音を鳴らす
      playCor();
    } else {
      // 不正解の場合はfalseを追加
      newDone = [...sedone, false];
      setDone(newDone);
      // 間違えた問題を配列に追加
      const newFaultResult = [...seFaultResult, seQuestion];
      setFaultResult(newFaultResult);
      setIsBad(true);
      // coreectの音を鳴らす
      playInCor();
    }
    // 問題数が最大値に達したらゲーム終了
    if (seCount === seMaxCount) {
      // console.log("game done start")
      setIsGame(2);
      // 計測を終了
      const endTime = new Date();
      // 差分を計算
      const elapsedTime = endTime - seStartTime;
      // console.log("型テスト: ", typeof(elapsedTime))
      // 分、秒、ミリ秒に変換
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);

      setEndMinute(minutes);
      setEndSecond(seconds);
      // 経過時間を出力
      // console.log(`経過時間: ${minutes}分 ${seconds}秒`);

      // 正答数を取得
      const q_correct_num = newDone.filter((value) => {
        return value;
      }).length.toString()
      // DBに記録を保存
      const history_data = {
        'type': seQuestionType.toString(),
        'time': elapsedTime,
        'user_id': user ? user.uid : "NO_LOGIN_USER",
        'q_num': seMaxCount.toString(),
        'q_correct_num': q_correct_num,
        'q_poc': calcRate(newDone, seMaxCount),
        'is_debug': seIsDebug,
      }
      let history_q_data = [];
      for (let i = 0; i < seMaxCount; i++) {
        history_q_data.push({
          "time": newElapsedTime[i],
          "question_id": seQuestionList[i].toString(),
          "is_correct": newDone[i],
        })
      }
      create_history(history_data, history_q_data);
      // console.log("game done end")
    }

    // 問題数を1増やす
    const newCount = seCount + 1
    setCount(newCount);
    // 問題を作成
    setQuestion(seQuestionList[newCount-1]);
    // 入力を初期化
    setInNum("");

    // 2秒後に正解or不正解の表示を消す
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
    // 問題を作成
    const questionList = createQuestionList();
    // console.log("全部の問題: ", questionList)
    setQuestionList(questionList);
    // 最初の問題を設定
    setQuestion(questionList[0]);
    // 10問計測開始
    setStartTime(new Date)
    // get()
  }

  // againClick
  const againClick = () => {
    setInitState();
    // printState();
    // DBから記録を取得
    setHistory();
    user && setHistory_login(user.uid);
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

  // debugボタンをクリックしたときの処理
  const debugClick = () => {
    // console.log("debug")
    // console.log("FaultResult: ", seFaultResult)
    // データを初期化
    setInNum(init_state.seInNum);
    setCount(init_state.seCount);
    // 全回間違えた問題の数
    setMaxCount(seFaultResult.length);
    setIsGame(1);
    setDone(init_state.seDone);
    setStartTime(init_state.seStartTime);
    setEndMinute(init_state.seEndMinute);
    setEndSecond(init_state.seEndSecond);
    setIsDebug(true);
    setFaultResult(init_state.seFaultResult);

    // 問題を作成(前回間違えた問題のみ)
    const new_questionList = seFaultResult
    setQuestionList(new_questionList);

    // 最初の問題を設定
    setQuestion(new_questionList[0]);
    // 測定開始
    setStartTime(new Date)
  }

  // データを取得
  const get = ()=> {
    // データを取得
    const usersCollectionRef = collection(db, 'history');
    getDocs(usersCollectionRef).then((querySnapshot) => {
      // console.log(querySnapshot.docs.map((doc) => doc.data()));
    });
  }

  // 過去のレコード記録を取得してstateに保存する(Loginしてなくて取得できるデータ)
  function setHistory() {
    const user_id = "NO_LOGIN_USER"
    // 1. 全ユーザーのレコード記録を取得
    get_history("all_record", "0", user_id).then((result) => {
      setAllRecHistory_zero(result);
    });
    get_history("all_record", "1", user_id).then((result) => {
      setAllRecHistory_one(result);
    });
    get_history("all_record", "2", user_id).then((result) => {
      setAllRecHistory_two(result);
    });
    get_history("all_record", "3", user_id).then((result) => {
      setAllRecHistory_three(result);
    });
    get_history("all_record", "4", user_id).then((result) => {
      setAllRecHistory_four(result);
    });
    get_history("all_record", "5", user_id).then((result) => {
      setAllRecHistory_five(result);
    });
    get_history("all_record", "6", user_id).then((result) => {
      setAllRecHistory_six(result);
    });
    get_history("all_record", "7", user_id).then((result) => {
      setAllRecHistory_seven(result);
    });
    // 2. 全ユーザーの直近の記録を取得
    get_history("all", "0", user_id).then((result) => {
      setAllHistory_zero(result);
    });
    get_history("all", "1", user_id).then((result) => {
      setAllHistory_one(result);
    });
    get_history("all", "2", user_id).then((result) => {
      setAllHistory_two(result);
    });
    get_history("all", "3", user_id).then((result) => {
      setAllHistory_three(result);
    });
    get_history("all", "4", user_id).then((result) => {
      setAllHistory_four(result);
    });
    get_history("all", "5", user_id).then((result) => {
      setAllHistory_five(result);
    });
    get_history("all", "6", user_id).then((result) => {
      setAllHistory_six(result);
    });
    get_history("all", "7", user_id).then((result) => {
      setAllHistory_seven(result);
    });
  }

  // 過去のレコード記録を取得してstateに保存する(Loginして取得できるデータ)
  function setHistory_login(user_id) {
    // 3. 自分の記録を取得
    if (user_id !== "NO_LOGIN_USER") {
      get_history("your_record", "0", user_id).then((result) => {
        setyourRecHistory_zero(result);
      });
      get_history("your_record", "1", user_id).then((result) => {
        setyourRecHistory_one(result);
      });
      get_history("your_record", "2", user_id).then((result) => {
        setyourRecHistory_two(result);
      });
      get_history("your_record", "3", user_id).then((result) => {
        setyourRecHistory_three(result);
      });
      get_history("your_record", "4", user_id).then((result) => {
        setyourRecHistory_four(result);
      });
      get_history("your_record", "5", user_id).then((result) => {
        setyourRecHistory_five(result);
      });
      get_history("your_record", "6", user_id).then((result) => {
        setyourRecHistory_six(result);
      });
      get_history("your_record", "7", user_id).then((result) => {
        setyourRecHistory_seven(result);
      });   
    }
    }

  // DBテスト関数(create)
  const testDB_create = (event)=> {
    get_sequence("STATIC");
  }

  const testRow = [
    {rank: 1, name: "hoge", time: "30", update_time: "2021/10/10"},
    {rank: 2, name: "hoge", time: "30", update_time: "2021/10/10"},
    {rank: 3, name: "hoge", time: "30", update_time: "2021/10/10"},
    {rank: 4, name: "hoge", time: "30", update_time: "2021/10/10"},
  ]
  // tableのスタイル
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: blue[700],
      color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const tableStyle = {
    // スマホの時縦並びにする
    flexDirection: isMobile ? "column" : "row",
    width: isMobile ? "90%": "90%",

    // 横並びにする
    display: "flex",
    // 中央に寄せる
    justifyContent: "center",
    // 右の余白をあける
    marginRight: isMobile ? "0px" : "100px" ,
    // 上の余白をあける
    marginTop: "30px",
    // 間隔をあける
    gap: isMobile ? "30px" : "60px",
  }
  const tableTitleStyle_1 = {
    // 左図に寄せる
    textAlign: "left",
    // 左の余白をあける
    marginLeft: "5px",
    // フォントを小さくする
    fontSize: "15px",
    color: "#ff0000"
  }
  const tableTitleStyle_2 = {
    // 左図に寄せる
    textAlign: "left",
    // 左の余白をあける
    marginLeft: "5px",
    // フォントを小さくする
    fontSize: "15px",
  }

  const tableTitleStyle_3 = {
    // 左図に寄せる
    textAlign: "left",
    // 左の余白をあける
    marginLeft: "5px",
    // フォントを小さくする
    fontSize: "15px",
    // 白色にする
    color: "#ffffff",
  }
  const sampleStyle = {
    // 左詰め
    textAlign: "left",
     // 青色の枠線
    border: "solid 3px #1976d2",
    padding: "15px",
    fontSize: "15px",
    width: isMobile ? "83%": "102.5%",
    // 真ん中に寄せる
    margin: "auto",
  }
  const sampleTitleStyle = {
    // 左詰め
    textAlign: "left",
    fontSize: "15px",
    // 左の余白をあける
    marginLeft: "18px",
  }

  // test
  const testDB_read = ()=> {

  }

  return (
      <>
        {/* PCの時スクロール禁止 */}
        {(!isMobile) && <DisableScroll />}
        {/* ゲーム開始前の時 */}
        {seIsGame === 0 &&
        <>
          <Box>
            {/* 問題の選択 */}
            <Box style={choiceTitleStyle}>問題選択</Box>
            <Box style={choiceStyle}>
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "0"} onChange={() => setQuestionType("0")} name="checkedA"/>}
                  label={GAME_INFO["0"]["q_choice_text"]}
                />
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "1"} onChange={() => setQuestionType("1")} name="checkedA" />}
                  label={GAME_INFO["1"]["q_choice_text"]}
                />
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "2"} onChange={() => setQuestionType("2")} name="checkedA" />}
                  label={GAME_INFO["2"]["q_choice_text"]}
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "3"} onChange={() => setQuestionType("3")} name="checkedA"/>}
                  label={GAME_INFO["3"]["q_choice_text"]}
                />
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "4"} onChange={() => setQuestionType("4")} name="checkedA" />}
                  label={GAME_INFO["4"]["q_choice_text"]}
                />
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "5"} onChange={() => setQuestionType("5")} name="checkedA" />}
                  label={GAME_INFO["5"]["q_choice_text"]}
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "6"} onChange={() => setQuestionType("6")} name="checkedA"/>}
                  label={GAME_INFO["6"]["q_choice_text"]}
                />
                <FormControlLabel
                  control={<Checkbox checked={seQuestionType === "7"} onChange={() => setQuestionType("7")} name="checkedA" />}
                  label={GAME_INFO["7"]["q_choice_text"]}
                />
              </Box>
            </Box>
            {/* 例題 */}
            <Box>
              <Box style={sampleTitleStyle}>出題例</Box>
              <Box style={sampleStyle}>
                <Box>問題:  {GAME_INFO[seQuestionType]["ex_question"]}</Box>
                <Box>解答:  {GAME_INFO[seQuestionType]["ex_answer"]}</Box>
              </Box>
            </Box>
          </Box>
          <Button variant="contained" style={startButtonStyle} onClick={startClick}>GAME START</Button>
          {/* テスト用ボタン */}
          {/* <Button onClick={testDB_read}>DB read</Button> */}
          {/* hisotryList */}
          <Box style={tableStyle}>
          {/* 全ユーザーのレコード記録 */}
          <Box>
            <Box style={tableTitleStyle_1}>全ユーザーのレコード記録(正答率100%のみ)</Box>
            <TableContainer component={Paper}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center">順位</StyledTableCell>
                      <StyledTableCell align="center">名前</StyledTableCell>
                      <StyledTableCell align="center">タイム</StyledTableCell>
                      <StyledTableCell align="center">記録日</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* type=0の時 */}
                    {seQuestionType === "0" &&
                      allRecHistory_zero.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=1の時 */}
                    {seQuestionType === "1" &&
                      allRecHistory_one.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=2の時 */}
                    {seQuestionType === "2" &&
                      allRecHistory_two.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=3の時 */}
                    {seQuestionType === "3" &&
                      allRecHistory_three.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=4の時 */}
                    {seQuestionType === "4" &&
                      allRecHistory_four.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=5の時 */}
                    {seQuestionType === "5" &&
                      allRecHistory_five.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=6の時 */}
                    {seQuestionType === "6" &&
                      allRecHistory_six.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                    {/* type=7の時 */}
                    {seQuestionType === "7" &&
                      allRecHistory_seven.map((row) => (
                        // 1位の時は色を変える
                        (row.rank==="1") ? 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.rank}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.name}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.time}</StyledTableCell>
                            <StyledTableCell align="center" style={{color: "#ff0000", fontWeight: "bold"}}>{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                        : 
                          <StyledTableRow key={row.rank}>
                            <StyledTableCell align="center">{row.rank}</StyledTableCell>
                            <StyledTableCell align="center">{row.name}</StyledTableCell>
                            <StyledTableCell align="center">{row.time}</StyledTableCell>
                            <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                          </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* すべてのユーザーの直近10件のhistory */}
            <Box>
              <Box style={tableTitleStyle_2}>全ユーザーの直近の記録</Box>
              <TableContainer component={Paper}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center">名前</StyledTableCell>
                      <StyledTableCell align="center">タイム</StyledTableCell>
                      <StyledTableCell align="center">正答率</StyledTableCell>
                      <StyledTableCell align="center">記録日</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* type=0の時 */}
                    {seQuestionType === "0" &&
                      allHistory_zero.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=1の時 */}
                    {seQuestionType === "1" &&
                      allHistory_one.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      )) 
                    }
                    {/* type=2の時 */}
                    {seQuestionType === "2" &&
                      allHistory_two.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=3の時 */}
                    {seQuestionType === "3" &&
                      allHistory_three.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=4の時 */}
                    {seQuestionType === "4" &&
                      allHistory_four.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=5の時 */}
                    {seQuestionType === "5" &&
                      allHistory_five.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=6の時 */}
                    {seQuestionType === "6" &&
                      allHistory_six.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=7の時 */}
                    {seQuestionType === "7" &&
                      allHistory_seven.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* ログインアカウントのhistory */}
            <Box>
              <Box style={tableTitleStyle_3}>あなたのレコード記録(正答率100%のみ)</Box>
              <TableContainer component={Paper}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center">順位</StyledTableCell>
                      <StyledTableCell align="center">タイム</StyledTableCell>
                      <StyledTableCell align="center">記録日</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* type=0の時 */}
                    {seQuestionType === "0" &&
                      yourRecHistory_zero.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=1の時 */}
                    {seQuestionType === "1" &&
                      yourRecHistory_one.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=2の時 */}
                    {seQuestionType === "2" &&
                      yourRecHistory_two.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=3の時 */}
                    {seQuestionType === "3" &&
                      yourRecHistory_three.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=4の時 */}
                    {seQuestionType === "4" &&
                      yourRecHistory_four.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=5の時 */}
                    {seQuestionType === "5" &&
                      yourRecHistory_five.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=6の時 */}
                    {seQuestionType === "6" &&
                      yourRecHistory_six.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=7の時 */}
                    {seQuestionType === "7" &&
                      yourRecHistory_seven.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

        </>}
        {/* ゲーム中の時 */}
        {seIsGame === 1 &&
          <Box>
          <Box style={textStyle}>{GAME_INFO[seQuestionType]["q_text"]}</Box>
          <Box fontSize="midium" mb="20px">{seCount}問目</Box>
          <Box mb={3}> 
            {/* 問題が2進数の場合 */}
            {
              (seQuestionType === "0" || seQuestionType === "1" || seQuestionType === "2") &&
                seQuestion[0]+seQuestion[1]+seQuestion[2]+seQuestion[3]+","
                +seQuestion[4]+seQuestion[5]+seQuestion[6]+seQuestion[7] + " -> "
            }
            {/* 問題が10進数の場合 */}
            {
              (seQuestionType === "3" || seQuestionType === "4" || seQuestionType === "5" || seQuestionType === "7") &&
                seQuestion + " -> "
            }
            {/* 問題が16進数の場合 */}
            {
              (seQuestionType === "6") &&
                "0x" + seQuestion + " -> "
            }
            {/* --- 入力 --- */}
            {/* 解答が2進数の場合 */}
            {
              seQuestionType === "3" &&
                <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle}/>
            }
            {/* 解答が2進数(上位4bit固定の場合) */}
            {
              seQuestionType === "4" &&
                <>
                  0000,
                  <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle_half}/>
                </>

            }
            {/* 問題が2進数(下位4bit固定の場合) */}
            {
              seQuestionType === "5" &&
                <>
                  <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle_half}/>
                  ,0000
                </>
            }
            {/* 問題が10進数 */}
            {
              (seQuestionType === "0" || seQuestionType === "1" || seQuestionType === "2" || seQuestionType === "6") &&
                <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle}/>
            }
            {/* 問題が16進数 */}
            {
              seQuestionType === "7" &&
                <>
                  0x
                  <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle_half}/>
                </>
            }
            {/* 削除ボタン */}
            <IconButton onClick={deleteClick} aria-label="delete" color="primary">
              <DeleteIcon fontSize="large"/>
            </IconButton>
          </Box>
          {/* --- 数値ボタン 真ん中に配置 --- */}
          {/* 解答が2進数の場合 */}
          {
            (seQuestionType === "3" || seQuestionType === "4" || seQuestionType === "5") &&
              <>
                <Box display="flex" flexWrap="wrap">
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>0</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>1</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>2</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>3</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>4</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>5</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>6</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>7</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>8</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>9</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>A</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>B</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>C</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>D</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>E</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>F</Button>
                </Box>
              </>
          }
          {/* 解答が10進数の場合 */}
          {
            (seQuestionType === "0" || seQuestionType === "1" || seQuestionType === "2" || seQuestionType === "6") &&
              <>
                <Box display="flex" flexWrap="wrap">
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>0</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>1</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>2</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>3</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>4</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>5</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>6</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>7</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>8</Button>
                  <Button variant="contained" style={buttonStyle} onClick={btnClick}>9</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>A</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>B</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>C</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>D</Button>
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>E</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                  <Button disabled variant="contained" style={buttonDisStyle} onClick={btnClick}>F</Button>
                </Box>
              </>
          }
          {/* 解答が16進数の場合 */}
          {
            seQuestionType === "7" &&
            <>
              <Box display="flex" flexWrap="wrap">
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>0</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>1</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>2</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>3</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>4</Button>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>5</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>6</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>7</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>8</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>9</Button>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>A</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>B</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>C</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>D</Button>
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>E</Button>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Button variant="contained" style={buttonStyle} onClick={btnClick}>F</Button>
              </Box>
            </>
          }
          {/* okボタン */}
          <Button
            variant="contained" disabled={seIsGame !== 1} style={okButtonStyle} onClick={okClick}>ok</Button>
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
          <Box style={textStyle}>正答率: {calcRate(sedone, seMaxCount)}%</Box>
          <Box style={textStyle}>経過時間: {seEndMinute}分{seEndSecond}秒</Box>

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
          <Box>
            <Button variant="contained" style={againButtonStyle} onClick={againClick}>戻る</Button>
            {
              (seFaultResult.length !== 0) &&
              <Button  variant="contained" style={debugButtonStyle} onClick={debugClick}>間違えた問題</Button>
            }
          </Box>
        </>
        }
      </>
  )
}