import './App.css';
import Canvas from "./components/Canvas";
import EnterRoom from  "./components/EnterRoom"
 import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
 import client from "./utils/symphony.config"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<EnterRoom />} /> 
          <Route path="/:id" element={<Canvas client={client}/>} />
        </Routes>
      </div>

    </Router>

  );
}

export default App;
