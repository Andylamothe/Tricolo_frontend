
import 'react';
import{BrowserRouter, Routes, Route} from "react-router-dom";
import HomePage from './components/HomePage';

function App() {
    return (
        <BrowserRouter>

            <div>
                <div>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        


                    </Routes>
                </div>


            </div>
        </BrowserRouter>

    );
}

export default App;
