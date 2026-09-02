const test = async () => {
  const url = 'https://xsgames.co/randomusers/avatar.php?g=male';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.headers.get('content-type'));
  } catch(e) {
    console.error(e);
  }
}
test();
