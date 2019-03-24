/**
 * @Author: Ali
 * @Date:   2019-03-22T11:05:07+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2019-03-24T11:18:57+01:00
 */
import React from "react";

const Score = props => (
  <div className="row mt-5">
    <div className="col-md-6">
      <h3>
        Time Left:
        <span id="time">0</span>
      </h3>
    </div>
    <div className="col-md-6">
      <h3>
        Score:
        <span id="score">{props.score}</span>
      </h3>
    </div>
  </div>
);
export default Score;
