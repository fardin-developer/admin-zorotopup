// Method 1: Using Promise.all() for concurrent requests
async function fetchConcurrentRequests() {
    const apiUrl = 'https://game.cptopup.in/api/v1/games/get-all';
    const numberOfRequests = 10;
    
    try {
      // Create an array of 10 fetch promises
      const fetchPromises = Array.from({ length: numberOfRequests }, (_, index) => 
        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers you need
          }
        }).then(request => ({
          requestIndex: index + 1,
          response: request,
          timestamp: Date.now()
        }))
      );
      
      console.log('Sending 10 concurrent requests...');
      const startTime = Date.now();
      
      // Execute all requests concurrently
      const results = await Promise.all(fetchPromises);
      
      const endTime = Date.now();
      console.log(`All requests completed in ${endTime - startTime}ms`);
      
      // Process results
      for (const result of results) {
        if (result.response.ok) {
          const data = await result.response.json();
          console.log(`Request ${result.requestIndex}: Success`, {
            status: result.response.status,
            timestamp: result.timestamp,
            dataLength: Array.isArray(data) ? data.length : 'N/A'
          });
        } else {
          console.error(`Request ${result.requestIndex}: Failed`, {
            status: result.response.status,
            statusText: result.response.statusText
          });
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error with concurrent requests:', error);
      throw error;
    }
  }
  
  // Method 2: Using Promise.allSettled() (handles failures gracefully)
  async function fetchConcurrentRequestsWithErrorHandling() {
    const apiUrl = 'https://game.oneapi.in.in/api/v1/games/get-all';
    const numberOfRequests = 10;
    
    const fetchPromises = Array.from({ length: numberOfRequests }, (_, index) => 
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(async response => ({
        requestIndex: index + 1,
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: response.ok ? null : response.statusText,
        timestamp: Date.now()
      })).catch(error => ({
        requestIndex: index + 1,
        success: false,
        status: null,
        data: null,
        error: error.message,
        timestamp: Date.now()
      }))
    );
    
    console.log('Sending 10 concurrent requests with error handling...');
    const startTime = Date.now();
    
    const results = await Promise.allSettled(fetchPromises);
    
    const endTime = Date.now();
    console.log(`All requests completed in ${endTime - startTime}ms`);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        console.log(`Request ${data.requestIndex}:`, {
          success: data.success,
          status: data.status,
          hasData: !!data.data,
          error: data.error
        });
      } else {
        console.error(`Request ${index + 1}: Promise rejected`, result.reason);
      }
    });
    
    return results;
  }
  
  // Method 3: For maximum concurrency (fires all at exact same moment)
  function fireSimultaneousRequests() {
    const apiUrl = 'https://api.leafstore.in/api/v1/games/get-all';
    const numberOfRequests = 10;
    
    console.log('Firing 10 simultaneous requests...');
    const startTime = Date.now();
    
    // Create all fetch promises at the exact same time
    const promises = [];
    for (let i = 0; i < numberOfRequests; i++) {
      promises.push(
        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(response => ({
          requestId: i + 1,
          timestamp: Date.now(),
          response
        }))
      );
    }
    
    return Promise.all(promises).then(results => {
      const endTime = Date.now();
      console.log(`All ${numberOfRequests} requests completed in ${endTime - startTime}ms`);
      return results;
    });
  }
  
  // Usage examples:
  console.log('=== Example Usage ===');
  
  // Run the concurrent requests
  fetchConcurrentRequests()
    .then(results => {
      console.log('Method 1 completed successfully');
    })
    .catch(error => {
      console.error('Method 1 failed:', error);
    });
  
  // Or use the error-handling version
  fetchConcurrentRequestsWithErrorHandling();
  
  // Or use the simultaneous version
  fireSimultaneousRequests();