/**
 * @Author: Ali
 * @Date:   2019-03-22T10:38:47+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2019-03-22T10:59:10+01:00
 */
import React, { Component } from "react";

class WordInput extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      message: ""
    };
  }
  handleInput = e => {
    this.setState({
      input: e.target.value
    });
  };
  render() {
    return (
      <div className="row">
        <div className="col-md-6 mx-auto">
          <p className="lead">
            {" "}
            Type the given word within{" "}
            <span className="text-warning font-weight-bold" id="seconds">
              {" "}
              5{" "}
            </span>
            seconds :
          </p>
          <h2 className="display-2 mb-5" id="current-word">
            hello
          </h2>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Start typing..."
            id="word-input"
            onChange={this.handleInput}
            value={this.state.input}
            autofocus
          />
          <h4 className="mt-3" id="message">
            {this.state.message}
          </h4>
        </div>
      </div>
    );
  }
}
export default WordInput;
