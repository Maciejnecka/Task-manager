'use strict';
import React from 'react';
import { create, remove, update, get, finish } from './apiProvider';

class TasksManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      task: '',
      errorMessage: '',
      intervalId: null,
      confirmationModalIds: {},
    };
  }

  componentDidMount() {
    this.fetchTasks();
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  componentDidUpdate(prevState) {
    if (prevState.tasks !== this.state.tasks) {
      const runningTasks = this.state.tasks.filter((task) => task.isRunning);

      if (runningTasks.length > 0 && !this.state.intervalId) {
        const intervalId = setInterval(() => {
          this.setState((prevState) => {
            const updatedTasks = prevState.tasks.map((task) =>
              task.isRunning
                ? {
                    ...task,
                    time: task.time + 1,
                  }
                : task
            );
            return {
              tasks: updatedTasks,
            };
          });
        }, 1000);

        this.setState({ intervalId });
      } else if (runningTasks.length === 0 && this.state.intervalId) {
        clearInterval(this.state.intervalId);
        this.setState({ intervalId: null });
      }
    }
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
    this.setState({ task: e.target.value, errorMessage: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { task, tasks } = this.state;

    if (!task.trim()) {
      this.setState({ errorMessage: 'Task name cannot be empty.' });
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

      update('/tasks', response.id, newItem);
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  };

  handleStartStop = async (id) => {
    this.setState((prevState) => {
      const isRunning = !prevState.tasks.find((task) => task.id === id)
        .isRunning;
      const startTime = isRunning
        ? Date.now() -
          prevState.tasks.find((task) => task.id === id).time * 1000
        : prevState.tasks.find((task) => task.id === id).startTime;

      const newTasks = prevState.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              isRunning: !task.isRunning,
              startTime: isRunning ? Date.now() : startTime,
            }
          : task
      );

      const updatedTask = newTasks.find((task) => task.id === id);
      const elapsedTime = isRunning
        ? Math.floor((Date.now() - updatedTask.startTime) / 1000)
        : 0;

      update('/tasks', id, {
        isRunning: isRunning,
        startTime: startTime,
        endTime: isRunning ? null : Date.now(),
        time: updatedTask.time + elapsedTime,
      });

      return { tasks: newTasks, intervalId: prevState.intervalId };
    });
  };

  handleRemove = (id) => {
    this.setState((prevState) => {
      const confirmationModalIds = {
        ...prevState.confirmationModalIds,
        [id]: true,
      };
      return {
        confirmationModalIds,
      };
    });
  };

  confirmRemove = async (id) => {
    this.setState({
      confirmationModalIds: {
        ...this.state.confirmationModalIds,
        [id]: null,
      },
    });

    if (id !== null) {
      this.setState((state) => {
        const newTasks = state.tasks.filter((task) => task.id !== id);
        remove(id);
        return {
          tasks: newTasks,
        };
      });
    }
  };

  cancelRemove = () => {
    this.setState({
      confirmationModalIds: null,
    });
  };

  handleFinish = async (id) => {
    this.setState((prevState) => {
      const newTasks = prevState.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              isDone: true,
              isRunning: false,
            }
          : task
      );
      finish(id, newTasks);
      clearInterval(prevState.intervalId);

      return {
        tasks: newTasks,
        intervalId: null,
      };
    });
  };

  formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
      seconds
    )}`;
  };

  padZero = (num) => (num < 10 ? `0${num}` : num);

  onClick = () => {
    const { tasks } = this.state;
    console.log(tasks);
  };

  render() {
    const { tasks, confirmationModalIds } = this.state;

    const unfinishedTasks = tasks.filter((task) => !task.isDone);
    const finishedTasks = tasks.filter((task) => task.isDone);

    const combinedTasks = [...unfinishedTasks, ...finishedTasks];
    return (
      <div className="tasks-manager">
        <h1 className="tasks-manager__title" onClick={this.onClick}>
          TasksManager
        </h1>
        <form className="tasks-manager__form" onSubmit={this.handleSubmit}>
          <label className="tasks-manager__label">
            <input
              className="tasks-manager__input"
              placeholder="Add your task"
              type="text"
              name="task"
              value={this.state.task}
              onChange={this.handleChange}
            />
          </label>
          {this.state.errorMessage && (
            <p className="tasks-manager__error-message">
              {this.state.errorMessage}
            </p>
          )}
          <button className="tasks-manager__button" type="submit">
            Add Task
          </button>
        </form>
        <ul className="tasks-manager__list">
          {combinedTasks.map((task) => (
            <section
              key={task.id}
              className={`tasks-manager__task ${
                task.isDone ? 'tasks-manager__task--finished' : ''
              }${task.isRunning ? 'tasks-manager__task--running' : ''}`}
            >
              <header className="tasks-manager__task-header">
                {`${task.name} ${this.formatTime(task.time)}`}
              </header>
              <p className="tasks-manager__task-status">
                {`Status: ${task.isDone ? 'Finished' : 'In progress'}`}
              </p>
              <footer className="tasks-manager__task-footer">
                <button
                  className={`tasks-manager__task-button ${
                    task.isRunning ? 'pulsate' : ''
                  }`}
                  onClick={() => this.handleStartStop(task.id)}
                  disabled={task.isDone}
                >
                  {task.isRunning ? 'Stop' : 'Start'}
                </button>
                <button
                  className="tasks-manager__task-button"
                  onClick={() => this.handleFinish(task.id)}
                  disabled={task.isDone}
                >
                  Finish
                </button>
                <button
                  className="tasks-manager__task-button"
                  onClick={() => this.handleRemove(task.id)}
                  disabled={!task.isDone}
                >
                  Remove
                </button>
              </footer>
              <div
                className="confirmation-modal"
                style={{
                  display:
                    confirmationModalIds !== null &&
                    confirmationModalIds[task.id]
                      ? 'block'
                      : 'none',
                }}
              >
                <p className="confirmation-modal__paragraph">
                  Are you sure you want to remove this task?
                </p>
                <button
                  className="confirmation-modal__button confirmation-modal__button-confirm"
                  onClick={() => this.confirmRemove(task.id)}
                >
                  Confirm
                </button>
                <button
                  className="confirmation-modal__button confirmation-modal__button-cancel"
                  onClick={this.cancelRemove}
                >
                  Cancel
                </button>
              </div>
            </section>
          ))}
        </ul>
      </div>
    );
  }
}

export default TasksManager;
