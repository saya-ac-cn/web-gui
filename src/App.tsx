import { invoke } from "@tauri-apps/api/tauri";
import Router from './router'
import {BrowserRouter} from 'react-router-dom'
import 'antd/dist/reset.css';

console.log(import.meta.env)
function App() {
  return (
      <BrowserRouter>
          <Router/>
      </BrowserRouter>
  )}
export default App