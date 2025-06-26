const express = require('express');
const path = require('path');
const app = express();

// Serve the static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});