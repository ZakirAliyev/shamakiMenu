import {createRoot} from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import {Provider} from "react-redux";
import {store} from "./services/store.jsx";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import i18n from "./i18n.js"
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
        <App/>
        </DndProvider>
    </Provider>
)