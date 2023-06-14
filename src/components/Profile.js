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


export const Profile = () => {
    
    const navigate = useNavigate();
    const TestButton = styled(Button)({
        background: "tomato"
    })
    const testStyle = {
        color: "white",
        backgroundColor: "blue",
    }


    const style = { 
        glowColor: "rgb(217, 176, 255)", 
        glowSpreadColor: "rgba(191, 123, 255, 0.781)",
        enhancedGlowColor: "rgb(231, 206, 255)",
        btnColor: "rgb(100, 61, 136)",
        border: ".25em solid rgb(217, 176, 255)", 
        padding: "1em 3em", 
        color: "rgb(217, 176, 255)", 
        fontSize: "15px", fontWeight: "bold",
        backgroundColor: "rgb(100, 61, 136)", 
        borderRadius: "1em", 
        outline: "none", 
        boxShadow: "0 0 1em .25em rgb(217, 176, 255),0 0 4em 1em rgba(191,123,255,.781),inset 0 0 .75em .25em rgb(217,176,255)", 
        textShadow: "0 0 .5em rgb(217,176,255)", 
        position: "relative", 
        transition: "all .3s" 
    }

    // checkbox
    const TestCheckbox = styled(Checkbox)({
        "&.MuiCheckbox-root": {
            border: ".15em solid rgb(217, 176, 255)", 
            borderRadius: "1em",
        },
        "&.Mui-checked": {
            boxShadow: "0 0 1em .25em rgb(217, 176, 255),0 0 4em 1em rgba(191,123,255,.781),inset 0 0 .75em .25em rgb(217,176,255)", 
        },
        // チェックマークを消す
        "& .MuiSvgIcon-root": {
            color: "transparent"
        },
    })

    // const checkStyle = {
    //     "&.MuiCheckbox-root": {
    //         border: ".15em solid rgb(217, 176, 255)", 
    //         borderRadius: "1em",
    //     },
    //     "&.Mui-checked": {
    //         boxShadow: "0 0 1em .25em rgb(217, 176, 255),0 0 4em 1em rgba(191,123,255,.781),inset 0 0 .75em .25em rgb(217,176,255)", 
    //     },
    //     // チェックマークを消す
    //     "& .MuiSvgIcon-root": {
    //         color: "transparent"
    //     },
    // }
    

  
    return (
        <>
        <Box>プロフィール</Box>

        <TestButton style={testStyle}>ボタン</TestButton>

        <TestCheckbox />
        </>

    )
  }
  
  
  