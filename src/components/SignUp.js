import { signUp } from '../firebase'
import Button from '@mui/material/Button';

// button style
const style = {
    // テキスト色を白にする
    color: '#fff',
}
export const SignUp = () => {
    return (
        <Button onClick={signUp} style={style}>Sign Up</Button>
    )
}
