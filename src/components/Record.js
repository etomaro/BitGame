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


export const Record = () => {

    useEffect(() => {
        console.log("レコードページ レンダリング")
    }, []);
  
    return (
        <>
        <Box>あなたの詳細なレコード記録</Box>
        </>

    )
  }
  
  
  