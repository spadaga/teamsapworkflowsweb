import axios from 'axios';

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Helper function to get the correct API URL for all environments
 */
function getApiUrl(endpoint) {
    return `/api${endpoint}`;
}

export async function getAccessToken() {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        console.log('Using cached token length:', cachedToken.length);
        return cachedToken;
    }

    try {
        console.log('Fetching new access token...');
        
        const clientId = process.env.REACT_APP_SAP_CLIENT_ID;
        const clientSecretEncoded = process.env.REACT_APP_SAP_CLIENT_SECRET_ENCODED;
        
        if (!clientId || !clientSecretEncoded) {
            throw new Error('Client ID or Client Secret is missing in environment variables.');
        }

        const clientSecret = atob(clientSecretEncoded);
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        
        const tokenResponse = await axios.post(
            'https://c6674ca9trial.authentication.ap21.hana.ondemand.com/oauth/token',
            new URLSearchParams({
                grant_type: 'client_credentials'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                }
            }
        );

        cachedToken = tokenResponse.data.access_token;
        console.log('New token length:', cachedToken.length);
        console.log('Token starts with:', cachedToken.substring(0, 50) + '...');
        
        const expiresIn = tokenResponse.data.expires_in || 3600;
        tokenExpiry = new Date(Date.now() + (expiresIn - 300) * 1000);
        
        return cachedToken;

    } catch (error) {
        console.error('Token fetch error:', error.response?.data);
        throw error;
    }
}

export async function fetchSAPWorkflows() {
    try {
        const accessToken = await getAccessToken();
        console.log('Now Fetching workflows with token...');
        
        // Fetch real SAP data
        const sapResponse = await axios.get(getApiUrl('/http/getSAPdata'), {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });

        console.log('Raw SAP response:', sapResponse.data);
        
        let sapWorkflows = [];
        if (sapResponse.data && sapResponse.data.TaskCollection && sapResponse.data.TaskCollection.Task) {
            sapWorkflows = Array.isArray(sapResponse.data.TaskCollection.Task) 
                ? sapResponse.data.TaskCollection.Task 
                : [sapResponse.data.TaskCollection.Task];
        } else if (Array.isArray(sapResponse.data)) {
            sapWorkflows = sapResponse.data;
        } else {
            console.warn('Unexpected SAP response format:', sapResponse.data);
            sapWorkflows = [];
        }

        // Fetch mock data from mockWorkflows.json
        //const mockResponse = await fetch('/mockWorkflows.json');
        const mockData =[]// await mockResponse.json(); //[];//
       // console.log('Fetched mock data:', mockData);

       let mockWorkflows = [];
console.log('Mock data fetch skipped or failed, using empty array');    
        if (Array.isArray(mockData)) {
            mockWorkflows = mockData;
        } else {
            console.warn('Unexpected mock data format:', mockData);
            mockWorkflows = [];
        }

        // Append mock workflows to SAP workflows
        const combinedWorkflows = [...sapWorkflows, ...mockWorkflows];
        console.log('Combined workflows:', combinedWorkflows);

        return combinedWorkflows;
        
    } catch (error) {
        console.error('SAP API Error in fetchSAPWorkflows:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            cachedToken = null;
            tokenExpiry = null;
            throw new Error('Authentication expired. Please refresh and try again.');
        } else if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
            throw new Error('Network error: Please check CORS configuration or use a proxy.');
        }
        
        throw new Error(`Failed to fetch workflows: ${error.message}`);
    }
}

export async function approveWorkflow(instanceId) {
    try {
        const accessToken = await getAccessToken();
        console.log(`Approving workflow ${instanceId}...`);
        
        const response = await axios.post(
            getApiUrl(`/http/postSAPdata?DecisionKey=0001&InstanceID=${instanceId}&Comments=Approved`),
            {},
            { 
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/xml,application/json',
                    'Content-Type': 'application/json'
                } 
            }
        );

        console.log('Approval response:', response.data);
        return response.data?.Status || 'COMPLETED';
        
    } catch (error) {
        console.error(`Error approving workflow ${instanceId}:`, error);
        throw new Error(`Failed to approve workflow ${instanceId}: ${error.message}`);
    }
}

export async function rejectWorkflow(instanceId) {
    try {
        const accessToken = await getAccessToken();
        console.log(`Rejecting workflow ${instanceId}...`);
        
        const response = await axios.post(
            getApiUrl(`/http/postSAPdata?DecisionKey=0002&InstanceID=${instanceId}&Comments=Rejected`),
            {},
            { 
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/xml,application/json',
                    'Content-Type': 'application/json'
                } 
            }
        );

        console.log('Rejection response:', response.data);
        return response.data?.Status || 'COMPLETED';
        
    } catch (error) {
        console.error(`Error rejecting workflow ${instanceId}:`, error);
        throw new Error(`Failed to reject workflow ${instanceId}: ${error.message}`);
    }
}