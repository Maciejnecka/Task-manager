'use strict';
import React from 'react';
import { create } from './apiProvider';
import { get } from './apiProvider';

class TasksManager extends React.Component {
  state = {
    tasks: [],
    task: '',
  };

  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks = async () => {
    try {
      const response = await get('/tasks');
      this.setState({ tasks: response });
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  handleChange = (e) => {
    this.setState({ task: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { task, tasks } = this.state;

    if (!task.trim()) {
      console.error('Task name cannot be empty.');
      return;
    }

    try {
      const response = await create('/tasks', { name: task });
      const newItem = {
        name: task,
        id: response.id,
        time: 0,
        isRunning: false,
        isDone: false,
        isRemoved: false,
      };

      this.setState({
        tasks: [...tasks, newItem],
        task: '',
      });
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  };

  onClick = () => {
    const { tasks } = this.state;
    console.log(tasks);
  };

  render() {
    return (
      <div>
        <h1 onClick={this.onClick}>TasksManager</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Task:
            <input
              type="text"
              name="task"
              value={this.state.task}
              onChange={this.handleChange}
            />
          </label>
          <button type="submit">Add Task</button>
        </form>
        <ul>
          {this.state.tasks.map((task) => (
            <li className="li-temp" key={task.id}>
              {task.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default TasksManager;
