import React from 'react';
import AppNavigator from './js/src/components/navigator/AppNavigator';
import BottomNavigator from './js/src/components/navigator/BottomNavigator';
export default class App extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      userName:"User1"
    }
  }
  render() {
    return (
      <AppNavigator/>

    );
  }
}