const test = async () => {
  const url = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.headers.get('content-type'));
  } catch(e) {
    console.error(e);
  }
}
test();
