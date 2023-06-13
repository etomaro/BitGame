
import * as React from 'react';
import Box from '@mui/material/Box';
import './anonimas.css';

export const AnonimasAnime = () => {
    const style = {
        // 画面の真ん中に配置
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    }

  return (
    <Box style={style}>
        <div className="mr-robot">
            <div className="evilcorp">
                <div className="fsociety-mask"></div>
            </div>
            <div className="elliot">
                <div className="fsociety"></div>
            </div>
        </div>
    </Box>
  );
}


