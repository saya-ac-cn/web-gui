import { useState } from 'react'
import './App.scss'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)
// console.log(import.meta.env,'=', import.meta.env.VITE_API)
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      页面
    </div>
  )
}

export default App