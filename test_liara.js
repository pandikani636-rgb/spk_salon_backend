const test = async () => {
  const url = 'https://avatar.iran.liara.run/public/boy?username=6a8c56c56da44adbe05b825f';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.headers.get('content-type'));
  } catch(e) {
    console.error(e);
  }
}
test();
