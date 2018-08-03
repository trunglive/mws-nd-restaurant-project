import idb from 'idb';

const dbPromise = idb.open('test-db', 1, upgradeDb => {
  const keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put('Hello', 'World');
})

dbPromise.then(db => {
  const tx = db.transaction('keyval');
  const keyValStore = tx.objectStore('keyval');
  return keyValStore.get('hello');
}).then(val => {
  console.log('Value of hello is ' + val);
})

dbPromise.then(db => {
  const tx = db.transaction('keyval', 'readwrite');
  const keyValStore = tx.objectStore('keyval');
  keyValStore.put('bar', 'foo');
  return tx.complete;
}).then(() => {
  console.log('Added foo:bar to keyval');
})