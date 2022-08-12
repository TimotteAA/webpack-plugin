import { createRoot } from 'react-dom/client';
import React from "react";

import testPng from "./assets/imgs/1.jpg"

function App() {
    return <div style={{width: "600px", margin: "0 auto"}}>
        <button>啦啦啦啦</button>
        <div >
            <img src={testPng}  style={{width: "400px", height: "auto"}}/>
        </div>
        <div>
            <button>测试按钮1</button><button>测试按钮2</button><button>测试按钮3</button>
        </div>
    </div>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
