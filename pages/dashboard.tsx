import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { taskApi } from '@/src/lib/api.client';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });
  const [toasts, setToasts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchTasks();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchTasks = async () => {
    try {
      const res = await taskApi.list();
      setTasks(res.items);
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'pending' });
    setShowModal(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '', status: task.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskApi.update(editingTask.taskId, formData);
        addToast('Task updated successfully');
      } else {
        await taskApi.create(formData);
        addToast('Task created successfully');
      }
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      addToast(err.message || 'Operation failed', 'error');
    }
  };

  const toggleStatus = async (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    const nextStatus = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending';
    try {
      await taskApi.update(task.taskId, { status: nextStatus });
      fetchTasks();
    } catch (err: any) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const triggerDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTaskToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await taskApi.delete(taskToDelete);
      addToast('Task deleted');
      setShowConfirm(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Head>
        <title>Dashboard | Taskly</title>
      </Head>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✅' : '❌'} {t.message}
          </div>
        ))}
      </div>

      <nav className="sidebar glass">
        <div className="sidebar-top">
          <div className="sidebar-header">
            <h1 className="logo-small gradient-text">T.</h1>
          </div>
          <div className="sidebar-links">
            <div className="nav-item active">
              <span className="icon">📋</span>
            </div>
          </div>
        </div>
        
        <div className="sidebar-bottom">
          <div className="user-avatar glass">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="logout-btn-premium" title="Sign Out">
            <span>Sign Out</span>
            <span className="icon">🚪</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="content-header">
          <div className="welcome">
            <p className="date-text">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1>Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span></h1>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <span>+</span> New Task
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card glass">
            <p>Total Tasks</p>
            <h3>{tasks.length}</h3>
          </div>
          <div className="stat-card glass">
            <p>Completed</p>
            <h3 style={{color: '#10b981'}}>{tasks.filter(t => t.status === 'completed').length}</h3>
          </div>
          <div className="stat-card glass">
            <p>Efficiency</p>
            <h3 style={{color: '#06b6d4'}}>{tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%</h3>
          </div>
        </section>

        <section className="tasks-section">
          <div className="section-title">
            <h2>Active Tasks</h2>
            <div className="filters">
              <span className="badge">Recent</span>
            </div>
          </div>

          <div className="tasks-grid">
            {loading ? (
              <p>Loading your space...</p>
            ) : tasks.length === 0 ? (
              <div className="empty-state glass">
                <p>No tasks found. Start by creating your first mission!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.taskId} className="task-card glass" onClick={() => openEditModal(task)}>
                  <div className="task-header">
                    <span className={`status-pill ${task.status}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <button onClick={(e) => triggerDelete(e, task.taskId)} className="delete-icon">×</button>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-footer">
                    <button onClick={(e) => toggleStatus(e, task)} className="status-btn">
                      Next Step →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Task Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  className="input-field" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Task title..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us more about this task..."
                />
              </div>
              {editingTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="input-field" 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    style={{appearance: 'none'}}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content glass confirm-modal">
            <div className="confirm-icon">⚠️</div>
            <h2>Delete Task?</h2>
            <p>This action cannot be undone. Are you sure you want to remove this task?</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">Keep it</button>
              <button onClick={confirmDelete} className="btn-danger">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 240px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 20px;
          border-right: 1px solid var(--glass-border);
          position: fixed;
          height: 100vh;
          z-index: 10;
        }
        .sidebar-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .logo-small {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 60px;
        }
        .sidebar-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nav-item {
          width: 100%;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-muted);
        }
        .nav-item::after {
          content: 'Tasks';
          font-size: 0.9rem;
        }
        .nav-item.active {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
          padding-top: 24px;
          border-top: 1px solid var(--glass-border);
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 1.2rem;
          font-weight: 800;
          background: var(--grad-primary);
          color: white;
        }
        .logout-btn-premium {
          width: 100%;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .logout-btn-premium:hover {
          background: #ef4444;
          color: white;
        }
        .main-content {
          margin-left: 240px;
          flex: 1;
          padding: 60px;
          max-width: 1400px;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 50px;
        }
        .welcome h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 8px;
        }
        .date-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
        }
        .stat-card {
          padding: 30px;
          border-radius: 20px;
        }
        .stat-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        .stat-card h3 {
          font-size: 2rem;
          font-weight: 700;
        }
        .tasks-section {
          margin-top: 40px;
        }
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .task-card {
          padding: 24px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          cursor: pointer;
          transition: var(--transition);
        }
        .task-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .task-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .task-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-pill.in-progress { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .status-pill.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .delete-icon {
          font-size: 1.5rem;
          color: var(--text-muted);
          line-height: 1;
        }
        .task-footer {
          margin-top: 8px;
        }
        .status-btn {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-primary);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 40px;
          border-radius: 30px;
          animation: modal-in 0.3s ease-out;
        }
        @keyframes modal-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .confirm-modal {
          text-align: center;
        }
        .confirm-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .confirm-modal p {
          color: var(--text-muted);
          margin: 16px 0 30px 0;
        }
        .modal-content h2 {
          margin-bottom: 10px;
        }
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 30px;
        }
        .btn-secondary {
          padding: 12px 24px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .empty-state {
          grid-column: 1 / -1;
          padding: 60px;
          text-align: center;
          color: var(--text-muted);
          border-radius: 24px;
          border: 1px dashed var(--glass-border);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            height: 70px;
            flex-direction: row;
            padding: 10px 20px;
            bottom: 0;
            top: auto;
            border-right: none;
            border-top: 1px solid var(--glass-border);
            z-index: 100;
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(12px);
          }
          .sidebar-top {
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 20px;
            width: auto;
          }
          .logo-small {
            margin-bottom: 0;
            font-size: 1.8rem;
          }
          .sidebar-links {
            flex-direction: row;
            width: auto;
          }
          .nav-item {
            padding: 8px 12px;
            justify-content: center;
          }
          .nav-item::after {
            display: none;
          }
          .sidebar-bottom {
            flex-direction: row;
            width: auto;
            padding-top: 0;
            border-top: none;
            gap: 12px;
          }
          .user-avatar {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
          .logout-btn-premium {
            padding: 8px;
            width: auto;
          }
          .logout-btn-premium span:first-child {
            display: none;
          }
          .main-content {
            margin-left: 0;
            padding: 20px;
            padding-bottom: 100px; /* Space for bottom nav */
          }
          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
          }
          .content-header button {
            width: 100%;
          }
          .welcome h1 {
            font-size: 1.8rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
            margin-bottom: 30px;
          }
          .tasks-grid {
            grid-template-columns: 1fr;
          }
          .modal-content {
            padding: 24px;
            margin: 16px;
          }
        }

      `}</style>
    </div>
  );
}
