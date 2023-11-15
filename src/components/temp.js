// 'use strict';
// import React from 'react';
// import { create, remove, update, get } from './apiProvider';

// class TasksManager extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       tasks: [],
//       task: '',
//       intervalId: null,
//     };
//   }

//   componentDidMount() {
//     this.fetchTasks();
//   }

//   componentWillUnmount() {
//     const { intervalId } = this.state;
//     clearInterval(intervalId);
//   }

//   componentDidUpdate(prevState) {
//     if (prevState.tasks !== this.state.tasks) {
//       const runningTasks = this.state.tasks.filter((task) => task.isRunning);

//       if (runningTasks.length > 0 && !this.state.intervalId) {
//         const intervalId = setInterval(() => {
//           this.setState((prevState) => {
//             const updatedTasks = prevState.tasks.map((task) =>
//               task.isRunning
//                 ? {
//                     ...task,
//                     time: task.time + 1,
//                   }
//                 : task
//             );
//             return {
//               tasks: updatedTasks,
//             };
//           });
//         }, 1000);

//         this.setState({ intervalId });
//       } else if (runningTasks.length === 0 && this.state.intervalId) {
//         clearInterval(this.state.intervalId);
//         this.setState({ intervalId: null });
//       }
//     }
//   }

//   fetchTasks = async () => {
//     try {
//       const response = await get('/tasks');
//       this.setState({ tasks: response });
//     } catch (error) {
//       console.error('Error fetching tasks: ', error);
//     }
//   };

//   handleChange = (e) => {
//     this.setState({ task: e.target.value });
//   };

//   handleSubmit = async (e) => {
//     e.preventDefault();

//     const { task, tasks } = this.state;

//     if (!task.trim()) {
//       console.error('Task name cannot be empty.');
//       return;
//     }

//     try {
//       const response = await create('/tasks', { name: task });
//       const newItem = {
//         name: task,
//         id: response.id,
//         time: 0,
//         isRunning: false,
//         isDone: false,
//         isRemoved: false,
//       };

//       this.setState({
//         tasks: [...tasks, newItem],
//         task: '',
//       });
//     } catch (error) {
//       console.error('Error adding task: ', error);
//     }
//   };

//   handleStartStop = async (id) => {
//     this.setState((prevState) => {
//       const isRunning = !prevState.tasks.find((task) => task.id === id)
//         .isRunning;
//       const startTime = isRunning
//         ? Date.now() -
//           prevState.tasks.find((task) => task.id === id).time * 1000
//         : prevState.tasks.find((task) => task.id === id).startTime;

//       const newTasks = prevState.tasks.map((task) =>
//         task.id === id
//           ? {
//               ...task,
//               isRunning: !task.isRunning,
//               startTime: isRunning ? Date.now() : startTime,
//             }
//           : task
//       );

//       const updatedTask = newTasks.find((task) => task.id === id);
//       const elapsedTime = isRunning
//         ? Math.floor((Date.now() - updatedTask.startTime) / 1000)
//         : 0;

//       update('/tasks', id, {
//         isRunning: isRunning,
//         startTime: startTime,
//         endTime: isRunning ? null : Date.now(),
//         time: updatedTask.time + elapsedTime,
//       });

//       return { tasks: newTasks, intervalId: prevState.intervalId };
//     });
//   };

//   handleRemove = async (id) => {
//     this.setState((state) => {
//       const newTasks = state.tasks.filter((task) => task.id !== id);
//       remove('/tasks', id);
//       return {
//         tasks: newTasks,
//       };
//     });
//   };

//   formatTime = (timeInSeconds) => {
//     const hours = Math.floor(timeInSeconds / 3600);
//     const minutes = Math.floor((timeInSeconds % 3600) / 60);
//     const seconds = timeInSeconds % 60;

//     return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
//       seconds
//     )}`;
//   };

//   padZero = (num) => (num < 10 ? `0${num}` : num);

//   onClick = () => {
//     const { tasks } = this.state;
//     console.log(tasks);
//   };

//   render() {
//     return (
//       <div>
//         <h1 onClick={this.onClick}>TasksManager</h1>
//         <form onSubmit={this.handleSubmit}>
//           <label>
//             Task:
//             <input
//               type="text"
//               name="task"
//               value={this.state.task}
//               onChange={this.handleChange}
//             />
//           </label>
//           <button type="submit">Add Task</button>
//         </form>
//         <ul>
//           {this.state.tasks.map((task) => (
//             <section key={task.id}>
//               <header>{`${task.name}`}</header>
//               <p>{`${this.formatTime(task.time)}`}</p>
//               <footer>
//                 <button onClick={() => this.handleStartStop(task.id)}>
//                   {task.isRunning ? 'stop' : 'start'}
//                 </button>
//                 <button onClick={() => this.handleRemove(task.id)}>usuń</button>
//               </footer>
//             </section>
//           ))}
//         </ul>
//       </div>
//     );
//   }
// }

// export default TasksManager;
