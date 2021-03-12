import React, { PureComponent } from 'react';

import { WorkloadListContainer } from '../WorkloadList';
import { WorkloadFormContainer } from '../WorkloadForm';
import './App.css';


class App extends PureComponent {
  render() {
    return (
      <div className="container">
        <h1 className="header">CloudWork</h1>
        <hr />
        
        <div className="workload-form-container">
          <WorkloadFormContainer />
        </div>
        <hr />

        <div className="workloads-container">
          <h2>Workloads</h2>
          <WorkloadListContainer />
        </div>
      </div>
    );
  }
}

export default App;
