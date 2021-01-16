import React, { Component } from "react";
import CreateLink from "./CreateLink";
import LinkList from "./LinkList";

class App extends Component {
  render() {
    localStorage.setItem("token", "set-the-token-here");
    return (
      <>
        <CreateLink />
        <LinkList />;
      </>
    );
  }
}

export default App;
