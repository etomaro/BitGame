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


export const Network = () => {
    // 位置情報を取得する
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log("position: ", position);
            }, (error) => {
                console.log("position error: ", error);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }
    
    

  
    return (
        <>
        <Box>ネットワーク</Box>
        <Button onClick={getLocation}>位置情報を取得する</Button>
        </>

    )
  }
  
  
  