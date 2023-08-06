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
import black_stone_40 from '../assets/black_stone_40.png';
import black_stone_80 from '../assets/black_stone_80.png';
import white_stone_40 from '../assets/white_stone_40.png';
import white_stone_80 from '../assets/white_stone_80.png';
import red_stone_40 from '../assets/red_stone_40.png';
import red_stone_80 from '../assets/red_stone_80.png';
import { Icon, Select } from '@mui/material';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';


const initBoard = () => {
    return [...Array(8)].map(() => [...Array(8)].map(() => "."))
}
const initGameInfo = {
    "board": initBoard(),
    "action_player_id": "",
    "is_game_over": false,
    "win_player": "",
    "turn": 0,
    "white_count": 0,
    "black_count": 0,
}


export const Othello = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    // state
    const [aiModel, setAiModel] = useState([])
    const [selectedAiModel, setSelectedAiModel] = useState("")
    const [errorTxt, setErrorTxt] = useState("")
    const [playerId, setPlayerId] = useState("1")  // 1: 先行, 0: 後攻

    const [gameInfo, setGameInfo ] = useState(initGameInfo)
    const [actionables, setActionables] = useState([])  // 置ける場所のリスト

    const [stateId, setStateId] = useState("0")  // 0:ゲーム開始前, 1:ゲーム中

    const url = "https://api-bitgame.onrender.com/othello"
    const black_stone = isMobile ? black_stone_40 : black_stone_80
    const white_stone = isMobile ? white_stone_40 : white_stone_80
    const red_stone = isMobile ? red_stone_40 : red_stone_80

    // --useEffect-- //
    useEffect(() => {
        // aiモデルを取得
        axios({
            method: 'get',
            url: url+'/models',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
        .then((res) => {
            console.log(res.data)
            // AIモデルをセット
            setAiModel(res.data.model)
            setSelectedAiModel(res.data.model[0])
        })
        .catch((error) => {
            setErrorTxt(error)
        })

        // オセロの初期状態を取得
        axios({
            method: 'get',
            url: url+'/start',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
        .then((res) => {
            console.log(res.data)
            // ゲーム情報をセット
            setGameInfo(res.data.game_info)
            setActionables(res.data.actionables)
        })
        .catch((error) => {
            setErrorTxt(error)
        })

    }, [])

    const cellStyle = {
        // 背景をオレンジにする
        backgroundColor: "green",
        width: isMobile ? "40px" : "80px",
        height: isMobile ? "40px" : "80px",
        padding: "0px",
        margin: "0px",
        border:"1px solid black"
      };
    const cellIndexStyle = {
        // 背景をオレンジにする
        backgroundColor: "#1976D2",
        width: isMobile ? "40px" : "80px",
        height: isMobile ? "40px" : "80px",
        padding: "0px",
        margin: "0px",
        border:"1px solid black"
    }
    const cellInfoStyle = {
        fontSize: isMobile ? "14px" : "18px",
        fontWeight: "bold",
        color: "white",
        borderBottom:"2px solid #1976D2"
    }
    const cellInfoWinStyle = {
        fontSize: "14px",
        fontWeight: "bold",
        color: "red",
        borderBottom:"2px solid #1976D2"
    }
    const cellEmptyStyle = {
        border: "0px"
    }
    const rowStyle = {
        padding: "0px",
        margin: "0px",
    }
    const buttonStyle = {
        zIndex: 99,
        width: "100%",
        height: "100%",
        padding: "0px",
        margin: "0px",
    }
    const stoneStyle = {
        zIndex: 1,
        padding: "0px",
        margin: "0px",
        width: "100%",
        height: "100%",

    }
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
    const mainStyle = {
        marginTop: "5%",
        display: !isMobile && "flex",
        width: "100%",
    }
    const gameStyle = {
        width: isMobile ? "100%" : "60%",
        // 要素を中央に寄せる
        display: "flex",
        justifyContent: "center",

    }
    const settingStyle = {
        width: isMobile ? "100%" : "20%",
        marginTop: isMobile && "30px"
    }
    const gameStart = () => {
        setStateId("1")
        // 後攻の時はAIのactionを呼ぶ
        if (playerId !== gameInfo["action_player_id"]) {
            aiAction(gameInfo)
        }
        
    }

    const action = (action) => {
        // actionを送信
        axios({
            method: 'post',
            url: url+'/action',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            data: {
                "game_info": gameInfo,
                "action": action,
                "is_back_action": false,
                "action_model": selectedAiModel,
            }
        })
        .then((res) => {
            console.log(res.data)
            const new_game_info = res.data.game_info
            const new_actionables = res.data.actionables
            // ゲーム情報をセット
            setGameInfo(new_game_info)
            setActionables(new_actionables)
            
            if (new_game_info["is_game_over"]) {
                // ゲーム終了
                console.log("ゲーム終了")
                return
            }

            // ループ
            let now_action_player_id = res.data.game_info["action_player_id"]
            if (now_action_player_id !== playerId) {
                // AIのaction
                console.log("AIのaction: ", new_game_info)
                aiAction(new_game_info)
            }
            
        })
        .catch((error) => {
            setErrorTxt(error)
        })
    }

    const aiAction = (argGameInfo) => {
        console.log("called aiAction func")
        // actionを送信
        axios({
            method: 'post',
            url: url+'/action',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            data: {
                "game_info": argGameInfo,
                "action": [],
                "is_back_action": true,
                "action_model": selectedAiModel,
            }
        })
        .then((res) => {
            console.log(res.data)
            const new_game_info = res.data.game_info
            const new_actionables = res.data.actionables
            // ゲーム情報をセット
            setGameInfo(new_game_info)
            setActionables(new_actionables)
            
            if (new_game_info["is_game_over"]) {
                // ゲーム終了
                console.log("ゲーム終了")
                return
            }

            // ループ
            let now_action_player_id = res.data.game_info["action_player_id"]
            if (now_action_player_id !== playerId) {
                // AIのaction
                aiAction(new_game_info)
            }
            
        })
        .catch((error) => {
            setErrorTxt(error)
        })
    }


    const settingComponent = () => {
        return (
            <>
            {/* ゲームの設定 */}
            <Box style={{marginBottom: isMobile ? "20px" : "40px"}}>
                <label>ゲームの設定</label>
            </Box>
            {/* 先行か後攻かの選択 */}
            <Box style={{marginBottom: "10px"}}>
                <FormControlLabel
                  control={<Checkbox checked={playerId==="1"} onChange={() => setPlayerId("1")} name="checkedA"/>}
                  label={"先行(黒)"}
                />
                <FormControlLabel
                  control={<Checkbox checked={playerId==="0"} onChange={() => setPlayerId("0")} name="checkedA"/>}
                  label={"後攻(白)"}
                />
            </Box>
                {/* AIモデルの選択 */}
            <Box>
                <label style={{fontSize: "18px", marginRight: "20px"}}>AIモデルの選択</label>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedAiModel}
                    label="aiModel"
                    style={{backgroundColor: "orange"}}
                    onChange={(e) => setSelectedAiModel(e.target.value)}
                >
                    {
                        aiModel.map((model) => {
                            return (
                                <MenuItem value={model}>{model}</MenuItem>
                            )
                        })
                    }
                </Select>
            </Box>
            {/* ゲーム開始ボタン */}
            <Box style={{fontSize: "17px", marginTop: isMobile ? "15px" : "30px"}}>
                <Button variant="contained" style={startButtonStyle} onClick={gameStart}>ゲーム開始</Button>
            </Box>
            </>
        )
    }
    const gameInfoComponent = () => {
        return (
            <>
                {/* ゲームの情報 */}
                <Box style={{marginBottom: isMobile ? "20px" : "40px"}}>
                    <label>ゲーム情報</label>
                </Box>
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableBody>
                            {/* ターン */}
                            <TableRow>
                               <TableCell align="center" style={cellInfoStyle}>ターン</TableCell>
                               <TableCell align="center" style={cellInfoStyle}>{gameInfo["turn"]}</TableCell>
                            </TableRow>
                            {/* あなたの手番 */}
                            <TableRow>
                               <TableCell align="center" style={cellInfoStyle}>あなたの手番</TableCell>
                               <TableCell align="center" style={cellInfoStyle}>{playerId === "1" ? "先行(黒)" : "後攻(白)"}</TableCell>
                            </TableRow>
                            {/* 黒石の数 */}
                            <TableRow>
                               <TableCell align="center" style={cellInfoStyle}>黒石の数</TableCell>
                               <TableCell align="center" style={cellInfoStyle}>{gameInfo["black_count"]}</TableCell>
                            </TableRow>
                            {/* 白石の数 */}
                            <TableRow>
                               <TableCell align="center" style={cellInfoStyle}>白石の数</TableCell>
                               <TableCell align="center" style={cellInfoStyle}>{gameInfo["white_count"]}</TableCell>
                            </TableRow>
                            {/* 勝者 */}
                            {
                                gameInfo["is_game_over"] &&
                                <>
                                {
                                    !isMobile && 
                                        <TableRow>
                                            <TableCell align="center" style={cellEmptyStyle}></TableCell>
                                            <TableCell align="center" style={cellEmptyStyle}></TableCell>
                                        </TableRow>
                                }
                                <TableRow>
                                    <TableCell align="center" style={cellInfoWinStyle}>勝者</TableCell>
                                    <TableCell align="center" style={cellInfoWinStyle}>{gameInfo["win_player"]===playerId ? "あなた" : "AI"}</TableCell>
                                </TableRow>
                                    </>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
        }

    const gameComponent = () => { 
        return (
            // 8*8のボードを作る
            <Box>
                <TableContainer component={Paper} style={{width: isMobile ? "370px" : "730px"}}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow style={rowStyle}>
                                <TableCell style={cellIndexStyle}> </TableCell>
                                <TableCell align="center" style={cellIndexStyle}>0</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>1</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>2</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>3</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>4</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>5</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>6</TableCell>
                                <TableCell align="center" style={cellIndexStyle}>7</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                [...Array(8)].map((_, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell align="center" style={cellIndexStyle}>{i}</TableCell>
                                            {
                                                [...Array(8)].map((_, j) => {
                                                    return (
                                                        <TableCell align="center" style={cellStyle}>
                                                            {/* 白の石 */}
                                                            {gameInfo["board"][i][j] == "0" &&
                                                                <IconButton style={buttonStyle} disabled={true}> 
                                                                    <img src={white_stone} style={stoneStyle}></img>
                                                                </IconButton>
                                                            }
                                                            {/* 黒の石 */}
                                                            {gameInfo["board"][i][j] == "1" && 
                                                                <IconButton style={buttonStyle} disabled={true}> 
                                                                    <img src={black_stone} style={stoneStyle}></img>
                                                                    </IconButton>
                                                            }
                                                            {/* 置ける場所 */}
                                                            {
                                                                stateId === "1" &&
                                                                    actionables.some(subArray => subArray.every((value, index) => value === [i, j][index])) &&
                                                                        <IconButton style={buttonStyle} onClick={()=>action([i, j])}> 
                                                                            <img src={red_stone} style={stoneStyle}></img>
                                                                        </IconButton>
                                                            }
                                                        </TableCell>
                                                    )
                                                })
                                            }
                                        </TableRow>
                                    )
                                }
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>                  
        )
    }

  return (
      <>
        <Box>{errorTxt}</Box>
        <Box style={mainStyle}>
            <Box style={gameStyle}>
                {gameComponent()}
            </Box>
            <Box style={settingStyle}>
                {/* ゲーム開始前 */}
                {stateId === "0" && settingComponent()}
                {/* ゲーム中 */} 
                {stateId === "1" && gameInfoComponent()}
            </Box>
        </Box>
      </>
  )
}