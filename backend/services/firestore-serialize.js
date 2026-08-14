function isFirestoreTimestamp(value) {
  return Boolean(value && typeof value.toDate === 'function' && typeof value.seconds === 'number');
}

export function serializeFirestoreValue(value) {
  if (isFirestoreTimestamp(value)) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeFirestoreValue(item)])
    );
  }

  return value;
}

export function serializeFirestoreDoc(docSnap) {
  if (!docSnap.exists) return null;
  return serializeFirestoreValue({ id: docSnap.id, ...docSnap.data() });
}

export function serializeFirestoreDocs(querySnapshot) {
  return querySnapshot.docs.map((docSnap) => serializeFirestoreDoc(docSnap)).filter(Boolean);
}
