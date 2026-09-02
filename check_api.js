import http from 'http';

http.get('http://localhost:5000/api/admin/users/6a8ec8e400c630baf94f91c0', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', (err) => console.log('Error:', err.message));
