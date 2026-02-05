const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:password@127.0.0.1:5433/jewellery_saas?schema=public',
});
client.connect()
  .then(() => { console.log('Connected successfully'); client.end(); })
  .catch(e => { console.error('Connection failed', e); client.end(); });
