import React, { useState, useEffect } from 'react';
import * as microsoftTeams from '@microsoft/teams-js';
import { fetchSAPWorkflows, approveWorkflow, rejectWorkflow } from './sapConnection';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faWallet,faLock, faChartLine, faSpinner } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [workflows, setWorkflows] = useState([]);
  const [isTeamsContext, setIsTeamsContext] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState('Finance'); // Default active card

  console.log('=== SAP Bot Starting ===');
  console.log('SAP_CLIENT_ID exists:', process.env.REACT_APP_SAP_CLIENT_ID);
  console.log('SAP_CLIENT_SECRET exists:', process.env.REACT_APP_SAP_CLIENT_SECRET_ENCODED);
  console.log('============================');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      console.log('Initiating fetchWorkflows...');
      const workflowsData = await fetchSAPWorkflows();
      console.log('Fetched workflows data:', workflowsData);
      setWorkflows(workflowsData);
      setLoading(false);
      console.log('Workflows state updated:', workflowsData);
    } catch (err) {
      console.error('Error in fetchWorkflows:', err.message, err.stack);
      setError('Failed to fetch workflows. Please try again.');
      setLoading(false);
    }
  };

  const handleApprove = async (instanceId) => {
    try {
      console.log(`Initiating approval for InstanceID: ${instanceId}`);
      const status = await approveWorkflow(instanceId);
      console.log(`Approval status for ${instanceId}:`, status);

      if (status?.toUpperCase() === 'COMPLETED') {
        toast.success(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Workflow {instanceId} approved successfully!</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: '#28a745' } // Custom green color for success
          }
        );
        console.log('Approval successful, scheduling workflow refresh after 3 seconds...');
        setTimeout(() => {
          fetchWorkflows();
        }, 3000);
      } else {
        toast.error(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Workflow {instanceId} approval failed: Status is {status || 'unknown'}</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    } catch (err) {
      console.error('Error in handleApprove:', err.message, err.stack);
      toast.error(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{err.message || `Failed to approve workflow ${instanceId}`}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const handleReject = async (instanceId) => {
    try {
      console.log(`Initiating rejection for InstanceID: ${instanceId}`);
      const status = await rejectWorkflow(instanceId);
      console.log(`Rejection status for ${instanceId}:`, status);

      if (status?.toUpperCase() === 'COMPLETED') {
        toast.success(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Workflow {instanceId} rejected successfully!</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: '#28a745' } // Custom green color for success
          }
        );
        console.log('Rejection successful, scheduling workflow refresh after 3 seconds...');
        setTimeout(() => {
          fetchWorkflows();
        }, 3000);
      } else {
        toast.error(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Workflow {instanceId} rejection failed: Status is {status || 'unknown'}</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    } catch (err) {
      console.error('Error in handleReject:', err.message, err.stack);
      toast.error(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{err.message || `Failed to reject workflow ${instanceId}`}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const handleCardClick = (card) => {
    setActiveCard(card);
    // No toast.info call, "Coming soon" handled in UI
  };

  useEffect(() => {
    console.log('Component mounting, initializing Microsoft Teams SDK...');
    microsoftTeams.app.initialize().then(() => {
      console.log('Microsoft Teams SDK initialized successfully');
      setIsTeamsContext(true);
      fetchWorkflows();
    }).catch((err) => {
      console.warn('Microsoft Teams SDK initialization failed, running in standalone mode:', err);
      setIsTeamsContext(false);
      fetchWorkflows();
    });
  }, []);

  const formatDate = (dateString) => {
    try {
      console.log(`Formatting date: ${dateString}`);
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', '');
    } catch (err) {
      console.error('Error formatting date:', dateString, err.message);
      return 'Invalid Date';
    }
  };

  const getStatusClass = (status) => {
    console.log(`Getting status class for status: ${status}`);
    switch (status?.toUpperCase()) {
      case 'READY': return 'ready';
      case 'IN_PROGRESS': return 'in-progress';
      case 'COMPLETED': return 'completed';
      default: return 'ready';
    }
  };

  const handleWorkflowClick = (workflow) => {
    console.log('Workflow card clicked:', workflow);
    setSelectedWorkflow(workflow);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSelectedWorkflow(null);
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="App">
        <div className="loading-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <span>Loading workflows...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="App">
        <div className="error-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.5em' }}>⚠️</div>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main dashboard with workflows:', workflows);

  const financeCount = workflows.length; // Live count for Finance
  const securityCount = 0; // Hardcoded for now
  const salesCount = 0; // Hardcoded for now

  return (
    <div className="App">
      <header className="app-header hideit">
        <div className="header-content">
          <span className="header-icon">📄</span>
          <div>
            <h1>Workflow Approvals</h1>
            <p>{isTeamsContext ? 'Microsoft Teams' : 'Standalone Mode'}</p>
          </div>
        </div>
      </header>

      <main className="workflow-container">
        <div className="workflow-stats">
  <div
    className={`stat-card ${activeCard === 'Finance' ? 'active' : ''}`}
    onClick={() => handleCardClick('Finance')}
  >
    <div className="stat-left">
      <span className="stat-icon">
        {/* Using FontAwesome for wallet icon, adjust if using SVG */}
        <FontAwesomeIcon icon={faWallet} />
      </span>
      <div className="stat-text">
        <p>Finance</p>
      </div>
    </div>
    <div className="stat-count">
      {financeCount}
    </div>
  </div>
  <div
    className={`stat-card ${activeCard === 'Security' ? 'active' : ''}`}
    onClick={() => handleCardClick('Security')}
  >
    <div className="stat-left">
      <span className="stat-icon">
        <FontAwesomeIcon icon={faLock} />
      </span>
      <div className="stat-text">
        <p>Security</p>
      </div>
    </div>
    <div className="stat-count">
      {securityCount}
    </div>
  </div>
  <div
    className={`stat-card ${activeCard === 'Sales and Distribution' ? 'active' : ''}`}
    onClick={() => handleCardClick('Sales and Distribution')}
  >
    <div className="stat-left">
      <span className="stat-icon">
        <FontAwesomeIcon icon={faChartLine} />
      </span>
      <div className="stat-text">
        <p>Sales and Distribution</p>
      </div>
    </div>
    <div className="stat-count">
      {salesCount}
    </div>
  </div>
</div>

        <div className="workflow-list">
          {activeCard === 'Finance' && workflows.length > 0 ? (
            workflows.map((workflow, index) => (
              <div
                key={workflow.InstanceID}
                className="workflow-card"
                onClick={() => handleWorkflowClick(workflow)}
              >
                <div className="workflow-header">
                  <h3 className="workflow-title">
                    {workflow.TaskTitle || 'Untitled Workflow'}
                  </h3>
                  <span className={`hideit workflow-status-badge ${getStatusClass(workflow.Status)}`}>
                    {workflow.Status || 'READY'}
                  </span>
                </div>
                <div className="workflow-meta">
                  <div className="workflow-instance">
                    <strong>Instance ID:</strong> {workflow.InstanceID}
                  </div>
                  {workflow.CreatedByName && (
                    <div className="workflow-details">
                      <strong>Created by:</strong> {workflow.CreatedByName}
                    </div>
                  )}
                  {workflow.CreatedOn && (
                    <div className="workflow-details">
                      <strong>Created on:</strong> {formatDate(workflow.CreatedOn)}
                    </div>
                  )}
                </div>
                <div className="workflow-actions">
                  <button
                    className="action-btn approve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(workflow.InstanceID);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(workflow.InstanceID);
                    }}
                  >
                    Reject
                  </button>
                  <a
                    href={workflow.InboxURL || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Opening SAP Inbox URL for workflow ${workflow.InstanceID}:`, workflow.InboxURL);
                    }}
                    className="action-btn sap-inbox-btn"
                  >
                    SAP Inbox
                  </a>
                </div>
              </div>
            ))
          ) : activeCard !== 'Finance' ? (
            <div className="coming-soon">
              <h3>Coming Soon</h3>
              <p>Data for {activeCard} workflows is not available yet. Stay tuned!</p>
            </div>
          ) : null}
        </div>
      </main>

      {selectedWorkflow && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedWorkflow.TaskTitle || 'Untitled Workflow'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>
                <span className="label">Task Title:</span>{' '}
                {selectedWorkflow.TaskTitle || 'Untitled'}
              </p>
              <p>
                <span className="label">Status:</span>{' '}
                <span
                  className={`workflow-status-badge ${getStatusClass(
                    selectedWorkflow.Status
                  )}`}
                  style={{ marginLeft: '10px' }}
                >
                  {selectedWorkflow.Status}
                </span>
              </p>
              <p>
                <span className="label">Instance ID:</span>{' '}
                {selectedWorkflow.InstanceID}
              </p>
              {selectedWorkflow.TaskDetails && (
                <div className="workflow-details">
                  <h4>Task Details:</h4>
                  <div className="workflowdetailsitems">
                    {selectedWorkflow.TaskDetails.split('#$#').map((detail, idx) => {
                      const trimmedDetail = detail.trim();
                      if (!trimmedDetail) return null;
                      const [label, value] = trimmedDetail
                        .split(':')
                        .map((item) => item.trim());
                      return (
                        <p key={idx} className="workflow-detail-item">
                          <span className="label">{label}:</span> {value}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
              <p>
                <span className="label">Created By:</span>{' '}
                {selectedWorkflow.CreatedByName || 'Unknown'}
              </p>
              <p>
                <span className="label">Created On:</span>{' '}
                {formatDate(selectedWorkflow.CreatedOn)}
              </p>
              {selectedWorkflow.InboxURL && (
                <p>
                  <span className="label">SAP Inbox:</span>{' '}
                  <a
                    href={selectedWorkflow.InboxURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '10px', color: '#464775' }}
                  >
                    Open in SAP
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </div>
  );
}

export default App;