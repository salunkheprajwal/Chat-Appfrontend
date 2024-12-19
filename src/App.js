
  import './App.css';
  import React from 'react'

  import { Route } from 'react-router-dom';
  import HomePage from './pages/HomePage';
  import ChatPage from './pages/ChatPage';
function App() {
    return (
      <div className='App'>
        <Route path="/" component={HomePage} exact ></Route>
        <Route path="/chats" component={ChatPage}></Route>
        
      </div>
    );
  }

  export default App;
