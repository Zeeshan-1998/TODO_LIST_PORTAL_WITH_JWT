import React, { useState } from "react";
import Modal from "react-modal";

function TodoList({
  todos,
  handleCreateTodo,
  handleUpdateTodo,
  handleDeleteTodo,
}) {
  const [newTodo, setNewTodo] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updatedTodoId, setUpdatedTodoId] = useState("");
  const [updatedTodoTitle, setUpdatedTodoTitle] = useState("");

  const handleChange = (event) => {
    setNewTodo(event.target.value);
  };

  const handleAddTodo = () => {
    if (newTodo) {
      handleCreateTodo(newTodo);
      setNewTodo("");
    }
  };

  const handleUpdate = (todoId, updatedTitle) => {
    setUpdatedTodoId(todoId);
    setUpdatedTodoTitle(updatedTitle);
    setUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (updatedTodoTitle) {
      handleUpdateTodo(updatedTodoId, updatedTodoTitle);
    }
    setUpdateModalOpen(false);
  };

  const handleDelete = (todoId) => {
    setUpdatedTodoId(todoId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteTodo(updatedTodoId);
    setDeleteModalOpen(false);
  };

  const handleCancel = () => {
    setUpdateModalOpen(false);
    setDeleteModalOpen(false);
  };

  return (
    <div className="todo-list">
      <h2 className="text-center mt-4">Todo List</h2>
      <div className="add-todo mt-3">
        <input
          type="text"
          placeholder="Add new todo"
          value={newTodo}
          onChange={handleChange}
          className="form-input"
        />
        <button onClick={handleAddTodo} className="btn btn-primary mt-4">
          Add
        </button>
      </div>
      <ul className="todo-items mt-4">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <div className="todo-content">{todo.title}</div>
            <div className="todo-actions">
              <button
                onClick={() => handleUpdate(todo.id, todo.title)}
                className="btn btn-sm btn-info"
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(todo.id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Update Modal */}
      <Modal
        isOpen={updateModalOpen}
        onRequestClose={handleCancel}
        contentLabel="Update Todo"
      >
        <h2 className="mt-3">Update Todo</h2>
        <input
          type="text"
          value={updatedTodoTitle}
          onChange={(e) => setUpdatedTodoTitle(e.target.value)}
          className="form-input mt-4"
        />
        <div className="mt-3">
          <button
            onClick={handleConfirmUpdate}
            className="btn btn-primary mt-4"
          >
            Update
          </button>
          <button onClick={handleCancel} className="btn btn-secondary mt-4">
            Cancel
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={handleCancel}
        contentLabel="Delete Todo"
      >
        <h2 className="mt-3">Delete Todo</h2>
        <p className="mt-4">Are you sure you want to delete this todo?</p>
        <div className="mt-3">
          <button onClick={handleConfirmDelete} className="btn btn-danger mt-4">
            Delete
          </button>
          <button onClick={handleCancel} className="btn btn-secondary mt-4">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TodoList;
