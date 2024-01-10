'use strict';
const url = 'https://my-json-server.typicode.com/Maciejnecka/JsonDB';

export function get(resource) {
  return fetchData(resource);
}

export function create(resource, data) {
  const option = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  };
  return fetchData(resource, option);
}

export function remove(id) {
  const option = {
    method: 'DELETE',
  };
  return fetchData('/tasks', option, id);
}

export function update(resource, id, updatedEl) {
  const option = {
    method: 'PATCH',
    body: JSON.stringify(updatedEl),
    headers: { 'Content-Type': 'application/json' },
  };
  return fetchData(resource, option, id);
}

export function finish(id, tasks) {
  const updatedTask = tasks.find((task) => task.id === id);
  const option = {
    method: 'PATCH',
    body: JSON.stringify({
      isDone: true,
      isRunning: false,
      time: updatedTask.time,
    }),
    headers: { 'Content-Type': 'application/json' },
  };
  return fetchData(`/tasks/${id}`, option);
}

function fetchData(resource = '', options = { method: 'GET' }, id = '') {
  const path = url + resource + `/${id}`;
  const promise = fetch(path, options);
  return promise
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return Promise.reject(resp);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      console.log('API request completed!');
    });
}
