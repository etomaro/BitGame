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


// 8bit2進数を10進数に変換する関数
function binaryToDecimal(binary) {
  return binary.split('').reverse().reduce((acc, curr, index) => {
    return acc + curr * Math.pow(2, index);
  }, 0);
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
export const QandA = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

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
    "seQuestionType": 0,
    "seIsDebug": false,
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
    {"rank": "1", "name": "a", "time": "", "poc": "", "update_time": ""},
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
  // 0: 8bit2進数を10進数に変換する
  // 1: 8bit2進数を10進数に変換する(上位4bitは0)
  // 2: 8bit2進数を10進数に変換する(下位4bitは0)
  const [seQuestionType, setQuestionType] = useState(init_state.seQuestionType);  // 問題の種類
  const [seIsDebug, setIsDebug] = useState(init_state.seIsDebug);  // デバッグモード
  const [seFaultResult, setFaultResult] = useState(init_state.seFaultResult);  // 間違えた問題
  const [seQuestionList, setQuestionList] = useState(init_state.seQuestionList);  // 問題のリスト
  // historyデータ
  const [allRecHistory_zero, setAllRecHistory_zero] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:0)
  const [allRecHistory_one, setAllRecHistory_one] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:1)
  const [allRecHistory_two, setAllRecHistory_two] = useState(init_allRecHistory);  // 全ユーザーのレコード記録(type:2)
  const [allHistory_zero, setAllHistory_zero] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:0)
  const [allHistory_one, setAllHistory_one] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:1)
  const [allHistory_two, setAllHistory_two] = useState(init_allHistory);  // 全ユーザーの直近の記録(type:2)
  const [yourRecHistory_zero, setyourRecHistory_zero] = useState(init_yourRecHistory);  // 自分の記録(type:0)
  const [yourRecHistory_one, setyourRecHistory_one] = useState(init_yourRecHistory);  // 自分の記録(type:1)
  const [yourRecHistory_two, setyourRecHistory_two] = useState(init_yourRecHistory);  // 自分の記録(type:2)

  // useSound
  const [playCor, { stopCor, pauseCor }] = useSound(SoundCorrect);  // 正解の音
  const [playInCor, { stopInCor, pauseInCor }] = useSound(SoundInCorrect);  // 正解の音

  // context 
  const { user } = useAuthContext();

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
    setQuestionType(init_state.seQuestionType);
    setIsDebug(init_state.seIsDebug);
    // seFaultResult = init_state.seFaultResult;
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

  // use effect
  useEffect(() => {
    // 過去の記録データをセットする
    setHistory();
  }, []);

  useEffect(() => {
    user && setHistory_login(user.uid);
  }, [user])

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
    // 上との間隔をあける
    marginTop: "50px",
  };

  // startボタンのスタイル
  const startButtonStyle = {
    width: "calc(100% / 7)",
    height: "70px",
    // ボーダーを黒色にする
    border: "solid 1px #000000",
    // ボタンの文字を黒にする
    color: "#000000",
    // 下との間隔をあける
    marginBottom: isMobile ? "10px" : "50px",
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
  // textのスタイル
  const textStyle = {
    // フォントサイズを大きくする
    fontSize: "25px",
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
    // テキストを左寄せにする
    textAlign: "left",
    // 縦に並べる
    flexDirection: "column",
    // 下との間隔をあける
    marginBottom: isMobile ? "30px" : "50px",

  }



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
  // 問題を10問ランダムに作成する関数
  const createQuestionList = () => {
    let questionList = [];
    let question = "";
    
    if (seQuestionType === 0) {
      // 10回ループ 
      for (let i = 0; i < 10; i++) {
        // 8bit2進数を10進数に変換する
        // 0~255の乱数を作成
        const num = Math.floor(Math.random() * 256);
        // 2進数に変換
        const binary = num.toString(2);
        // 8桁になるように0を追加
        question = binary.padStart(8, "0");
        // 問題のリストに追加
        questionList.push(question);
      }
    }else if (seQuestionType === 1) {
      for (let i = 0; i < 10; i++) {
        // 8bit2進数を10進数に変換する(上位4bitは0)
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
    }else if (seQuestionType === 2) {
      for (let i = 0; i < 10; i++) {
        // 8bit2進数を10進数に変換する(下位4bitは0)
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
    };

    return questionList;
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
  const okClick = () => {
    // console.log(`ok button click!\nsecount: ${seCount}\nseMaxCount: ${seMaxCount}`)
    // 問題を10進数に変換
    const question = binaryToDecimal(seQuestion);
    // questionを文字に変換
    const questionStr = question.toString();
    // decimalとquestionが一致したら正解
    if (seInNum === questionStr) {
      // 正解した問題を配列に追加
      setDone([...sedone, true]);
      // console.log("正解")
      setIsGood(true);
      // correctの音を鳴らす
      playCor();
    } else {
      // 不正解の場合はfalseを追加
      setDone([...sedone, false]);
      // 間違えた問題を配列に追加
      setFaultResult([...seFaultResult, seQuestion]);
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
      // 分、秒、ミリ秒に変換
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);

      setEndMinute(minutes);
      setEndSecond(seconds);
      // 経過時間を出力
      // console.log(`経過時間: ${minutes}分 ${seconds}秒`);

      // 正答数を取得
      const q_correct_num = sedone.filter((value) => {
        return value;
      }).length.toString()
      // DBに記録を保存
      const data = {
        'type': seQuestionType.toString(),
        'time': elapsedTime,
        'user_id': user ? user.uid : "NO_LOGIN_USER",
        'q_num': seMaxCount.toString(),
        'q_correct_num': q_correct_num,
        'q_poc': calcRate().toString(),
        'is_debug': seIsDebug,
      }
      create_history(data);

      // console.log("game done end")
    }

    // 問題数を1増やす
    setCount(seCount + 1);
    // 問題を作成
    setQuestion(seQuestionList[seCount-1]);
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
    // 問題を作成
    const questionList = createQuestionList();
    setQuestionList(questionList);
    // 最初の問題を設定
    setQuestion(questionList[0]);
    // 計測開始
    setStartTime(new Date)
    // get()
  }

  // againClick
  const againClick = () => {
    setInitState();
    // printState();
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
    }
    }

  // DBテスト関数(create)
  const testDB_create = (event)=> {
    get_sequence();
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
    // 横並びにする
    display: "flex",
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
          {/* 問題の選択 */}
          <Box style={choiceStyle}>
            <FormControlLabel
              control={<Checkbox checked={seQuestionType === 0} onChange={() => setQuestionType(0)} name="checkedA" />}
              label="2進数 -> 10進数"
            />
            <FormControlLabel
              control={<Checkbox checked={seQuestionType === 1} onChange={() => setQuestionType(1)} name="checkedA" />}
              label="2進数 -> 10進数(上位4bitは0)"
            />
            <FormControlLabel
              control={<Checkbox checked={seQuestionType === 2} onChange={() => setQuestionType(2)} name="checkedA" />}
              label="2進数 -> 10進数(下位4bitは0)"
            />
          </Box>
          <Button variant="contained" style={startButtonStyle} onClick={startClick}>GAME START</Button>
          {/* テスト用ボタン */}
          <Button onClick={testDB_read}>DB read</Button>
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
                    {seQuestionType === 0 &&
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
                    {seQuestionType === 1 &&
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
                    {seQuestionType === 2 &&
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
                    {seQuestionType === 0 &&
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
                    {seQuestionType === 1 &&
                      allHistory_one.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.poc}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      )) 
                    }
                    {/* type=0の時 */}
                    {seQuestionType === 2 &&
                      allHistory_two.map((row) => (
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
              <Box style={tableTitleStyle_2}>あなたのレコード記録(正答率100%のみ)</Box>
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
                    {seQuestionType === 0 &&
                      yourRecHistory_zero.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=1の時 */}
                    {seQuestionType === 1 &&
                      yourRecHistory_one.map((row) => (
                        <StyledTableRow key={row.rank}>
                          <StyledTableCell align="center">{row.rank}</StyledTableCell>
                          <StyledTableCell align="center">{row.time}</StyledTableCell>
                          <StyledTableCell align="center">{row.update_time}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                    {/* type=2の時 */}
                    {seQuestionType === 2 &&
                      yourRecHistory_two.map((row) => (
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
          <Box style={textStyle}>2進数を10進数に変えてください</Box>
          <Box fontSize="midium" mb="20px">{seCount}問目</Box>
          <Box mb={3}> 
            {seQuestion[0]+seQuestion[1]+seQuestion[2]+seQuestion[3]+","
              +seQuestion[4]+seQuestion[5]+seQuestion[6]+seQuestion[7]} ->
            {/* 入力 */}
            <TextField autoFocus={isMobile ? false : true} onChange={inputChange} id="standard-basic" value={seInNum} style={inputStyle}/>
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
          <Box style={textStyle}>正答率: {calcRate()}%</Box>
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
            <Button variant="contained" style={againButtonStyle} onClick={againClick}>もう一度</Button>
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