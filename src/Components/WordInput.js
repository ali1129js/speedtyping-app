/**
 * @Author: Ali
 * @Date:   2019-03-22T10:38:47+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2019-03-24T18:58:45+01:00
 */
import React, { Component } from "react";
import Score from "./Score";
import { data } from "./data";
class WordInput extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      message: "",
      isPlaying: false,
      randWord: "hello",
      time: 5,
      score: 0,
      words: data
    };
  }
  componentDidMount() {
    this.showWord();
    setInterval(this.counter, 1000);
  }
  counter = () => {
    if (this.state.time > 0) {
      this.setState({ time: this.state.time - 1 });
    } else if (this.state.time === 0) {
      this.setState({
        message: "Game Over",
        isPlaying: false,
        score: 0
      });
    }
  };
  showWord = () => {
    const randIndex = Math.floor(Math.random() * this.state.words.length);
    this.setState({
      randWord: this.state.words[randIndex]
    });
  };
  handleInput = e => {
    this.setState({
      input: e.target.value
    });
  };
  startMatch = (input, randWord) => {
    if (input === randWord) {
      this.setState({
        isPlaying: true,
        time: 6,
        input: "",
        message: "Correct!!!!",
        score: this.state.score + 1
      });
      this.showWord();
    }
  };
  render() {
    const { input, randWord } = this.state;
    this.startMatch(input, randWord);
    return (
      <>
        <div className="row">
          <div className="col-md-6 mx-auto">
            <p className="lead">
              Type the given word within
              <span className="text-warning font-weight-bold" id="seconds">
                {" "}
                {this.state.time}{" "}
              </span>
              seconds :
            </p>
            <h2 className="display-2 mb-5" id="current-word">
              {this.state.randWord}
            </h2>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Start typing..."
              id="word-input"
              onChange={this.handleInput}
              value={this.state.input}
              autoFocus
            />
            <h4 className="mt-3" id="message">
              {this.state.message}
            </h4>
          </div>
        </div>
        <Score score={this.state.score} time={this.state.time} />
      </>
    );
  }
}
export default WordInput;
