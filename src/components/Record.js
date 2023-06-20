import logo from '../logo.svg';
import '../App.css';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Link, useNavigate, Redirect } from 'react-router-dom';
import React from 'react';
import { styled } from '@mui/material/styles';
import Checkbox from "@mui/material/Checkbox";
import { pink } from '@mui/material/colors';
import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { get_history_user } from '../table/history_table';
import { useAuthContext } from '../contexts/AuthContext';
import { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export const Record = () => {

    
    // state
    const [seRows, setRows] = useState([]);
    const [seNonRows, setNonRows] = useState([]);

    // context 
    const { user } = useAuthContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    useEffect(() => {
        user && get_history_user(user.uid).then((response) => {
            const arr = dataForm(response);
            const data = arr[0];
            const non_data = arr[1];
            console.log("data: ", data)
            console.log("non_data: ", non_data)
            setRows(data);
            setNonRows(non_data);
        });
      }, [user])

    const dataForm = (response) => {
        // {"1(id)": {"id": 1, "decimal": "1", "binary": "", "poc": [], "numOfAnswer": [], "averageTime": []}}
        let data = {};  // 解答積み
        let non_data = [];  // 解答なし

        // 平均タイム、正答率、解答回数を計算
        response.forEach((doc) => {
            if (doc.question_id in data) {
                data[doc.question_id]["poc"].push(doc.is_correct);
                data[doc.question_id]["numOfAnswer"] += 1;
                data[doc.question_id]["averageTime"].push(doc.time);
            }else{
                data[doc.question_id] = {
                    "id": doc.question_id,
                    "decimal": doc.question_id,
                    "binary": decimalToBinary(doc.question_id),
                    "poc": [doc.is_correct],
                    "numOfAnswer": 1,
                    "averageTime": [doc.time]
                }
            };
        })
        // ※オブジェクトのループは一度配列に変換する必要がある(Object.entries())
        for (const [key, value] of Object.entries(data)) {
            // 正答率
            const count = value["poc"].filter((i) => i === true).length;
            value["poc"] = (count / value["numOfAnswer"]) * 100;
            // 平均タイム
            const sum = value["averageTime"].reduce((a, b) => a + b);
            value["averageTime"] = (sum / value["numOfAnswer"]) / 1000;
        }

        // 0-255までループ
        for (let i = 0; i < 256; i++) {
            // 含まれていない場合
            if (!(i in data)) {
                non_data.push({
                    "id": i,
                    "decimal": i,
                    "binary": decimalToBinary(i)
                })
            }
        }

        // オブジェクトを配列に変換
        data = Object.values(data);
        console.log("sss")

        return [data, non_data]
    } 
    
    // 10進数から2進数に変換
    const decimalToBinary = (param) => {
        // 数値に変換
        const param_num = Number(param);
        const binary = param_num.toString(2);
        // 8桁になるように0を追加
        const question = binary.padStart(8, "0");

        return question
    }

      const columns = [
        { field: 'decimal', headerName: '10進数'},
        { field: 'binary', headerName: '2進数', sortable: false},
        { field: 'poc', headerName: '正答率(%)', disableColumnMenu: true },
        { field: 'numOfAnswer', headerName: '解答数', disableColumnMenu: true},
        { field: 'averageTime', headerName: '平均解答速度(s)', disableColumnMenu: true, width: 200},
      ];
      // max(351px)
      const columns_mobile = [
        { field: 'decimal', headerName: '10進数', width: 60},
        { field: 'binary', headerName: '2進数', width: 70},
        { field: 'poc', headerName: '正答率(%)', disableColumnMenu: true, width: 70 },
        { field: 'numOfAnswer', headerName: '解答数', disableColumnMenu: true, width: 50},
        { field: 'averageTime', headerName: '平均解答速度(s)', disableColumnMenu: true, width: 100},
      ];
      const columns_non = [
        { field: 'decimal', headerName: '10進数'},
        { field: 'binary', headerName: '2進数', sortable: false, width: 200},
      ];
      const columns_non_mobile = [
        { field: 'decimal', headerName: '10進数', width: 100},
        { field: 'binary', headerName: '2進数', sortable: false, width: 250},
      ];

      const gridStyle = {
        // 背景を白色にする
        backgroundColor: '#fff',
        // テキストを黒色にする
        color: '#000',
        // ヘッダーの背景を赤色にする
        '& .MuiDataGrid-columnHeader': {
            // 薄い赤色
            backgroundColor: '#ff0000',
        },
        width: isMobile ? "100%": "600px",
        // テキストサイズを小さくする
        fontSize: isMobile ? "0.6rem" : "0.8rem",
        // '& .MuiDataGrid-columnHeaderDraggableContainer': {
        //     // 消す
        //     display: 'none',
        // }
        '& .MuiDataGrid-menuIcon': {
            display: 'none',
        },
        '& .MuiDataGrid-iconButtonContainer': {
            display: 'none',
        }
      }
      const gridStyle_non = {
        // 背景を白色にする
        backgroundColor: '#fff',
        // テキストを黒色にする
        color: '#000',
        // ヘッダーの背景を赤色にする
        '& .MuiDataGrid-columnHeader': {
            // 薄い灰色
            backgroundColor: '#d3d3d3',
        },
        '& .MuiDataGrid-menuIcon': {
            display: 'none',
        },
        '& .MuiDataGrid-iconButtonContainer': {
            display: 'none',
        }
      }

      const tableStyle = {
        // スマホの時縦並びにする
        flexDirection: isMobile ? "column" : "row",
        // 横並びにする
        display: "flex",
        // 上の余白をあける
        marginTop: "30px",
        // 間隔をあける
        gap: isMobile ? "30px" : "60px",
        width: isMobile ? "90%" : "50%",
    }
    const textStyle = {
        // テキストサイズを小さくする
        fontSize: "1.2rem",
    }

  
    return (
        <>
        <Box style={tableStyle}>
            <Box>
                <Box style={textStyle}>あなたの詳細なレコード記録</Box>
                <Box>
                    <DataGrid
                        rows={seRows}
                        columns={isMobile ? columns_mobile: columns}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 30 },
                            },
                        }}
                        sx={gridStyle}
                    />
                </Box>
            </Box>
            <Box>
                <Box style={textStyle}>一度も解答してない問題</Box>
                <Box>
                    <DataGrid
                        rows={seNonRows}
                        columns={isMobile ? columns_non_mobile : columns_non}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 30 },
                            },
                        }}
                        sx={gridStyle_non}
                    />
                </Box>
            </Box>
        </Box>
        </>

    )
  }
  
  
  