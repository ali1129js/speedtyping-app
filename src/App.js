/**
 * @Author: Ali
 * @Date:   2019-03-22T09:54:56+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2019-03-22T11:07:06+01:00
 */
import React, { Component } from "react";
import Header from "./Components/Header";
import WordInput from "./Components/WordInput";
import Score from "./Components/Score";
import Instructions from "./Components/Instructions";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="bg-dark text-white ">
        <div className="container text-center">
          <Header />
          <WordInput />
          <Score />
          <Instructions />
        </div>
      </div>
    );
  }
}
export default App;
