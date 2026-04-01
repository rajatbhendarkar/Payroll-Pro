// Test this in your mobile app console or create a test button
const testLogin = async () => {
  try {
    const response = await fetch('https://payroll-backend-0rni.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rajat@gmail.com',
        password: 'Rajat123'
      })
    });
    
    const data = await response.json();
    console.log('Login test result:', data);
    return data;
  } catch (error) {
    console.error('Login test error:', error);
    return { error: error.message };
  }
};

// Call this function to test
testLogin();