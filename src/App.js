import logo from './logo.svg';
import './App.css';


// 4bit2進数と対応する10進数のオブジェクトを作成
const bit4 = {
  '0000': 0,  
  '0001': 1,
  '0010': 2,
  '0011': 3,
  '0100': 4,
  '0101': 5,
  '0110': 6,
  '0111': 7,
  '1000': 8,
  '1001': 9,
  '1010': 10,
  '1011': 11,
  '1100': 12,
  '1101': 13,
  '1110': 14,
  '1111': 15,
}
// bit4のキーを問題、値を答えとしたサイトを作成
const bit4site = Object.keys(bit4).map((key) => {
  return (
    <div>
      <p>{key}</p>
      <p>{bit4[key]}</p>
    </div>
  )
})

// キーボードで入力して答える問題サイトを作成
const bit4site2 = Object.keys(bit4).map((key) => {
  return (
    <div>
      <p>{key}</p> 
      <input type="text" />
    </div>
  )
})
function App() {
  return (
    // 背景が黒くなるので、App-headerの背景色を変更
    <div className="App">
      <header className="App-header">
        {bit4site2}
      </header>
    </div>
  );
}

export default App;
